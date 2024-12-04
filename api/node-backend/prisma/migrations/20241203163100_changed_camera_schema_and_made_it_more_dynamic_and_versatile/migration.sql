/*
  Warnings:

  - You are about to drop the column `cameraUrl` on the `Camera` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streamUrl` to the `Camera` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camera" DROP COLUMN "cameraUrl",
ADD COLUMN     "latitude" TEXT NOT NULL,
ADD COLUMN     "longitude" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "nearestPoliceStation" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "streamUrl" TEXT NOT NULL;
