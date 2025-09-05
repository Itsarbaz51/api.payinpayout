/*
  Warnings:

  - You are about to drop the column `aadhaarImage` on the `kyc_details` table. All the data in the column will be lost.
  - Added the required column `aadhaarImageBack` to the `kyc_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aadhaarImageFront` to the `kyc_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopAddressImage` to the `kyc_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kyc_details` DROP COLUMN `aadhaarImage`,
    ADD COLUMN `aadhaarImageBack` VARCHAR(191) NOT NULL,
    ADD COLUMN `aadhaarImageFront` VARCHAR(191) NOT NULL,
    ADD COLUMN `shopAddressImage` VARCHAR(191) NOT NULL;
