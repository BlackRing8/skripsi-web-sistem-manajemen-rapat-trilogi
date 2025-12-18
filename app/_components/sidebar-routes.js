"use client";
import { Calendar, Compass, Library, Users, CalendarCheck } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

const userRoutes = [
  {
    label: "Dashboard",
    icon: Compass,
    href: "/panel",
  },
  {
    label: "Agenda Rapat",
    icon: Calendar,
    href: "/agenda",
  },
  {
    label: "Manajemen Anggota",
    icon: Users,
    href: "/manajemen",
  },
  {
    label: "Notulen dan dokumen",
    icon: Library,
    href: "/notulen",
  },
];

const SidebarRoutes = () => {
  const pathname = usePathname();

  const isPimpinanPage = pathname?.includes("/");

  const routes = isPimpinanPage ? userRoutes : anggotaRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      ))}
    </div>
  );
};

export default SidebarRoutes;
