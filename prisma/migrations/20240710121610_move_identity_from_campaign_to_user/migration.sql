/*
  Warnings:

  - The `fundraiserIdentificationStatus` column on the `campaigns` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "IdentificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "fundraiserIdentificationStatus",
ADD COLUMN     "fundraiserIdentificationStatus" "IdentificationStatus" DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "identificationRejectReason" TEXT,
ADD COLUMN     "identificationStatus" "IdentificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "identityNumber" TEXT;

-- DropEnum
DROP TYPE "FundraiserIdentificationStatus";
