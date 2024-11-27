-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "personImageUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'suspect',
    "nationalId" TEXT,
    "nationality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrimeRecord" (
    "id" TEXT NOT NULL,
    "crimeType" TEXT NOT NULL,
    "crimeDescription" TEXT NOT NULL,
    "crimeDate" TIMESTAMP(3) NOT NULL,
    "convictionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "crimeLocation" TEXT NOT NULL,
    "investigationOfficerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suspect" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "criminalId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "foundStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissingPerson" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "lastSeenDate" TIMESTAMP(3) NOT NULL,
    "lastSeenLocation" TEXT NOT NULL,
    "missingSince" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "reportBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissingPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecognizedPerson" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "capturedImageUrl" TEXT NOT NULL,
    "capturedLocation" TEXT NOT NULL,
    "capturedDateTime" TIMESTAMP(3) NOT NULL,
    "cameraId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidenceScore" TEXT NOT NULL,

    CONSTRAINT "RecognizedPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'non-admin',
    "designation" TEXT NOT NULL,
    "userImageUrl" TEXT,
    "policeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "cameraUrl" TEXT NOT NULL,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requests" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrimeRecord_investigationOfficerId_key" ON "CrimeRecord"("investigationOfficerId");

-- CreateIndex
CREATE UNIQUE INDEX "Suspect_personId_key" ON "Suspect"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Suspect_criminalId_key" ON "Suspect"("criminalId");

-- CreateIndex
CREATE UNIQUE INDEX "MissingPerson_personId_key" ON "MissingPerson"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "RecognizedPerson_personId_key" ON "RecognizedPerson"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Suspect" ADD CONSTRAINT "Suspect_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspect" ADD CONSTRAINT "Suspect_criminalId_fkey" FOREIGN KEY ("criminalId") REFERENCES "CrimeRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingPerson" ADD CONSTRAINT "MissingPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecognizedPerson" ADD CONSTRAINT "RecognizedPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecognizedPerson" ADD CONSTRAINT "RecognizedPerson_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
