/*
  Warnings:

  - You are about to drop the column `status` on the `MissingPerson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MissingPerson" DROP COLUMN "status",
ADD COLUMN     "foundStatus" BOOLEAN NOT NULL DEFAULT false;
