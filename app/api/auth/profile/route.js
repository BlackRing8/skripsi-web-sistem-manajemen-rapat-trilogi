import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userProfileTarget = session.user.id;

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: userProfileTarget },
      select: {
        email: true,
        name: true,
        unitJabatan: {
          select: {
            id: true,
            unit: { select: { nama: true } },
            jabatan: { select: { nama: true } },
          },
        },
      },
    });

    return NextResponse.json(userProfile);
  } catch (error) {}
  console.error("Error mengambil data profile", error);
  return Response.json({ error: "Gagal mengambil data profile" }, { status: 500 });
}

export async function PATCH(req) {
  try {
    // 1. Cek session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ambil data dari body
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }

    // 3. Update nama user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    });

    return NextResponse.json({
      msg: "Nama berhasil diperbarui",
      user: updatedUser,
    });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
