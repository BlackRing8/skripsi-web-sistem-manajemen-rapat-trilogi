"use client";
import { hasAccess } from "@/lib/access";
import { PERMISSIONS } from "@/lib/permission";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import format from "date-fns-tz/format";
import { Edit, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const { data: session } = useSession();
  // const bannedRoles = ["Staff", "Dosen"];
  // const isDisabled = session?.user?.jabatans?.some((j) => bannedRoles.includes(j));
  const isDisabled = !hasAccess(session?.user?.jabatans, PERMISSIONS.AGENDA_MANAGE);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const ambilAgendaPribadi = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/agenda");
        if (!res.ok) throw new Error("Gagala mengambil data agenda pribadi");
        const data = await res.json();
        console.log("DATA CLIENT:", data);

        // Urutkan berdasarkan tanggal terbaru
        const sorted = (Array.isArray(data) ? data : data.events || []).sort((a, b) => {
          const dateA = new Date(a.start?.dateTime || a.start?.date);
          const dateB = new Date(b.start?.dateTime || b.start?.date);
          return dateB - dateA;
        });

        setEvents(sorted);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    ambilAgendaPribadi();
  }, []);

  const handleEdit = (event) => {
    setSelectedEvent(event);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus agenda ini?")) return;

    try {
      await fetch(`/api/agenda/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Gagal menghapus event:", error);
    }
  };

  const safeFormat = (dateStr, formatStr = "dd MMM yyyy") => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "-";
      return format(date, formatStr);
    } catch {
      return "-";
    }
  };

  return (
    <div className="w-full  mt-5 px-5 flex flex-col gap-2 justify-center">
      {/* Ini button untuk pc */}
      <div className="hidden md:flex  flex-col gap-2">
        <h1 className="font-bold text-start text-2xl ">Daftar agenda yang kamu buat:</h1>
        <button
          disabled={isDisabled}
          onClick={() => {
            if (!isDisabled) {
              window.location.href = "/agenda/create_agenda";
            }
          }}
          className={`${isDisabled ? "bg-gray-600 text-white px-4 py-2 rounded-lg transition font-bold w-40" : "bg-blue-600 text-white px-4 py-2 rounded-lg  hover:bg-blue-700 transition font-bold w-40"}`}
        >
          {isDisabled ? "Akses Ditolak" : " + Buat agenda"}
        </button>
      </div>

      {/* Ini button versi mobile */}
      <div className="md:hidden flex justify-between items-center ">
        <h1 className="font-bold text-start text-2xl ">Daftar agenda yang kamu buat:</h1>
        <button
          disabled={isDisabled}
          onClick={() => {
            if (!isDisabled) {
              window.location.href = "/agenda/create_agenda";
            }
          }}
          className={`${isDisabled ? "bg-gray-600 text-white px-4 py-2 rounded-lg transition font-bold w-40" : "bg-blue-600 text-white px-4 py-2 rounded-lg  hover:bg-blue-700 transition font-bold w-40"}`}
        >
          {isDisabled ? "Akses Ditolak" : " + Buat agenda"}
        </button>
      </div>

      <div className="w-full mt-5 md:mt-0 gap-5 flex flex-wrap md:p-5 justify-center md:justify-start">
        {loading ? (
          <p className="text-gray-400">Memuat agenda...</p>
        ) : error ? (
          <p className="text-red-600">Terjadi kesalahan: {error}</p>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => {
              const key = event.id || `${event.summary}-${index}`;
              const start = event.start?.dateTime || event.start?.date || event.tanggalMulai;
              const end = event.end?.dateTime || event.end?.date || event.tanggalSelesai;

              const tanggal = safeFormat(start, "dd MMM yyyy");
              const waktuMulai = safeFormat(start, "HH:mm");
              const waktuSelesai = safeFormat(end, "HH:mm");

              return (
                <div key={key} className="p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md bg-white transition">
                  <div className="flex justify-between items-start">
                    {/* Info Agenda */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {event.summary || event.judul || "Tanpa Judul"}
                      </h2>
                      <p className="text-gray-600 mt-1">{tanggal}</p>
                      <p className="font-bold text-md text-gray-600 mt-1">
                        {waktuMulai} - {waktuSelesai}
                      </p>
                      {event.description || (event.deskripsi && <p className="text-gray-700 text-sm mt-2 mb-0 ">{event.description || event.deskripsi}</p>)}
                      <p className="mb-4">
                        <b>Lokasi rapat:</b> {event.lokasi}
                      </p>
                      <Link href={`/agenda/${event.googleEventId}`} className="py-2 px-4 bg-blue-500 rounded-lg text-white font-semibold">
                        Detail Rapat
                      </Link>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(event)} className="p-2 rounded-md hover:bg-gray-100 text-blue-600 transition">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 rounded-md hover:bg-gray-100 text-red-600 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">anda belum membuat agenda apa pun.</p>
        )}
      </div>

      {/* Modal Edit Agenda */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Agenda</h2>
            <p className="text-gray-600 mb-2">
              Event: <strong>{selectedEvent.judul}</strong>
            </p>

            {/* Form Edit Placeholder */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);

                const formData = new FormData(e.target);
                const updatedEvent = {
                  summary: formData.get("summary"),
                  description: formData.get("description"),
                  location: formData.get("location"),
                  start: {
                    dateTime: `${formData.get("date")}T${formData.get("startTime")}:00`,
                    timeZone: "Asia/Jakarta",
                  },
                  end: {
                    dateTime: `${formData.get("date")}T${formData.get("endTime")}:00`,
                    timeZone: "Asia/Jakarta",
                  },
                };

                try {
                  const res = await fetch(`/api/agenda/${selectedEvent.googleEventId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedEvent),
                  });

                  if (!res.ok) throw new Error("Gagal memperbarui agenda");

                  const result = await res.json();

                  // Update data lokal tanpa refetch semua
                  setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? { ...e, ...updatedEvent } : e)));

                  alert("Agenda berhasil diperbarui!");
                  setSelectedEvent(null);
                } catch (error) {
                  console.error(error);
                  alert("Terjadi kesalahan saat memperbarui agenda.");
                }
              }}
              className="space-y-3"
            >
              <input name="summary" type="text" defaultValue={selectedEvent.judul} className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <textarea name="description" defaultValue={selectedEvent.deskripsi || ""} className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Tempat</label>
                <input
                  name="location"
                  defaultValue={selectedEvent.location || selectedEvent.lokasi || ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedEvent.tanggalMulai ? new Date(selectedEvent.tanggalMulai).toISOString().slice(0, 10) : ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Mulai</label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={
                      selectedEvent.tanggalMulai
                        ? (() => {
                            const d = new Date(selectedEvent.tanggalMulai);
                            const hours = String(d.getHours()).padStart(2, "0");
                            const minutes = String(d.getMinutes()).padStart(2, "0");
                            return `${hours}:${minutes}`;
                          })()
                        : ""
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Selesai</label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={
                      selectedEvent.tanggalMulai
                        ? (() => {
                            const d = new Date(selectedEvent.tanggalSelesai);
                            const hours = String(d.getHours()).padStart(2, "0");
                            const minutes = String(d.getMinutes()).padStart(2, "0");
                            return `${hours}:${minutes}`;
                          })()
                        : ""
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => setSelectedEvent(null)} disabled={loading} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
