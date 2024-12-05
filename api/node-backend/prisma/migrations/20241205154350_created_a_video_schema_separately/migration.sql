/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `RecognizedPerson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecognizedPerson" DROP COLUMN "videoUrl";

-- CreateTable
CREATE TABLE "Videos" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "videoDescription" TEXT,
    "videoDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recognizedPersonId" TEXT NOT NULL,

    CONSTRAINT "Videos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Videos" ADD CONSTRAINT "Videos_recognizedPersonId_fkey" FOREIGN KEY ("recognizedPersonId") REFERENCES "RecognizedPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
