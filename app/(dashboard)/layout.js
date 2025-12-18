"use client";
import { Sidebar } from "../_components/sidebar";
import { Navbar } from "../_components/navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "next-auth/react";

const DashboardLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    const ambilUnit = async () => {
      try {
        const res = await fetch("/api/user/cek-user");
        if (!res.ok) throw new Error("Gagal mengambil data rapat");
        const dataUnit = await res.json();

        if (dataUnit.profileCompleted === false) {
          router.push("/complete_profile");
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    ambilUnit();
  }, []);

  if (status === "loading") {
    return (
      <div className="max-h-screen ">
        <div className="h-[90px] md:pl-56 fixed inset-y-0 w-full z-50">
          <Navbar />
        </div>
        <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50 bg-red-500">
          <Sidebar />
        </div>
        <main className="md:pl-56 pt-[90px] h-screen flex items-center justify-center">
          {" "}
          <div className="">
            <p className=" text-xl ">Memuat data akun...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className=" ">
      <div className="h-20 md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-auto flex-col fixed inset-y-0 z-50 ">
        <Sidebar />
      </div>
      <main className="md:pl-64 pt-[90px] h-full ">{children}</main>
    </div>
  );
};

export default DashboardLayout;
