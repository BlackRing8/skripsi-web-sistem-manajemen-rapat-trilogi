"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotulenPage() {
  const [rapats, setRapats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRapats = async () => {
      try {
        const res = await fetch("/api/agenda");
        const data = await res.json();
        setRapats(data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRapats();
  }, []);

  if (loading) return <p className="text-center font-semibold text-3xl">Loading data...</p>;

  return (
    <div className="p-8  max-w-3xl  ">
      <h1 className="text-2xl font-bold mb-4">Daftar Histori rapat dan Dokumen rapat</h1>
      {rapats.length === 0 ? (
        <p>Tidak Dokumen dan Histori rapat.</p>
      ) : (
        <ul className="space-y-4">
          {rapats.map((rapat) => (
            <li key={rapat.id} className="p-4 border rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-2">{rapat.judul}</h2>
              <p className="text-md my-2">{rapat.deskripsi}</p>
              <p className="text-md my-2">
                {new Date(rapat.tanggalMulai).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(rapat.tanggalSelesai).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                Lokasi Rapat : <b className="font-semibold">{rapat.lokasi}</b>
              </p>
              {rapat.lokasi && rapat.lokasi == "google meet" && (
                <Link href={rapat.linkMeeting} className="underline text-blue-500" target="_blank" rel="noopener noreferrer">
                  {rapat.linkMeeting}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
