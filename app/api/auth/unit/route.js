import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  // Ambil seluruh data unit
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { unit, jabatan } = body;

  const idUser = session.user.id;

  console.log("data diterima dari backend", body);

  try {
    const lengkapiProfile = await prisma.user.update({
      where: { id: idUser },
      data: {
        unit: unit,
        jabatan: jabatan,
      },
    });

    return NextResponse.json({ success: true, lengkapiProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Gagal memperbarui profile" }, { status: 500 });
  }
}
