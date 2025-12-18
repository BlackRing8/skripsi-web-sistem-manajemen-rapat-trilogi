import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const { rapatId } = await context.params;

  try {
    const detailRapat = await prisma.rapat.findUnique({
      where: { googleEventId: rapatId },
      include: {
        pembuat: true,
        peserta: {
          include: {
            user: true,
          },
        },
        notulen: true,
      },
    });

    if (!detailRapat) {
      return NextResponse.json({ error: "rapat tidak ditemukan" }, { status: 404 });
    }

    console.log("NOW WIB       :", new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
    console.log("NOW RAW       :", new Date());
    console.log("START RAW     :", new Date(detailRapat.tanggalMulai));
    console.log("COMPARE       :", new Date() >= new Date(detailRapat.tanggalMulai));
    return NextResponse.json(detailRapat);
  } catch (error) {
    console.error("gagal mengambil detail rapat", error);
    return Response.json({ error: "Gagal mengambil detail rapat" }, { status: 500 });
  }
}
