"use client";

import { useState } from "react";

export default function TestAgenda() {
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    lokasi: "",
    linkMeeting: "",
  });

  const [peserta, setPeserta] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const tambahPeserta = () => setPeserta([...peserta, ""]);
  const ubahPeserta = (index, value) => {
    const baru = [...peserta];
    baru[index] = value;
    setPeserta(baru);
  };

  // handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) return <p className="text-center font-semibold text-3xl">Loading data...</p>;

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (peserta.length === 0 || peserta.every((p) => p.trim() === "")) {
      setMessage("❌ Minimal satu peserta harus diisi.");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = { ...form, peserta };

      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menambahkan agenda");

      setMessage("✅ Agenda berhasil ditambahkan!");
      setForm({
        judul: "",
        deskripsi: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        lokasi: "",
        linkMeeting: "",
      });
      setPeserta([""]);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex justify-center items-center md:justify-start p-6">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mt-3 shadow-gray-500">
        <h1 className="text-2xl font-semibold text-center mb-6">Tambah Agenda Rapat</h1>

        <div className="space-y-4">
          <input type="text" name="judul" placeholder="Judul Rapat" value={form.judul} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />

          <textarea name="deskripsi" placeholder="Deskripsi" value={form.deskripsi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal Mulai</label>
              <input type="datetime-local" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal Selesai</label>
              <input
                type="datetime-local"
                name="tanggalSelesai"
                value={form.tanggalSelesai}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <input type="text" name="lokasi" placeholder="Lokasi Rapat" value={form.lokasi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />

          <textarea
            type="text"
            name="linkMeeting"
            disabled
            placeholder="Note: Link Meeting akan otomatis terbuat jika lokasi rapat berisi google meet"
            className="w-full  rounded-lg px-2 py-0 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-black placeholder:font-semibold"
          />

          <div>
            <label className="block mb-2">Email Peserta:</label>
            {peserta.map((p, i) => (
              <input key={i} type="email" placeholder={`Peserta ${i + 1}`} className="border p-2 w-full mb-2 rounded-lg" value={p} onChange={(e) => ubahPeserta(i, e.target.value)} />
            ))}
            <button type="button" onClick={tambahPeserta} className="px-3 py-2 bg-gray-300 rounded-lg font-semibold">
              + Tambah Peserta
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all">
            {loading ? "Menyimpan..." : "Simpan Agenda"}
          </button>

          {message && <p className={`text-center mt-3 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
        </div>
      </form>
      <div className=""></div>
    </div>
  );
}
