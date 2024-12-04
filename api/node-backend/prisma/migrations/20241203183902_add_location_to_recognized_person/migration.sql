/*
  Warnings:

  - The primary key for the `RecognizedPerson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `capturedLocation` on the `RecognizedPerson` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `RecognizedPerson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecognizedPerson" DROP CONSTRAINT "RecognizedPerson_pkey",
DROP COLUMN "capturedLocation",
DROP COLUMN "type",
ALTER COLUMN "capturedDateTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RecognizedPerson_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RecognizedPerson_id_seq";
