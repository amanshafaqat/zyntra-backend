import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { env } from "@/config/env";
import { ApiError } from "@/utils/api-error";

const AVATAR_DIR = path.resolve(env.UPLOAD_DIR, "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED.get(file.mimetype) ?? path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user?.id ?? "anon"}-${randomUUID()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: env.MAX_AVATAR_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(ApiError.badRequest("Only JPG, PNG or WebP images are allowed."));
      return;
    }
    cb(null, true);
  },
});

export const avatarDir = AVATAR_DIR;
