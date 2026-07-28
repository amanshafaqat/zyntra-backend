-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'SECONDARY_SOURCE', 'MODELED', 'UNVERIFIED');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN "officialProgramUrl" TEXT,
ADD COLUMN "officialApplicationUrl" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
