import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "@/config/env";
import { ApiError } from "@/utils/api-error";

const DOCS_DIR = path.resolve(env.UPLOAD_DIR, "documents");
fs.mkdirSync(DOCS_DIR, { recursive: true });

/** Max size aligned with the frontend limit (see documentService.upload). */
export const DOCUMENT_MAX_MB = 10;

const ALLOWED_MIME = new Map<string, string>([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOCS_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME.get(file.mimetype) ?? path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user?.id ?? "anon"}-${randomUUID()}${ext}`);
  },
});

export const documentUpload = multer({
  storage,
  limits: { fileSize: DOCUMENT_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest("Only PDF, DOC, DOCX, JPG, PNG or WebP files are allowed."));
      return;
    }
    cb(null, true);
  },
});

export const documentsDir = DOCS_DIR;
