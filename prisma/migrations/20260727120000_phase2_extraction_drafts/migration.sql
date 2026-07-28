-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'EXTRACTED', 'OCR_REQUIRED', 'UNSUPPORTED', 'FAILED');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'PARTIALLY_APPLIED', 'APPLIED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "DraftMode" AS ENUM ('CLAUDE', 'GROQ', 'LOCAL_RULES');

-- CreateEnum
CREATE TYPE "SuggestionState" AS ENUM ('PENDING', 'ACCEPTED', 'EDITED', 'REJECTED', 'CONFLICT');

-- CreateTable
CREATE TABLE "document_extractions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "extractedText" TEXT,
    "textLength" INTEGER NOT NULL DEFAULT 0,
    "pageCount" INTEGER,
    "extractorType" TEXT NOT NULL DEFAULT 'default',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "errorCode" TEXT,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extraction_consents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "extraction_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "mode" "DraftMode" NOT NULL DEFAULT 'LOCAL_RULES',
    "provider" TEXT,
    "consentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "profile_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_field_suggestions" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "proposedValue" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "userEditedValue" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "sourceDocumentId" TEXT,
    "sourceExcerpt" TEXT,
    "page" INTEGER,
    "state" "SuggestionState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_field_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_extractions_documentId_key" ON "document_extractions"("documentId");
CREATE INDEX "document_extractions_userId_idx" ON "document_extractions"("userId");
CREATE INDEX "document_extractions_status_idx" ON "document_extractions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "extraction_consents_userId_key" ON "extraction_consents"("userId");

-- CreateIndex
CREATE INDEX "profile_drafts_userId_status_idx" ON "profile_drafts"("userId", "status");

-- CreateIndex
CREATE INDEX "profile_field_suggestions_draftId_idx" ON "profile_field_suggestions"("draftId");
CREATE INDEX "profile_field_suggestions_field_idx" ON "profile_field_suggestions"("field");

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_consents" ADD CONSTRAINT "extraction_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_drafts" ADD CONSTRAINT "profile_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_field_suggestions" ADD CONSTRAINT "profile_field_suggestions_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "profile_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
