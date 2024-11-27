/*
  Warnings:

  - You are about to drop the column `fundraiserIdentificationRejectReason` on the `campaigns` table. All the data in the column will be lost.
  - You are about to drop the column `fundraiserIdentificationStatus` on the `campaigns` table. All the data in the column will be lost.
  - You are about to drop the column `fundraiserIdentityNumber` on the `campaigns` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "fundraiserIdentificationRejectReason",
DROP COLUMN "fundraiserIdentificationStatus",
DROP COLUMN "fundraiserIdentityNumber";
