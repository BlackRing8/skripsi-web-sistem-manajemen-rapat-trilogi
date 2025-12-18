"use client";

import { useState, useEffect } from "react";

export default function FormEvent() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState([]);

  const [peserta, setPeserta] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    lokasi: "",
    linkMeeting: "",
  });

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user-by-unit");
        if (!res.ok) throw new Error("Gagal mengambil data unit");
        const data = await res.json();
        // console.log("unit di dapat:", data);
        setUnits(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  // handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------------- tambah peserta manual ---------------- //
  const tambahPesertaManual = () => setPeserta([...peserta, ""]);

  const ubahPeserta = (index, value) => {
    const baru = [...peserta];
    baru[index] = value;
    setPeserta(baru);
  };

  const tambahPesertaUnit = () => {
    const unit = units.find((u) => u.id === Number(selectedUnit));
    if (!unit) return;

    const emails = unit.users.map((u) => u.email);

    // tambahkan email unit sekaligus + hindari duplikat
    setPeserta((prev) => [...new Set([...prev, ...emails])]);
  };

  const tambahPesertaUser = () => {
    if (!selectedUser) return;

    setPeserta((prev) => [...new Set([...prev, selectedUser])]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (peserta.length === 0) {
      setMessage("❌ Minimal satu peserta harus diisi.");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = { ...form, peserta };

      const res = await fetch("/api/calendar/create", {
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
      setPeserta([]);
    } catch (error) {
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="  p-6">
      <div className="flex-col bg-white rounded-2xl gap-2 p-8">
        <h1 className="text-2xl font-semibold mb-6 ">Tambah Agenda Rapat:</h1>
        <form onSubmit={handleSubmit} className="w-full h-auto grid  lg:flex">
          <div className="lg:w-2/3 justify-start items-start flex-col space-y-6 pr-12 border-r-4 border-blue-300 ">
            <input type="text" name="judul" placeholder="Judul Rapat" value={form.judul} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none " />
            <textarea name="deskripsi" placeholder="Deskripsi" value={form.deskripsi} onChange={handleChange} className="w-full border h-32 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none " />
            <div className="grid lg:grid-cols-2 gap-4 mr-20">
              {/* Kolom Kiri: Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Rapat</label>

                <input
                  type="date"
                  name="tanggalMulai"
                  value={form.tanggalMulai?.split("T")[0] || ""}
                  onChange={(e) => {
                    const date = e.target.value;

                    const timeMulai = form.tanggalMulai?.split("T")[1] || "00:00";
                    const timeSelesai = form.tanggalSelesai?.split("T")[1] || "00:00";

                    setForm({
                      ...form,
                      tanggalMulai: `${date}T${timeMulai}`,
                      tanggalSelesai: `${date}T${timeSelesai}`,
                    });
                  }}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Kolom Kanan: Waktu */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Rapat</label>

                <div className="flex items-center gap-2">
                  {/* Jam Mulai */}
                  <input
                    type="time"
                    inputMode="numeric"
                    format="24h"
                    name="jamMulai"
                    value={form.tanggalMulai?.split("T")[1] || "00:00"}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = form.tanggalMulai?.split("T")[0] || "";
                      setForm({ ...form, tanggalMulai: `${date}T${time}` });
                    }}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />

                  <span className="text-gray-600 font-medium">–</span>

                  {/* Jam Selesai */}
                  <input
                    type="time"
                    inputMode="numeric"
                    format="24h"
                    name="jamSelesai"
                    value={form.tanggalSelesai?.split("T")[1] || "00:00"}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = form.tanggalSelesai?.split("T")[0] || "";
                      setForm({ ...form, tanggalSelesai: `${date}T${time}` });
                    }}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <input type="text" name="lokasi" placeholder="Lokasi Rapat" value={form.lokasi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />

            <textarea
              type="text"
              name="linkMeeting"
              disabled
              placeholder="Note: Link Meeting otomatis terbuat jika lokasi berisi google meet"
              className="w-full  rounded-lg px-2 py-0 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-black placeholder:font-semibold"
            />
          </div>

          {/* ------------- */}
          <div className="w-full grid lg:pl-4 mt-6 lg:mt-0">
            {" "}
            <div className="flex flex-col gap-2">
              <label className="block font-semibold mb-2">Undang Peserta (Otomatis):</label>

              {/* PILIH UNIT */}
              <select className="border p-2 rounded-lg  mb-2 w-1/2" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                <option value="">-- Pilih Unit --</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nama}
                  </option>
                ))}
              </select>

              {selectedUnit && (
                <>
                  {/* BUTTON "UNDANG SATU UNIT" */}
                  <button type="button" onClick={tambahPesertaUnit} className="w-1/2 lg:w-1/3 bg-green-600 text-white py-2 rounded-lg mb-3">
                    Undang Semua dari Unit Ini
                  </button>

                  {/* PILIH USER */}
                  <select className="border p-2 rounded-lg mr-4 w-1/2" onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">-- Pilih User --</option>
                    {units
                      .find((u) => u.id === Number(selectedUnit))
                      ?.users.map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.name} ({user.jabatans.join(", ")})
                        </option>
                      ))}
                  </select>

                  <button type="button" onClick={tambahPesertaUser} className="w-40 bg-blue-500 text-white py-2 rounded-lg mt-2">
                    Tambahkan User Ini
                  </button>
                </>
              )}
            </div>
            {/* PESERTA MANUAL */}
            <div className="mt-4">
              <label className="block mb-2 font-semibold">Tambah Peserta Manual:</label>

              {peserta.map((p, i) => (
                <input key={i} type="email" placeholder={`Email Peserta ${i + 1}`} className="border p-2 w-1/2 mb-2 rounded-lg mr-4" value={p} onChange={(e) => ubahPeserta(i, e.target.value)} />
              ))}

              <button type="button" onClick={tambahPesertaManual} className=" px-3 py-2 bg-gray-300 rounded-lg font-semibold">
                + Tambah Input Manual
              </button>
            </div>
            <button type="submit" disabled={loading} className="h-11 mt-6 w-40 bg-red-500 hover:bg-red-700 text-white font-semibold py-0 rounded-lg">
              {loading ? "Membuat Agenda..." : "Buat Agenda"}
            </button>
            {message && <p className={`text-center mt-3 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
