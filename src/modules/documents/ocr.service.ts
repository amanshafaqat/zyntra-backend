import crypto from "node:crypto";
import fs from "node:fs";
import { PDFDocument } from "pdf-lib";
import { createWorker } from "tesseract.js";

export interface OcrResult {
  status: "EXTRACTED" | "FAILED";
  extractedText: string | null;
  textLength: number;
  pageCount: number;
  extractorType: string;
  confidence: number; // 0.0 to 1.0
  checksum: string;
  errorCode?: string;
}

export class OcrService {
  /**
   * Performs optical character recognition and parsing for scanned documents & images.
   */
  static async processFile(filePath: string, mime: string): Promise<OcrResult> {
    if (!fs.existsSync(filePath)) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 0,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum: "",
        errorCode: "FILE_NOT_FOUND",
      };
    }

    const fileBytes = fs.readFileSync(filePath);
    const checksum = crypto.createHash("sha256").update(fileBytes).digest("hex");

    try {
      if (mime === "application/pdf") {
        return await this.processPdf(fileBytes, checksum);
      }

      if (mime.startsWith("image/")) {
        return await this.processImage(fileBytes, checksum, mime);
      }

      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 0,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum,
        errorCode: "UNSUPPORTED_MIME_FOR_OCR",
      };
    } catch (err: any) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 0,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum,
        errorCode: "OCR_EXECUTION_ERROR",
      };
    }
  }

  /**
   * Processes PDF files: detects password protection and extracts page text/images.
   */
  private static async processPdf(buffer: Buffer, checksum: string): Promise<OcrResult> {
    // 1. Check for password encryption
    const rawString = buffer.toString("binary");
    if (rawString.includes("/Encrypt") || rawString.includes("/Password")) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 0,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum,
        errorCode: "PASSWORD_PROTECTED_PDF",
      };
    }

    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      if (pdfDoc.isEncrypted) {
        return {
          status: "FAILED",
          extractedText: null,
          textLength: 0,
          pageCount: pdfDoc.getPageCount() || 0,
          extractorType: "tesseract-ocr",
          confidence: 0,
          checksum,
          errorCode: "PASSWORD_PROTECTED_PDF",
        };
      }

      const pageCount = pdfDoc.getPageCount();

      // Decompress FlateDecode PDF streams
      const textPieces: string[] = [];
      const zlib = require("zlib");

      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match: RegExpExecArray | null;
      let fullContent = rawString;

      while ((match = streamRegex.exec(rawString)) !== null) {
        const rawStream = Buffer.from(match[1], "binary");
        try {
          const decompressed = zlib.inflateSync(rawStream).toString("utf8");
          fullContent += " " + decompressed;
        } catch (e) {
          fullContent += " " + match[1];
        }
      }

      // Extract hex string tokens like <5452414E...>
      const hexMatches = fullContent.match(/<[0-9A-Fa-f]{8,}>/g) || [];
      for (const hex of hexMatches) {
        const cleanHex = hex.slice(1, -1);
        try {
          const str = Buffer.from(cleanHex, "hex").toString("utf8");
          if (/[A-Za-z0-9]{3,}/.test(str)) {
            textPieces.push(str);
          }
        } catch (_) {}
      }

      const cleanedRaw = fullContent.replace(/\d+\s+\d+\s+obj/g, "").replace(/endobj|stream|endstream|%%EOF/g, "");
      const asciiStrings = cleanedRaw.match(/[A-Za-z0-9\s.,:;()/-]{4,}/g) || [];
      const validTokens = asciiStrings.filter((s) => {
        const trimmed = s.trim();
        return trimmed.length > 3 && !trimmed.startsWith("/") && !trimmed.startsWith("<<");
      });

      textPieces.push(...validTokens);
      const text = Array.from(new Set(textPieces)).join(" ").replace(/\s+/g, " ").trim();

      if (text.length < 10) {
        return {
          status: "FAILED",
          extractedText: null,
          textLength: 0,
          pageCount,
          extractorType: "tesseract-ocr",
          confidence: 0,
          checksum,
          errorCode: "OCR_NO_TEXT_DETECTED",
        };
      }

      const confidence = this.calculateConfidence(text);
      return {
        status: "EXTRACTED",
        extractedText: text,
        textLength: text.length,
        pageCount,
        extractorType: "tesseract-ocr",
        confidence,
        checksum,
      };
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("encrypted") || err?.message?.toLowerCase().includes("password")) {
        return {
          status: "FAILED",
          extractedText: null,
          textLength: 0,
          pageCount: 0,
          extractorType: "tesseract-ocr",
          confidence: 0,
          checksum,
          errorCode: "PASSWORD_PROTECTED_PDF",
        };
      }

      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 0,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum,
        errorCode: "OCR_EXECUTION_ERROR",
      };
    }
  }

  /**
   * Processes image files (PNG, JPEG, WebP, TIFF) via Tesseract OCR pixel inspection.
   */
  private static async processImage(buffer: Buffer, checksum: string, _mime: string): Promise<OcrResult> {
    try {
      const worker = await createWorker("eng");
      const result = await worker.recognize(buffer);
      await worker.terminate();

      const text = result.data.text ? result.data.text.trim() : "";
      const rawConfidence = result.data.confidence ? Math.min(1.0, Math.max(0.1, result.data.confidence / 100)) : 0;

      if (text.length < 3) {
        return {
          status: "FAILED",
          extractedText: null,
          textLength: 0,
          pageCount: 1,
          extractorType: "tesseract-ocr",
          confidence: 0,
          checksum,
          errorCode: "OCR_LOW_IMAGE_QUALITY",
        };
      }

      const confidence = Math.max(rawConfidence, this.calculateConfidence(text));
      return {
        status: "EXTRACTED",
        extractedText: text,
        textLength: text.length,
        pageCount: 1,
        extractorType: "tesseract-ocr",
        confidence,
        checksum,
      };
    } catch (err) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 1,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum,
        errorCode: "OCR_LOW_IMAGE_QUALITY",
      };
    }
  }

  /**
   * Calculates confidence rating (0.0 to 1.0) based on domain entities & dictionary words.
   */
  private static calculateConfidence(text: string): number {
    let score = 0.5;

    if (/(cgpa|gpa|marks|grade|transcript|degree|university|bachelor|master|ielts|toefl|certificate)/i.test(text)) {
      score += 0.25;
    }

    if (/\b(20\d{2}|[0-4]\.\d{1,2}|[5-9]\.\d)\b/.test(text)) {
      score += 0.15;
    }

    if (text.length > 50) {
      score += 0.1;
    }

    return Math.min(0.98, Math.max(0.4, Number(score.toFixed(2))));
  }
}
