import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";

// 🔹 PATCH — Edit agenda
export async function PATCH(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const { googleId } = params;

  const body = await req.json();

  const { summary, description, location, start, end } = body;
  const accessToken = session?.accessToken;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth });

  try {
    // Update di Google Calendar
    await calendar.events.patch({
      calendarId: "primary",
      eventId: googleId,
      requestBody: {
        summary,
        description,
        location,
        start: {
          dateTime: new Date(start.dateTime).toISOString(),
        },
        end: {
          dateTime: new Date(end.dateTime).toISOString(),
        },
      },
    });

    // 🔹 Konversi WIB → UTC untuk DB
    const startUTC = zonedTimeToUtc(start.dateTime, "Asia/Jakarta");
    const endUTC = zonedTimeToUtc(end.dateTime, "Asia/Jakarta");

    // Update di database lokal
    const updatedAgenda = await prisma.rapat.update({
      where: { googleEventId: googleId },
      data: {
        judul: summary,
        deskripsi: description,
        lokasi: location,
        tanggalMulai: startUTC,
        tanggalSelesai: endUTC,
      },
    });

    return NextResponse.json({ success: true, agenda: updatedAgenda });
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json({ error: "Gagal memperbarui agenda" }, { status: 500 });
  }
}

// 🔹 DELETE — Hapus agenda
export async function DELETE(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const { googleId } = params;

  const accessToken = session?.accessToken;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth });

  try {
    // Hapus dari Google Calendar
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleId,
    });

    // Hapus dari database lokal

    const rapat = await prisma.rapat.findUnique({
      where: { googleEventId: googleId },
    });

    if (rapat) {
      await prisma.notulen.deleteMany({
        where: { rapatId: rapat.id },
      });

      await prisma.rapat.delete({
        where: { id: rapat.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    return NextResponse.json({ error: "Gagal menghapus agenda" }, { status: 500 });
  }
}
