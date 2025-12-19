"use client";
import { useSession } from "next-auth/react";

import { isSameDay, startOfMonth, endOfMonth } from "date-fns";

import { useState, useEffect, useMemo } from "react";
import CardEvent from "@/app/_components/card-event";

export default function DashboardLayout() {
  const { data: session } = useSession();
  const [rapatList, setRapatList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // untuk ubah bulan di panel
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => new Date(currentYear, currentMonth, i + 1));

  // ini codingan yang lama
  // const daysInMonth = useMemo(() => {
  //   const now = new Date(); // Oktober 2025 (ingat: index bulan mulai dari 0)
  //   return Array.from({ length: endOfMonth(now).getDate() }, (_, i) => new Date(now.getFullYear(), now.getMonth(), i + 1));
  // }, []);

  // Ambil daftar semua event bulan ini (untuk menandai tanggal di kalender)
  useEffect(() => {
    const fetchMonthEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/calendar/get_spesifik?monthView=true");
        if (!res.ok) throw new Error("Gagal mengambil data bulan ini");
        const data = await res.json();
        setRapatList(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthEvents();
  }, []);

  // Ambil event sesuai tanggal yang dipilih
  useEffect(() => {
    const fetchDayEvents = async () => {
      try {
        setLoading(true);
        const dateStr = selectedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
        const res = await fetch(`/api/calendar/get_spesifik?date=${dateStr}`);
        if (!res.ok) throw new Error("Gagal mengambil event tanggal ini");
        const data = await res.json();

        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDayEvents();
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5  ">
      {/* container yang kiri */}
      <div className="w-full rounded-4xl grid-cols-1 ">
        <div className="rounded-4xl p-4 mb-3">
          <h1 className="font-semibold text-4xl">
            Selamat datang kembali, <b className="text-blue-700">{session.user?.name}!</b>
            <br></br> Apa rencana mu hari ini?
          </h1>
        </div>
        <div className="w-full flex flex-col bg-white rounded-4xl p-8 space-y-4 md:h-125 overflow-y-auto">
          <h2 className="font-bold text-2xl">Agenda hari ini:</h2>
          {events.length > 0 ? <CardEvent /> : <p className="text-gray-400">Tidak ada agenda hari ini.</p>}
        </div>
      </div>

      {/* Container yang kanan */}
      <div className="w-full ">
        <div className="p-6 bg-white rounded-4xl">
          <h2 className="text-xl md:text-3xl font-bold  text-blue-800">History Agenda Bulan ini ({selectedDate.toLocaleDateString("id-ID")})</h2>

          <div className="flex w-full h-10 my-8 md:my-4 items-center pl-2 gap-2">
            <div className="flex">
              <div className="w-6 h-6 bg-yellow-300 rounded-full"></div>
              <p className="ml-2 text-sm md:text-md"> Terdapat Agenda</p>
            </div>
            <div className="flex">
              <div className="w-6 h-6  bg-blue-500 rounded-full"></div>
              <p className="ml-2 text-sm md:text-md">Tanggal dipilih</p>
            </div>
            <div className="flex">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <p className="ml-2 text-sm md:text-md">Tidak ada </p>
            </div>
          </div>

          {/* Navigasi Bulan */}
          <div className="flex justify-between items-center mb-4 mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
            >
              ←
            </button>

            <h2 className="text-xl font-bold">
              {new Date(currentYear, currentMonth).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <button
              className="px-3 py-1 bg-gray-200 rounded-lg"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            >
              →
            </button>
          </div>

          {/* Kalender tanggal sederhana */}
          <div className="grid grid-cols-7 gap-3 mb-6">
            {daysInMonth.map((date, idx) => {
              const hasAgenda = rapatList.some((r) => isSameDay(new Date(r.start?.dateTime || r.start?.date), date));

              const isSelected = isSameDay(selectedDate, date);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, date.getDate()))}
                  className={`flex justify-center items-center p-2 
          w-8 h-8 md:w-12 md:h-12 font-bold rounded-full 
          text-md md:text-xl transition-all duration-200
          ${isSelected ? "bg-blue-500 text-white scale-105 shadow-md" : hasAgenda ? "bg-yellow-300 hover:bg-green-300" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Daftar agenda di tanggal terpilih */}
          <div>
            {loading ? (
              <p className="text-gray-400">Memuat agenda...</p>
            ) : error ? (
              <p className="text-red-600">Terjadi kesalahan: {error}</p>
            ) : events.length > 0 ? (
              events.map((eventData) => (
                <div key={eventData.id} className="p-3 mb-2 rounded-lg bg-purple-800 border border-gray-200 hover:bg-purple-700 transition-all">
                  <h2 className="font-semibold text-white">{eventData.summary || "Tanpa Judul"}</h2>
                  <h3 className="text-white text-xs">Rapat ID: {eventData.id}</h3>
                  <p className="text-sm text-white">
                    {new Date(eventData.start?.dateTime || eventData.start?.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(eventData.end?.dateTime || eventData.end?.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {/* <p className="text-white">🔥 Attachment</p> */}
                  {Array.isArray(eventData.attachments) && eventData.attachments.length > 0 ? (
                    <div className="mt-3 bg-white p-2 rounded-lg text-sm">
                      <p className="font-semibold text-black mb-1">Lampiran:</p>
                      {eventData.attachments.map((file, idx) => (
                        <div key={idx} className="flex flex-col text-black">
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                            📎 {file.title || "Lampiran tanpa nama"}
                          </a>
                          <p className="text-xs text-gray-600">{file.mimeType}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 bg-white p-2 rounded-lg text-sm">
                      {" "}
                      <p>Tidak ada lampiran</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-20 items-center flex">
                <p className="text-gray-500 font-bold text-xl">Tidak ada agenda pada tanggal ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
