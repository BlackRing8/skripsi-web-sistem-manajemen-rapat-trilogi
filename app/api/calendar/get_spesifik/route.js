import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { zonedTimeToUtc } from "date-fns-tz";

export async function GET(req) {
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

  // ambil parameter tanggal dari URL (misalnya ?date=2025-10-20)
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const monthView = searchParams.get("monthView") === "true";

  const today = dateParam ? new Date(dateParam) : new Date();
  const timeZone = "Asia/Jakarta";

  let startTime, endTime;

  if (monthView) {
    // Awal dan akhir bulan
    const startOfMonth = new Date("2000-01-01T00:00:00.000Z");
    const endOfMonth = new Date("2100-12-31T23:59:59.999Z");
    startTime = zonedTimeToUtc(startOfMonth, timeZone);
    endTime = zonedTimeToUtc(endOfMonth, timeZone);
  } else {
    // Awal dan akhir hari
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    startTime = zonedTimeToUtc(startOfDay, timeZone);
    endTime = zonedTimeToUtc(endOfDay, timeZone);
  }

  // const startOfDay = zonedTimeToUtc(`${selectedDate.toISOString().split("T")[0]} 00:00:00`, timeZone).toISOString();
  // const endOfDay = zonedTimeToUtc(`${selectedDate.toISOString().split("T")[0]} 23:59:59`, timeZone).toISOString();

  try {
    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      timeZone,
      singleEvents: true,
      orderBy: "startTime",
    });

    // untuk liat isi data
    // console.log(data.items);
    return NextResponse.json({ events: data.items || [] });
  } catch (error) {
    console.error("Error mengambil event:", error);
    return NextResponse.json({ error: "Gagal mengambil event Google Calendar" }, { status: 500 });
  }
}
