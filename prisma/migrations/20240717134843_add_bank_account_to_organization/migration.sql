-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bankAccountId" TEXT;

-- CreateTable
CREATE TABLE "organization_bank_accounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "error" TEXT,

    CONSTRAINT "organization_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_bank_accounts_organizationId_key" ON "organization_bank_accounts"("organizationId");

-- AddForeignKey
ALTER TABLE "organization_bank_accounts" ADD CONSTRAINT "organization_bank_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
