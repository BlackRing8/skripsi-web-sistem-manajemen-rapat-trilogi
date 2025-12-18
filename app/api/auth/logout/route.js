// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      // Tidak ada token berarti user belum login
      const res = NextResponse.json({ message: "No active session" }, { status: 200 });
      clearAuthCookies(res);
      return res;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    await prisma.user.update({
      where: { email },
      data: {
        accessToken: null,
        refreshToken: null,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
  const res = NextResponse.json({ message: "Logged out" });
  // hapus cookie dengan set maxAge=0

  clearAuthCookies(res);
  return res;
}

function clearAuthCookies(res) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  };

  res.cookies.set("token", "", cookieOptions);
  res.cookies.set("next-auth.session-token", "", cookieOptions);
  res.cookies.set("next-auth.csrf-token", "", cookieOptions);
  res.cookies.set("next-auth.callback-url", "", cookieOptions);
}
