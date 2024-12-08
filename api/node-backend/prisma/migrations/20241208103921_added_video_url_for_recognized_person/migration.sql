/*
  Warnings:

  - You are about to drop the `Videos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Videos" DROP CONSTRAINT "Videos_recognizedPersonId_fkey";

-- AlterTable
ALTER TABLE "RecognizedPerson" ADD COLUMN     "videoUrl" TEXT;

-- DropTable
DROP TABLE "Videos";
