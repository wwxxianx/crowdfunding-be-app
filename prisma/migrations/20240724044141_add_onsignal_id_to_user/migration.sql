/*
  Warnings:

  - You are about to drop the column `bankAccountId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "bankAccountId",
ADD COLUMN     "onesignalId" TEXT;
