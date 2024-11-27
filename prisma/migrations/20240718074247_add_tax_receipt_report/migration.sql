-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT;

-- CreateTable
CREATE TABLE "TaxReceiptReports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiptFileUrl" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxReceiptReports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaxReceiptReports" ADD CONSTRAINT "TaxReceiptReports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
