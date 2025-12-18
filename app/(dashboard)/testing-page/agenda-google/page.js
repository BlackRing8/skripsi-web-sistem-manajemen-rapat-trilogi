"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function AgendaGooglepage() {
  const { data: session } = useSession();
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

  if (loading) return <p className="text-center mt-10">Memuat event...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded-lg shadow">
      <h1 className="text-xl font-semibold mb-4">📅 Event dari Google Calendar</h1>
      {events.length === 0 ? (
        <p>Tidak ada event mendatang.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="border p-3 rounded">
              <h2 className="font-medium">{event.summary || "(Tanpa Judul)"}</h2>
              <p>⏰ {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString("id-ID") : "Tidak ada waktu"}</p>
              {event.location && <p>📍 {event.location}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
