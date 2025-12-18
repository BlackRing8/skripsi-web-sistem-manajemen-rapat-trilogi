import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Membersihkan data dummy di unit Sistem Informasi...");

  // Ambil unit Sistem Informasi
  const sistemInformasi = await prisma.unit.findUnique({
    where: { nama: "Sistem Informasi" },
  });

  if (!sistemInformasi) {
    throw new Error("Unit Sistem Informasi tidak ditemukan di database.");
  }

  const unitId = sistemInformasi.id;

  // --------------------------------------------
  // Buat jabatan jika belum ada
  // --------------------------------------------

  const kaprodi = await prisma.jabatan.upsert({
    where: { nama_unitId: { nama: "Ketua Program Studi", unitId } },
    update: {},
    create: {
      nama: "Ketua Program Studi",
      unitId,
    },
  });

  const dosen = await prisma.jabatan.upsert({
    where: { nama_unitId: { nama: "Dosen", unitId } },
    update: {},
    create: {
      nama: "Dosen",
      unitId,
    },
  });

  // Email dosen SI
  const dosenEmails = ["rudi@trilogi.ac.id", "gatot.pranoto@trilogi.ac.id", "ninasariana99@trilogi.ac.id", "faisalpiliang@trilogi.ac.id"];

  // --------------------------------------------
  // Tambahkan Pak Faruq sebagai Kaprodi
  // --------------------------------------------
  console.log("👨‍🏫 Menambahkan Pak Faruq sebagai Kaprodi...");

  const faruq = await prisma.user.upsert({
    where: { email: "faruq@trilogi.ac.id" },
    update: {},
    create: {
      email: "faruq@trilogi.ac.id",
      name: "Umar Al Faruq",
      profileCompleted: true,
    },
  });

  await prisma.userUnitJabatan.upsert({
    where: {
      userId_unitId_jabatanId: {
        userId: faruq.id,
        unitId,
        jabatanId: kaprodi.id,
      },
    },
    update: {},
    create: {
      userId: faruq.id,
      unitId,
      jabatanId: kaprodi.id,
    },
  });

  // --------------------------------------------
  // Tambahkan dosen-dosen lain
  // --------------------------------------------

  console.log("📚 Menambahkan dosen lainnya...");

  for (const email of dosenEmails) {
    const nama = email.split("@")[0].replace(".", " ");

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: nama,
        profileCompleted: true,
      },
    });

    await prisma.userUnitJabatan.upsert({
      where: {
        userId_unitId_jabatanId: {
          userId: user.id,
          unitId,
          jabatanId: dosen.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        unitId,
        jabatanId: dosen.id,
      },
    });
  }

  console.log("🎉 SEED selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
