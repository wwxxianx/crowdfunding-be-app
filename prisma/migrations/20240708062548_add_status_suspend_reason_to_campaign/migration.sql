-- CreateEnum
CREATE TYPE "CampaignPublishStatus" AS ENUM ('PENDING', 'PUBLISHED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "status" "CampaignPublishStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "suspendReason" TEXT,
ALTER COLUMN "isPublished" DROP NOT NULL;
