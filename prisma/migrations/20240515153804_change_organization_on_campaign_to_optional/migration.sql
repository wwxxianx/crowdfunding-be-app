-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_organizationId_fkey";

-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
