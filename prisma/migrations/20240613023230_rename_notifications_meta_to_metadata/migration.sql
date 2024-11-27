/*
  Warnings:

  - You are about to drop the column `meta` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "meta",
ADD COLUMN     "metadata" JSONB;
