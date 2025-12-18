import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, context) {
  // cek session untuk ambil data user
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ambil google event id dari parameter url

  const { rapatId } = await context.params; //contoh:  value = 7keh40o6vlrl7lsv7ml2o4170o

  // // Ambil user id dari session
  // const userId = session.user.id; // contoh: value = 2

  // Ambil status yang dikirim
  const { pesertaId, status } = await req.json();

  console.log("data diterima backend:", { pesertaId, status });

  const validStatus = ["HADIR", "IZIN", "TIDAK_HADIR"];
  if (!validStatus.includes(status)) {
    return NextResponse.json({ error: "Status absensi tidak valid" }, { status: 400 });
  }

  try {
    // cek dlu data rapatnya
    const rapat = await prisma.rapat.findFirst({
      where: { googleEventId: rapatId },
      include: {
        peserta: true,
      },
    });

    if (!rapat) {
      return NextResponse.json({ error: "Rapat tidak ditemukan" }, { status: 404 });
    }

    // // cek udah mulai atau belum rapatnya
    // const now = new Date();
    // if (now < rapat.tanggalMulai) {
    //   return NextResponse.json({ error: "Absensi hanya bisa dilakukan saat rapat dimulai." }, { status: 400 });
    // }

    // kita cek peserta yang absen terdaftar ga di rapat ini
    const peserta = await prisma.rapatPeserta.findFirst({
      where: {
        rapatId: rapat.id,
        userId: pesertaId,
      },
    });

    if (!peserta) {
      return NextResponse.json({ error: "Peserta tidak terdaftar di rapat ini" }, { status: 403 });
    }

    const updateAbsen = await prisma.rapatPeserta.updateMany({
      where: { rapatId: rapat.id, userId: pesertaId },
      data: { status: status, waktuAbsen: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dicatat.",
      peserta: updateAbsen,
    });
  } catch (error) {
    console.error("Error saat mencatat absen:", error);
  }
}
