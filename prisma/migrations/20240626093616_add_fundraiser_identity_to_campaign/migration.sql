-- CreateEnum
CREATE TYPE "FundraiserIdentityStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "fundraiserIdentityNumber" TEXT,
ADD COLUMN     "fundraiserIdentityStatus" "FundraiserIdentityStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "fundraiserSignatureUrl" TEXT;
