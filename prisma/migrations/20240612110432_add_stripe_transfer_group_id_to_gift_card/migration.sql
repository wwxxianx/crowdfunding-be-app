/*
  Warnings:

  - Added the required column `stripeTransferGroupId` to the `gift_cards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gift_cards" ADD COLUMN     "stripeTransferGroupId" TEXT NOT NULL;
