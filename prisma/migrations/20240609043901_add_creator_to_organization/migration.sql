/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "creatorId" TEXT NOT NULL DEFAULT '1a2470a2-cebc-4143-8568-a0c27f06b995';

-- CreateIndex
CREATE UNIQUE INDEX "organizations_creatorId_key" ON "organizations"("creatorId");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
