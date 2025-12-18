"use client";
import { useState, useEffect } from "react";

export default function NotulenPage() {
  const [rapatList, setRapatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRapat = async () => {
      try {
        const res = await fetch("/api/notulen/view");
        if (!res.ok) throw new Error("Gagal mengambil data rapat");
        const data = await res.json();
        setRapatList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRapat();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600">Memuat data rapat...</div>;

  if (error) return <div className="text-red-600 text-center mt-10">Terjadi kesalahan: {error}</div>;

  return (
    <div className="min-h-screen  p-3">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">📅 Database Daftar Rapat dan Notulen</h1>

        {rapatList.length === 0 ? (
          <p className="text-gray-600 text-center">Belum ada rapat.</p>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Judul</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  {/* <th className="px-4 py-3 text-left">Lokasi</th> */}
                  {/* <th className="px-4 py-3 text-left">Status</th> */}
                  <th className="px-4 py-3 text-left">Notulen</th>
                </tr>
              </thead>
              <tbody>
                {rapatList.map((rapat) => (
                  <tr key={rapat.id} className="border-b last:border-none hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{rapat.judul}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(rapat.tanggalMulai).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    {/* <td className="px-4 py-3 text-gray-600">{rapat.lokasi || "-"}</td> */}
                    {/* <td>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${rapat.status === "SELESAI" ? "bg-green-100 text-green-700" : rapat.status === "DIBATALKAN" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {rapat.status}
                      </span>
                    </td> */}
                    <td className="px-4 py-3">
                      {rapat.notulen ? (
                        <div className="space-y-2 md:space-y-0 md:space-x-2 grid md:flex md:flex-wrap">
                          <a href={rapat.notulen.fileUrl} target="_blank" rel="noopener noreferrer" className="text-white text-center text-sm font-medium border rounded-md bg-blue-500 px-3 py-1 hover:bg-blue-400">
                            Lihat
                          </a>

                          <a
                            href={`https://docs.google.com/spreadsheets/d/${rapat.notulen.fileId}/export?format=xlsx`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-center text-sm font-medium border rounded-md hover:bg-green-400 bg-green-600 px-3 py-1"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Belum tersedia / Tidak punya akses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
