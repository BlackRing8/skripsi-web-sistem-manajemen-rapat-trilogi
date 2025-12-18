import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ambil agenda dari google calendar yang kita buat.
export async function GET() {
  // Ambil session login user
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "unhauthorized" }, { status: 401 });
  }

  // Pastikan accesToken
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Missing access token" }, { status: 402 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth });

  try {
    // ambil data dari google calendar
    const { data } = await calendar.events.list({
      calendarId: "primary",
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });

    const googleEvents = data.items.filter((event) => event.creator?.email === session.user.email);

    // 🔹 Ambil semua agenda dari DB lokal yang punya googleId
    const localAgendas = await prisma.rapat.findMany({
      where: { pembuatId: session.user.id },
      include: {
        notulen: true,
      },
    });

    // 🔹 Gabungkan data dari Google Calendar + DB
    const merged = googleEvents.map((event) => {
      const local = localAgendas.find((a) => a.googleEventId === event.id);
      return {
        ...event,
        notulen: local?.notulen,
      };
    });

    // sedang di ubah menjadi data yg ada di database dlu sementara
    // console.log(localAgendas);
    return NextResponse.json(JSON.parse(JSON.stringify(localAgendas)));
  } catch (error) {
    console.error("Error mengambil event:", error);
    return NextResponse.json({ error: "Gagal mengambil event Google Calendar" }, { status: 500 });
  }
}
