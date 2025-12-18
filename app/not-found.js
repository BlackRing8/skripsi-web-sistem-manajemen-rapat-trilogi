import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default function NotFoundPage() {
  return (
    <div className=" ">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-auto flex-col fixed inset-y-0 z-50 ">
        <Sidebar />
      </div>
      <main className="md:pl-64 pt-[90px] h-screen flex justify-center">
        {" "}
        <div className="w-1/2 h-full justify-center items-center flex">
          <h1 className="font-semibold text-2xl text-center">Halaman tidak ditemukan atau terjadi kesalahan, silahkan refresh halaman atau kembali ke halaman lain</h1>
        </div>
      </main>
    </div>
  );
}
