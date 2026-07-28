import { z } from "zod";

export const DOCUMENT_TYPES = [
  "Transcript",
  "IELTS / Language Certificate",
  "CNIC / Passport",
  "Recommendation Letter",
  "SOP",
  "CV / Resume",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

const documentType = z.enum(DOCUMENT_TYPES as unknown as [DocumentType, ...DocumentType[]]);

const isoDate = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Enter a valid date" });

export const uploadDocumentSchema = z.object({
  type: documentType,
  expiryDate: isoDate,
});
export type UploadDocumentDto = z.infer<typeof uploadDocumentSchema>;

export const documentIdParam = z.object({ id: z.string().min(1) });
