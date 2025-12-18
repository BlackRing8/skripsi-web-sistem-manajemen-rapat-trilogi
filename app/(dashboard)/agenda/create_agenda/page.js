"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import FormEvent from "@/app/_components/form-event";

export default function CreateAgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const bannedRoles = ["Staff", "Dosen"];
  useEffect(() => {
    // Pastikan session sudah loaded
    if (status === "loading") return;

    const isBanned = session?.user?.jabatans?.some((j) => bannedRoles.includes(j));

    if (isBanned) {
      router.replace("/agenda"); // gunakan replace biar tidak bisa back
    }
  }, [session, status, router]);

  // Selama session loading → tampilkan loading
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Jangan render page jika user banned (redirect sedang berjalan)
  const isBanned = session?.user?.jabatans?.some((j) => bannedRoles.includes(j));
  if (isBanned) return null;

  // ------------------------------------------- //

  // Variabel ini untuk form membuat agenda

  return (
    <div className="w-full">
      <FormEvent />
    </div>
  );
}
