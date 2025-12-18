"use client";
import { Logo } from "./logo";
import SidebarRoutes from "./sidebar-routes";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const Sidebar = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-full  flex flex-col overflow-y-auto w-64 bg-sky-200 shadow-sm overflow-x-hidden">
        <div className="">
          <Logo />
        </div>
        <div className="flex-col w-full h-60 ">
          <div className="flex w-full h-44 ">
            <div className="w-40 h-40 rounded-full border-gray-400 border bg-gray-200 m-auto justify-center items-start flex-col pt-5">
              <div className="w-15 h-15 rounded-full bg-white mx-auto"></div>
              <div className="w-20 h-15 rounded-t-full bg-white mx-auto"></div>
            </div>
          </div>
          <div className="flex w-full h-16">
            <h1 className="font-bold text-center my-auto mx-auto text-gray-500 ">Memuat data...</h1>
          </div>
        </div>
        <div className="flex flex-col w-full ">
          <SidebarRoutes />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full  flex flex-col overflow-y-auto w-64 bg-sky-200 shadow-sm overflow-x-hidden">
      <div className="">
        <Logo />
      </div>
      <div className="flex-col w-full h-60 mb-2">
        <div className="flex w-full h-44 ">
          <img src={session.user?.image} className="w-40 h-40 rounded-full border-white border-8 bg-gray-200 m-auto" />
        </div>
        <div className="flex flex-col w-full h-16 px-2">
          <h1 className="font-bold text-center w-full text-xl">{session.user?.name}</h1>
          <Link href="/profile" className="text-center text-blue-700 font-semibold underline">
            Lihat Profile
          </Link>
        </div>
      </div>
      <div className="flex flex-col w-full mt-4">
        <SidebarRoutes />
      </div>
    </div>
  );
};
