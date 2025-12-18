import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

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

    // 🔥 Ambil hanya rapat yang user ikuti sebagai peserta OR sebagai pembuat
    const rapatList = await prisma.rapat.findMany({
      where: {
        OR: [{ pembuatId: user.id }, { peserta: { some: { userId: user.id } } }],
      },
      include: {
        peserta: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        notulen: true,
      },
      orderBy: { tanggalMulai: "desc" },
    });

    const filteredRapat = rapatList.map((rapat) => {
      // cek apakah user adalah pembuat
      const isPembuat = rapat.pembuatId === user.id;

      // cek apakah user adalah peserta dengan status hadir
      const pesertaUser = rapat.peserta.find((p) => p.userId === user.id);
      const isHadir = pesertaUser?.status === "HADIR";

      let notulen = null;
      if (isPembuat || isHadir) {
        notulen = rapat.notulen;
      }

      return {
        ...rapat,
        notulen, // hanya tampil jika punya akses
      };
    });
    return NextResponse.json(filteredRapat, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}
