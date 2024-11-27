/*
  Warnings:

  - Added the required column `personName` to the `CrimeRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Suspect" DROP CONSTRAINT "Suspect_criminalId_fkey";

-- AlterTable
ALTER TABLE "CrimeRecord" ADD COLUMN     "personName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Suspect" ALTER COLUMN "criminalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Suspect" ADD CONSTRAINT "Suspect_criminalId_fkey" FOREIGN KEY ("criminalId") REFERENCES "CrimeRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
