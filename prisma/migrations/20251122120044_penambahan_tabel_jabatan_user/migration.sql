/*
  Warnings:

  - You are about to drop the column `jabatan` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nama,unitId]` on the table `Jabatan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `jabatan`,
    DROP COLUMN `unit`;

-- CreateTable
CREATE TABLE `UserUnitJabatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `jabatanId` INTEGER NOT NULL,

    UNIQUE INDEX `UserUnitJabatan_userId_unitId_jabatanId_key`(`userId`, `unitId`, `jabatanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Jabatan_nama_unitId_key` ON `Jabatan`(`nama`, `unitId`);

-- AddForeignKey
ALTER TABLE `UserUnitJabatan` ADD CONSTRAINT `UserUnitJabatan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserUnitJabatan` ADD CONSTRAINT `UserUnitJabatan_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserUnitJabatan` ADD CONSTRAINT `UserUnitJabatan_jabatanId_fkey` FOREIGN KEY (`jabatanId`) REFERENCES `Jabatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
