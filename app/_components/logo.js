"use client";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Logo = () => {
  // const [role, setRole] = useState(null);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     try {
  //       const decoded = jwtDecode(token);
  //       setRole(decoded.role);
  //     } catch (error) {
  //       console.error("Invalid token", error);
  //     }
  //   }
  // });
  // // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // // if (token) {
  // //   try {
  // //     const decoded = jwtDecode(token);
  // //     role = decoded.role;
  // //   } catch (error) {
  // //     console.error("Invalid token", error);
  // //   }
  // // }

  // const dashboardLink = role === "PIMPINAN_UNIT" ? "/dashboard/pimpinan" : role === "ANGGOTA_RAPAT" ? "/dashboard/anggota" : "/";

  return (
    <Link href="/" className="flex w-full m-3.5">
      <Image src="/logo/logo-trilogi.jpg" alt="logo-trilogi" height={50} width={50} className="rounded-full " />
      <h1 className="font-bold text-2xl item mt-1 ml-1">TRILOGI APP</h1>
    </Link>
  );
};
