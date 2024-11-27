/*
  Warnings:

  - You are about to drop the `GiftCard` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactPhoneNumber` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_campaignDonationId_fkey";

-- DropForeignKey
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_senderId_fkey";

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "contactPhoneNumber" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL;

-- DropTable
DROP TABLE "GiftCard";

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "organizationId" TEXT,
    "reward" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT NOT NULL DEFAULT 'Wish you all the best!',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignDonationId" TEXT,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_campaignId_key" ON "Collaboration"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_campaignDonationId_key" ON "gift_cards"("campaignDonationId");

-- CreateIndex
CREATE INDEX "organizations_invitationCode_idx" ON "organizations"("invitationCode");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_campaignDonationId_fkey" FOREIGN KEY ("campaignDonationId") REFERENCES "campaign_donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
