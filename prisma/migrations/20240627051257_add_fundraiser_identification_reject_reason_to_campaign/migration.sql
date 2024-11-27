/*
  Warnings:

  - You are about to drop the column `fundraiserIdentityStatus` on the `campaigns` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FundraiserIdentificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "campaign_donations" ALTER COLUMN "paymentIntentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "fundraiserIdentityStatus",
ADD COLUMN     "fundraiserIdentificationRejectReason" TEXT,
ADD COLUMN     "fundraiserIdentificationStatus" "FundraiserIdentificationStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "FundraiserIdentityStatus";
