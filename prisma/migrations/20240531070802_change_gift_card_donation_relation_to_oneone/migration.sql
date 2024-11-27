/*
  Warnings:

  - A unique constraint covering the columns `[campaignDonationId]` on the table `GiftCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_campaignDonationId_key" ON "GiftCard"("campaignDonationId");
