"use client";
import { useSession } from "next-auth/react";

import { isSameDay } from "date-fns";

import { useState, useEffect } from "react";
import CardEvent from "@/app/_components/card-event";

export default function DashboardLayoutTesting() {
  const { data: session } = useSession();
  const [rapatList, setRapatList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // Ambil daftar semua event bulan ini (untuk menandai tanggal di kalender)
  useEffect(() => {
    async function fetchAllEvents() {
      const res = await fetch("/api/calender/get_spesifik?monthView=true");
      const data = await res.json();
      setRapatList(Array.isArray(data.events) ? data.events : []);
    }
    fetchAllEvents();
  }, []);

  // Ambil event sesuai tanggal yang dipilih
  useEffect(() => {
    async function fetchEventsByDate() {
      const dateStr = selectedDate.toLocaleDateString("en-CA");

      const res = await fetch(`/api/calendar/get_spesifik?date=${dateStr}`);
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    }
    fetchEventsByDate();
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 max-h-[85vh] ">
      {/* container yang kiri */}
      <div className="w-full rounded-4xl grid-cols-1 ">
        <div className="rounded-4xl p-4 mb-8">
          <h1 className="font-semibold text-4xl">
            Selamat datang kembali, {session.user?.name}!<br></br> Apa rencana mu hari ini?
          </h1>
        </div>
        <div className="w-full bg-white rounded-4xl p-12 space-y-4">
          <h2 className="font-bold text-2xl">Agenda hari ini:</h2>
          <CardEvent />
        </div>
      </div>

      {/* Container yang kanan */}
      <div className="w-full ">
        <div className="p-6 bg-white rounded-4xl">
          <h2 className="text-xl font-bold mb-4">Kalender Agenda Bulanan ({selectedDate.toLocaleDateString("id-ID")})</h2>
          {/* <img src={session.user.image} alt="profile" className="w-12 h-12 rounded-full" /> */}
          {/* Kalender tanggal sederhana */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {Array.from({ length: 30 }, (_, i) => {
              const date = new Date(2025, 9, i + 1);
              const hasAgenda = rapatList.some((r) => isSameDay(new Date(r.start?.dateTime || r.start?.date), date));

              return (
                <button key={i} onClick={() => setSelectedDate(date)} className={`p-2 rounded-lg text-sm ${isSameDay(selectedDate, date) ? "bg-blue-500 text-white" : hasAgenda ? "bg-green-100" : "bg-gray-100"}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Daftar agenda di tanggal terpilih */}
          <div>
            {events.length > 0 ? (
              events.map((ev) => (
                <div key={ev.id} className="p-3 mb-2 rounded-lg bg-gray-50 border border-gray-200">
                  <h3 className="font-semibold">{ev.summary || "Tanpa Judul"}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.start?.dateTime || ev.start?.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(ev.end?.dateTime || ev.end?.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada agenda pada tanggal ini.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
