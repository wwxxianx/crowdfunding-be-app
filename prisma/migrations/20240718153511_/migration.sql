/*
  Warnings:

  - You are about to drop the `TaxReceiptReports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaxReceiptReports" DROP CONSTRAINT "TaxReceiptReports_userId_fkey";

-- DropTable
DROP TABLE "TaxReceiptReports";

-- CreateTable
CREATE TABLE "tax_receipt_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiptFileUrl" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_receipt_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tax_receipt_reports" ADD CONSTRAINT "tax_receipt_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
