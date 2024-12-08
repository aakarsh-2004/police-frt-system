/*
  Warnings:

  - You are about to drop the column `otpExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpSecret` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[firebaseUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpExpiry",
DROP COLUMN "otpSecret",
ADD COLUMN     "firebaseUid" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
