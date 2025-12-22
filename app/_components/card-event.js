"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CardEvent() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar/get");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Gagal fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchEvents();
  }, [session]);

  if (status === loading) return <p className="text-center mt-10">Memuat Agenda...</p>;
  return (
    <div>
      {loading ? (
        <p className="text-gray-400">Memuat agenda...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-400">Tidak ada Agenda Hari ini.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="border p-4 rounded-xl bg-slate-100">
              <h2 className="font-medium">{event.summary || "(Tanpa Judul)"}</h2>
              <h3>
                id Rapat: <b>{event.id}</b>
              </h3>
              <p>⏰ {new Date(event.start.dateTime).toLocaleTimeString("id-ID") || "Tidak ada waktu"}</p>
              {event.location && <p>📍 {event.location}</p>}
              {event.location && event.location == "google meet" && (
                <p>
                  link:{" "}
                  <Link href={event.hangoutLink} className="underline text-blue-500" target="_blank" rel="noopener noreferrer">
                    {event.hangoutLink}
                  </Link>
                </p>
              )}
              {/* ✅ Tombol menuju halaman detail rapat */}
              <Link href={`/agenda/${event.id}`} className="mt-3 inline-block text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">
                Detail Rapat
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
