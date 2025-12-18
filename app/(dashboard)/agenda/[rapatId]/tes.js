<div className="w-full md:items-start h-screen py-2 px-6 justify-center md:justify-start flex flex-wrap space-y-3 md:space-y-0 md:space-x-3">
  <div className="p-6 flex flex-col bg-white rounded-xl shadow-md">
    <h1 className="text-4xl font-semibold mb-2">{rapat.judul}</h1>
    <p className="text-gray-600 mb-4">
      ⏰{" "}
      {new Date(rapat.tanggalMulai).toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>

    {/* {rapat.notulen ? (
        <div className="mb-4 p-3 border rounded-lg bg-gray-50">
          <h2 className="font-medium mb-1">📄 Notulen</h2>
          <p>{rapat.notulen.isi}</p>
        </div>
      ) : (
        <p className="text-gray-500 mb-4 italic">Notulen belum tersedia.</p>
      )} */}

    <h2 className="font-medium mb-2">👥 Daftar Peserta:</h2>
    <ul className="mb-4">
      {rapat.peserta.map((p) => (
        <li key={p.id} className="text-sm">
          {p.user.name} - <b>{p.status}</b>
        </li>
      ))}
    </ul>

    {/* ✅ Tombol absensi */}
    <div className="flex gap-2">
      <button onClick={() => handleAbsen("HADIR")} disabled={absenLoading} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all">
        Hadir
      </button>
      <button onClick={() => handleAbsen("TIDAK_HADIR")} disabled={absenLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
        Tidak Hadir
      </button>
      <button onClick={() => handleAbsen("IZIN")} disabled={absenLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all">
        Izin
      </button>
    </div>
  </div>
  <div className="p-6 bg-white rounded-xl shadow-md">
    <h2 className="text-xl text-white font-semibold bg-blue-400 rounded-t-xl p-3">Deskripsi rapat</h2>
    <div className=" max-w-xs flex flex-wrap border border-blue-400 p-1.5">
      <p className="text-sm ">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum eligendi culpa necessitatibus pariatur voluptatem. Rem in, ipsa iste, quod dolores quasi, dolorem eaque voluptatum eveniet quam consectetur aperiam laboriosam
        magnam!
      </p>
    </div>
  </div>
</div>;
