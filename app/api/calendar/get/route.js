import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  // Ambil session login user
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pastikan accessToken tersedia
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Missing access token" }, { status: 402 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Ambil daftar event dari kalender utama user
    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      timeZone: "Asia/Jakarta", // mulai dari waktu sekarang
      maxResults: 20, // jumlah maksimal event
      singleEvents: true,
      orderBy: "startTime",
    });
    console.log(data);
    return Response.json({ events: data.items || [] });
  } catch (error) {
    console.error("Error mengambil event:", error);
    return Response.json({ error: "Gagal mengambil event Google Calendar" }, { status: 500 });
  }
}
