-- AddForeignKey
ALTER TABLE "CrimeRecord" ADD CONSTRAINT "CrimeRecord_investigationOfficerId_fkey" FOREIGN KEY ("investigationOfficerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
