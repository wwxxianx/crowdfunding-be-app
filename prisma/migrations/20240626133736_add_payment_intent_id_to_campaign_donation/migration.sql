-- AlterTable
ALTER TABLE "campaign_donations" ADD COLUMN     "paymentIntentId" TEXT NOT NULL DEFAULT 'test';

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "expiredAt" TIMESTAMP(3);
