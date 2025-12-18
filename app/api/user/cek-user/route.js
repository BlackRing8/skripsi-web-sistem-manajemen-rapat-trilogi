import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  // Ambil session untuk cek id nya di database
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "unhauthorized" }, { status: 401 });
  }

  const idUser = session.user.id;

  const cekUser = await prisma.user.findUnique({
    where: { id: idUser },
  });

  return Response.json(cekUser);
}
