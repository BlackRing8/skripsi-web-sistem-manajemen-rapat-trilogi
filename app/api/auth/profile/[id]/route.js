import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/route";
import { NextResponse } from "next/server";

export async function DELETE(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unhautorized" }, { status: 401 });

  const { id } = await context.params;
  console.log("id to delete:", id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const userTarget = session.user.id;
  try {
    // cek jabatan ini milik user yg login atau bukan
    const cekData = await prisma.userUnitJabatan.findFirst({
      where: {
        id: Number(id),
        userId: userTarget,
      },
    });

    if (!cekData) {
      return NextResponse.json({ error: "Data tidak ditemukan atau bukan milik user" }, { status: 404 });
    }

    // 3. Hapus data
    const deleteJabatan = await prisma.userUnitJabatan.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      msg: "Unit & jabatan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error menghapus unit jabatan:", error);
  }
}
