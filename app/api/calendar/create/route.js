import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { z } from "zod";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";

function formatForGoogleCalendar(date) {
  const pad = (n) => String(n).padStart(2, "0");

  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":00";
}

// Validasi Schema

const agendaSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional(),
  tanggalMulai: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggalMulai tidak valid",
  }),
  tanggalSelesai: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggalSelesai tidak valid",
  }),
  lokasi: z.string().optional(),
  linkMeeting: z.string().optional(),
  peserta: z
    .array(z.string())
    .optional()
    .transform((arr) => {
      if (!arr) return [];
      return Array.from(
        new Set(
          arr
            .map((s) => (s || "").trim())
            .filter((s) => s !== "")
            .map((s) => s.toLowerCase())
        )
      );
    })
    .refine((arr) => arr.every((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)), {
      message: "Semua peserta harus dalam format email yang valid",
    }),
});

async function buatNotulenOtomatis(auth, agenda, pesertaEmails) {
  const drive = google.drive({ version: "v3", auth });

  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // 1️⃣ Copy template
  const copyResponse = await drive.files.copy({
    fileId: process.env.GOOGLE_TEMPLATE_NOTULEN_ID,
    requestBody: {
      name: `Notulen - ${agenda.judul}`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
  });

  const newFileId = copyResponse.data.id;

  // 2️⃣ Beri akses ke peserta
  for (const email of pesertaEmails) {
    await drive.permissions.create({
      fileId: newFileId,
      requestBody: {
        role: "writer", // atau "reader"
        type: "user",
        emailAddress: email,
      },
      sendNotificationEmail: true,
    });
  }

  // 3️⃣ Simpan fileId ke database
  await prisma.notulen.create({
    data: {
      rapatId: agenda.id,
      fileId: newFileId,
      fileUrl: `https://docs.google.com/spreadsheets/d/${newFileId}/edit`,
      dibuatOleh: user.id,
    },
  });

  return newFileId;
}

// ✅ POST: buat rapat baru di database dan Google calender
// ✅ POST: buat rapat baru di database dan Google calendar
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const auth = new google.auth.OAuth2();

  const accessToken = session?.accessToken;
  const refreshToken = session?.refreshToken;

  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const data = agendaSchema.parse(body);
    const pesertaEmails = body.peserta || [];

    const tanggalMulaiUTC = zonedTimeToUtc(data.tanggalMulai, "Asia/Jakarta");

    const tanggalSelesaiUTC = zonedTimeToUtc(data.tanggalSelesai, "Asia/Jakarta");

    // Buat rapat lokal
    const agenda = await prisma.rapat.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi,
        tanggalMulai: tanggalMulaiUTC,
        tanggalSelesai: tanggalSelesaiUTC,
        lokasi: data.lokasi,
        linkMeeting: data.linkMeeting,
        pembuatId: user.id,
        pesertaEmails: pesertaEmails.length ? pesertaEmails : null,
      },
    });

    // buat relasi peserta yg ada di DB
    if (pesertaEmails.length > 0) {
      const users = await prisma.user.findMany({
        where: { email: { in: pesertaEmails } },
        select: { id: true, email: true },
      });

      if (users.length > 0) {
        const createData = users.map((u) => ({
          rapatId: agenda.id,
          userId: u.id,
          status: "DIUNDANG",
        }));
        await prisma.rapatPeserta.createMany({
          data: createData,
          skipDuplicates: true,
        });
      }
    }

    // Buat event Google Calendar
    let calendarEvent = null;
    const calendar = google.calendar({ version: "v3", auth });

    try {
      const eventBody = {
        summary: agenda.judul,
        description: agenda.deskripsi ?? "",
        start: {
          dateTime: formatForGoogleCalendar(agenda.tanggalMulai),
          timeZone: "Asia/Jakarta",
        },
        end: {
          dateTime: formatForGoogleCalendar(agenda.tanggalSelesai),
          timeZone: "Asia/Jakarta",
        },

        location: agenda.lokasi,
        attendees: pesertaEmails.map((email) => ({ email })),
      };

      if (agenda.lokasi?.toLowerCase().includes("meet")) {
        eventBody.conferenceData = {
          createRequest: {
            requestId: "meet-" + Date.now(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
      }

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventBody,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.hangoutLink;

      await prisma.rapat.update({
        where: { id: agenda.id },
        data: { linkMeeting: meetLink, googleEventId: response.data.id },
      });

      calendarEvent = response.data;
    } catch (calendarError) {
      console.log("❌ Gagal membuat event Google Calendar", calendarError);
    }

    // Buat notulen otomatis
    let fileIdNotulen = null;
    try {
      fileIdNotulen = await buatNotulenOtomatis(auth, agenda, pesertaEmails);
    } catch (err) {
      console.error("❌ Gagal membuat notulen otomatis:", err);
    }

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐  Tambahkan Notulen sebagai ATTACHMENT  ⭐
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    if (calendarEvent?.id && fileIdNotulen) {
      try {
        await calendar.events.patch({
          calendarId: "primary",
          eventId: calendarEvent.id,
          supportsAttachments: true,
          requestBody: {
            attachments: [
              {
                fileUrl: `https://drive.google.com/open?id=${fileIdNotulen}`,
                title: `Notulen - ${agenda.judul}`,
                mimeType: "application/vnd.google-apps.spreadsheet",
              },
            ],
          },
        });
        console.log("📎 Notulen berhasil ditambahkan ke event Calendar!");
      } catch (attachmentError) {
        console.error("❌ Gagal menambahkan attachment ke Calendar:", attachmentError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Agenda Rapat berhasil dibuat",
      agenda,
      calendarEvent,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
