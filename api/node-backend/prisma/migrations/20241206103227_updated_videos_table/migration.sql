/*
  Warnings:

  - You are about to drop the column `videoDescription` on the `Videos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Videos" DROP COLUMN "videoDescription",
ALTER COLUMN "videoDate" SET DEFAULT CURRENT_TIMESTAMP;
