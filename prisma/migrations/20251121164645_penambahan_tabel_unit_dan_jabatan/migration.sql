-- CreateTable
CREATE TABLE `Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Unit_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jabatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `nik` INTEGER NULL,
    `unit` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `googleId` VARCHAR(191) NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `googleEventId` VARCHAR(191) NULL,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `tanggalMulai` DATETIME(3) NOT NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `lokasi` VARCHAR(191) NULL,
    `linkMeeting` VARCHAR(191) NULL,
    `pesertaEmails` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'BELUM_MULAI',
    `pembuatId` INTEGER NOT NULL,
    `dibuatPada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Rapat_googleEventId_key`(`googleEventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RapatPeserta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapatId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DIUNDANG',
    `waktuAbsen` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notulen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapatId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `dibuatOleh` INTEGER NOT NULL,
    `dibuatPada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Notulen_rapatId_key`(`rapatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RapatUnit` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RapatUnit_AB_unique`(`A`, `B`),
    INDEX `_RapatUnit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Jabatan` ADD CONSTRAINT `Jabatan_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rapat` ADD CONSTRAINT `Rapat_pembuatId_fkey` FOREIGN KEY (`pembuatId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RapatPeserta` ADD CONSTRAINT `RapatPeserta_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RapatPeserta` ADD CONSTRAINT `RapatPeserta_rapatId_fkey` FOREIGN KEY (`rapatId`) REFERENCES `Rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notulen` ADD CONSTRAINT `Notulen_rapatId_fkey` FOREIGN KEY (`rapatId`) REFERENCES `Rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RapatUnit` ADD CONSTRAINT `_RapatUnit_A_fkey` FOREIGN KEY (`A`) REFERENCES `Rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RapatUnit` ADD CONSTRAINT `_RapatUnit_B_fkey` FOREIGN KEY (`B`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
