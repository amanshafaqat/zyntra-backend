import path from "node:path";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-error";
import { DocumentParserService } from "./parser.service";
import { documentsDir } from "./documents.upload";

export class ExtractionService {
  /**
   * Performs automatic text extraction for a newly uploaded/replaced document.
   */
  static async triggerExtraction(documentId: string, userId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.userId !== userId) {
      throw ApiError.notFound("Document not found");
    }

    const storagePath = path.isAbsolute(doc.storagePath)
      ? doc.storagePath
      : path.join(documentsDir, path.basename(doc.storagePath));

    // Upsert DocumentExtraction record to PROCESSING
    await prisma.documentExtraction.upsert({
      where: { documentId },
      update: {
        status: "PROCESSING",
        attemptCount: { increment: 1 },
      },
      create: {
        documentId,
        userId,
        status: "PROCESSING",
      },
    });

    // Run parser safely with OCR fallback
    const result = await DocumentParserService.parseFileAsync(storagePath, doc.mime);

    // Save final state
    return prisma.documentExtraction.update({
      where: { documentId },
      data: {
        status: result.status,
        extractedText: result.extractedText,
        textLength: result.textLength,
        pageCount: result.pageCount,
        extractorType: result.extractorType,
        checksum: result.checksum,
        errorCode: result.errorCode ?? null,
      },
    });
  }

  /**
   * Retrieves extraction metadata for a document owned by the user.
   */
  static async getExtraction(documentId: string, userId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true, name: true, mime: true },
    });

    if (!doc || doc.userId !== userId) {
      throw ApiError.notFound("Document not found");
    }

    const extraction = await prisma.documentExtraction.findUnique({
      where: { documentId },
    });

    if (!extraction) {
      // Trigger automatic extraction if not yet triggered
      return this.triggerExtraction(documentId, userId);
    }

    return extraction;
  }

  /**
   * Retries extraction for a document owned by the user.
   */
  static async retryExtraction(documentId: string, userId: string) {
    return this.triggerExtraction(documentId, userId);
  }
}
