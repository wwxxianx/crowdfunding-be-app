/*
  Warnings:

  - You are about to alter the column `targetAmount` on the `campaigns` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "targetAmount" SET DATA TYPE INTEGER;
