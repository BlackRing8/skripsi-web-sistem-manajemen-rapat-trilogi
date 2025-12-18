import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file"); // Excel file
  const rapatId = parseInt(formData.get("rapatId"));
  const peserta = JSON.parse(formData.get("peserta") || "[]"); // array emails

  // Ambil user & token dari db/session
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2.setCredentials({ access_token: session.user.accessToken, refresh_token: session.user.refreshToken });

  const drive = google.drive({ version: "v3", auth: oauth2 });

  // 1) Upload & convert Excel -> Google Spreadsheet
  const buffer = Buffer.from(await file.arrayBuffer());
  const media = { mimeType: file.type, body: Buffer.from(buffer) };
  const res = await drive.files.create({
    requestBody: { name: `Notulen - ${rapatId}`, mimeType: "application/vnd.google-apps.spreadsheet" },
    media,
    fields: "id",
  });
  const fileId = res.data.id;

  // 2) Set sharing permission writer untuk tiap peserta (kecuali jika peserta sama dg pembuat)
  for (const email of peserta) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: "writer", type: "user", emailAddress: email },
        sendNotificationEmail: false, // atau true kalau mau kirim email notifikasi Drive
      });
    } catch (err) {
      console.warn("perm error", email, err.message);
    }
  }

  // 3) Ambil webViewLink
  const meta = await drive.files.get({ fileId, fields: "webViewLink" });
  const fileUrl = meta.data.webViewLink;

  // 4) Simpan ke DB
  await prisma.notulen.create({
    data: { rapatId, fileId, fileUrl, dibuatOleh: user.id },
  });

  return NextResponse.json({ success: true, fileId, fileUrl });
}
