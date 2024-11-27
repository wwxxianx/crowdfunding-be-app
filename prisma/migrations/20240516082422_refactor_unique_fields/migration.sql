-- DropIndex
DROP INDEX "campaign_updates_campaignId_key";

-- DropIndex
DROP INDEX "user_favourite_campaigns_userId_campaignId_key";

-- AlterTable
ALTER TABLE "user_favourite_campaigns" ADD CONSTRAINT "user_favourite_campaigns_pkey" PRIMARY KEY ("userId", "campaignId");
