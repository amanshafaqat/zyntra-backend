import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { logger } from "@/config/logger";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-error";
import { asyncHandler } from "@/utils/async-handler";
import { toDocumentDto, type DocumentDto } from "@/modules/catalog/catalog.serializer";
import {
  documentIdParam,
  uploadDocumentSchema,
  type DocumentType,
  type UploadDocumentDto,
} from "./documents.dto";
import { documentUpload, documentsDir } from "./documents.upload";

// ── Repository ────────────────────────────────────────────────────────────────
const documentsRepository = {
  listForUser(userId: string) {
    return prisma.document.findMany({ where: { userId }, orderBy: { uploadedAt: "desc" } });
  },
  findOwned(userId: string, id: string) {
    return prisma.document.findFirst({ where: { id, userId } });
  },
  create(data: {
    userId: string;
    type: DocumentType;
    name: string;
    size: number;
    mime: string;
    storagePath: string;
    expiryDate: Date | null;
  }) {
    return prisma.document.create({ data });
  },
  updateFile(id: string, data: { name: string; size: number; mime: string; storagePath: string }) {
    return prisma.document.update({ where: { id }, data: { ...data, uploadedAt: new Date() } });
  },
  delete(id: string) {
    return prisma.document.delete({ where: { id } });
  },
};

async function safeUnlink(p: string) {
  try {
    await fs.unlink(p);
  } catch (err) {
    logger.warn({ err, path: p }, "Could not remove document file");
  }
}

import { ExtractionService } from "./extraction.service";

// ── Service ───────────────────────────────────────────────────────────────────
export const documentsService = {
  async list(userId: string): Promise<DocumentDto[]> {
    const rows = await documentsRepository.listForUser(userId);
    return rows.map(toDocumentDto);
  },

  async upload(userId: string, file: Express.Multer.File, dto: UploadDocumentDto): Promise<DocumentDto> {
    const created = await documentsRepository.create({
      userId,
      type: dto.type,
      name: file.originalname,
      size: file.size,
      mime: file.mimetype,
      storagePath: path.basename(file.path),
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
    });
    // Trigger automatic extraction
    ExtractionService.triggerExtraction(created.id, userId).catch((err) => {
      logger.warn({ err, documentId: created.id }, "Automatic extraction trigger failed");
    });
    return toDocumentDto(created);
  },

  async replace(userId: string, id: string, file: Express.Multer.File): Promise<DocumentDto> {
    const existing = await documentsRepository.findOwned(userId, id);
    if (!existing) {
      await safeUnlink(file.path);
      throw ApiError.notFound("Document not found.");
    }
    const updated = await documentsRepository.updateFile(id, {
      name: file.originalname,
      size: file.size,
      mime: file.mimetype,
      storagePath: path.basename(file.path),
    });
    await safeUnlink(path.join(documentsDir, existing.storagePath));
    // Trigger extraction on replacement
    ExtractionService.triggerExtraction(id, userId).catch((err) => {
      logger.warn({ err, documentId: id }, "Automatic extraction trigger failed");
    });
    return toDocumentDto(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    const existing = await documentsRepository.findOwned(userId, id);
    if (!existing) throw ApiError.notFound("Document not found.");
    await documentsRepository.delete(id);
    await safeUnlink(path.join(documentsDir, existing.storagePath));
  },

  async streamDownload(userId: string, id: string, res: Response): Promise<void> {
    const existing = await documentsRepository.findOwned(userId, id);
    if (!existing) throw ApiError.notFound("Document not found.");
    const full = path.join(documentsDir, existing.storagePath);
    res.setHeader("Content-Type", existing.mime);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(existing.name)}"`,
    );
    res.sendFile(full);
  },
};

// ── HTTP layer ────────────────────────────────────────────────────────────────
const documentsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json(await documentsService.list(req.user!.id));
  }),
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("Attach a file in the 'file' field.");
    res.status(201).json(await documentsService.upload(req.user!.id, req.file, req.body));
  }),
  replace: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("Attach a file in the 'file' field.");
    res.json(await documentsService.replace(req.user!.id, req.params.id, req.file));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await documentsService.remove(req.user!.id, req.params.id);
    res.json({ message: "Document deleted." });
  }),
  download: asyncHandler(async (req: Request, res: Response) => {
    await documentsService.streamDownload(req.user!.id, req.params.id, res);
  }),
  getExtraction: asyncHandler(async (req: Request, res: Response) => {
    res.json(await ExtractionService.getExtraction(req.params.id, req.user!.id));
  }),
  retryExtraction: asyncHandler(async (req: Request, res: Response) => {
    res.json(await ExtractionService.retryExtraction(req.params.id, req.user!.id));
  }),
};

export const documentsRouter = Router();
documentsRouter.use(requireAuth);
documentsRouter.get("/", documentsController.list);
documentsRouter.post("/", documentUpload.single("file"), validate({ body: uploadDocumentSchema }), documentsController.upload);
documentsRouter.put("/:id", documentUpload.single("file"), validate({ params: documentIdParam }), documentsController.replace);
documentsRouter.delete("/:id", validate({ params: documentIdParam }), documentsController.remove);
documentsRouter.get("/:id/download", validate({ params: documentIdParam }), documentsController.download);
documentsRouter.get("/:id/extraction", validate({ params: documentIdParam }), documentsController.getExtraction);
documentsRouter.post("/:id/extraction/retry", validate({ params: documentIdParam }), documentsController.retryExtraction);

