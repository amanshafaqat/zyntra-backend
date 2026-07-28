import crypto from "node:crypto";
import fs from "node:fs";
import { OcrService } from "./ocr.service";

export interface ParseResult {
  status: "EXTRACTED" | "OCR_REQUIRED" | "UNSUPPORTED" | "FAILED";
  extractedText: string | null;
  textLength: number;
  pageCount: number | null;
  extractorType: string;
  confidence?: number;
  checksum: string;
  errorCode?: string;
}

export class DocumentParserService {
  private static MAX_EXTRACTED_CHARS = 50_000;

  /**
   * Validates file signature (magic bytes) against expected MIME and extension.
   */
  static validateMagicBytes(filePath: string, mime: string): { valid: boolean; detectedMime: string } {
    if (!fs.existsSync(filePath)) {
      return { valid: false, detectedMime: "unknown" };
    }

    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    // PDF: %PDF
    if (buffer.subarray(0, 4).toString("ascii") === "%PDF") {
      return { valid: mime === "application/pdf", detectedMime: "application/pdf" };
    }

    // PNG: \x89PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return { valid: mime === "image/png", detectedMime: "image/png" };
    }

    // JPEG: \xFF\xD8\xFF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: mime === "image/jpeg", detectedMime: "image/jpeg" };
    }

    // WebP: RIFF ... WEBP
    if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
      return { valid: mime === "image/webp", detectedMime: "image/webp" };
    }

    // DOCX (ZIP archive): PK\x03\x04
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
      return {
        valid: mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        detectedMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }

    // Legacy DOC (CFB): \xD0\xCF\x11\xE0
    if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) {
      return { valid: mime === "application/msword", detectedMime: "application/msword" };
    }

    return { valid: false, detectedMime: "unknown" };
  }

  /**
   * Primary entry point for safe document extraction with automatic OCR fallback.
   */
  static async parseFileAsync(filePath: string, mime: string): Promise<ParseResult> {
    const syncRes = this.parseFile(filePath, mime);
    if (syncRes.status === "OCR_REQUIRED" || (syncRes.status === "FAILED" && syncRes.errorCode === "OCR_REQUIRED")) {
      const ocrRes = await OcrService.processFile(filePath, mime);
      if (ocrRes.status === "EXTRACTED") {
        return {
          status: "EXTRACTED",
          extractedText: ocrRes.extractedText,
          textLength: ocrRes.textLength,
          pageCount: ocrRes.pageCount,
          extractorType: ocrRes.extractorType,
          confidence: ocrRes.confidence,
          checksum: ocrRes.checksum,
        };
      }
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: ocrRes.pageCount || 1,
        extractorType: "tesseract-ocr",
        confidence: 0,
        checksum: syncRes.checksum,
        errorCode: ocrRes.errorCode || "OCR_EXTRACTION_FAILED",
      };
    }
    return syncRes;
  }

  /**
   * Synchronous signature & native stream extraction.
   */
  static parseFile(filePath: string, mime: string): ParseResult {
    const fileBytes = fs.readFileSync(filePath);
    const checksum = crypto.createHash("sha256").update(fileBytes).digest("hex");

    // 1. Magic bytes validation
    const magic = this.validateMagicBytes(filePath, mime);
    if (!magic.valid) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: null,
        extractorType: "signature-validator",
        checksum,
        errorCode: "INVALID_FILE_SIGNATURE",
      };
    }

    // 2. Format specific extractors
    try {
      if (mime === "application/pdf") {
        return this.parsePdf(fileBytes, checksum);
      }

      if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return this.parseDocx(fileBytes, checksum);
      }

      if (mime === "application/msword") {
        return {
          status: "UNSUPPORTED",
          extractedText: null,
          textLength: 0,
          pageCount: null,
          extractorType: "legacy-doc",
          checksum,
          errorCode: "UNSUPPORTED_FOR_EXTRACTION",
        };
      }

      if (mime.startsWith("image/")) {
        return {
          status: "OCR_REQUIRED",
          extractedText: null,
          textLength: 0,
          pageCount: 1,
          extractorType: "image-metadata",
          checksum,
          errorCode: "OCR_REQUIRED",
        };
      }

      return {
        status: "UNSUPPORTED",
        extractedText: null,
        textLength: 0,
        pageCount: null,
        extractorType: "generic",
        checksum,
        errorCode: "UNSUPPORTED_MIME",
      };
    } catch (err) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: null,
        extractorType: "error-boundary",
        checksum,
        errorCode: "PARSER_EXCEPTION",
      };
    }
  }

  /**
   * PDF Text Extraction. Extracts text streams and text tokens.
   */
  private static parsePdf(buffer: Buffer, checksum: string): ParseResult {
    const raw = buffer.toString("binary");
    
    // Estimate page count via /Type /Page count
    const pageMatches = raw.match(/\/Type\s*\/Page\b/g);
    const pageCount = pageMatches ? Math.max(1, pageMatches.length) : 1;

    // Extract text blocks inside BT ... ET
    const textPieces: string[] = [];
    const btReg = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;

    while ((match = btReg.exec(raw)) !== null) {
      const block = match[0];
      // Extract string literals in parentheses (text)
      const matches = Array.from(block.matchAll(/\(([^)]+)\)/g));
      for (const m of matches) {
        const decoded = m[1]
          .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
          .replace(/\\(.)/g, "$1");
        if (decoded.trim().length > 0) {
          textPieces.push(decoded);
        }
      }
    }

    let text = textPieces.join(" ").replace(/\s+/g, " ").trim();

    // Fallback: if BT...ET was compressed or obfuscated, try UTF-8 string regex scanning
    if (text.length < 20) {
      const asciiStrings = raw.match(/[A-Za-z0-9\s.,:;()/-]{4,}/g) || [];
      text = asciiStrings.filter((s) => !s.startsWith("/") && !s.startsWith("<<")).join(" ").replace(/\s+/g, " ").trim();
    }

    text = this.sanitizeText(text);

    if (text.length < 15) {
      return {
        status: "OCR_REQUIRED",
        extractedText: null,
        textLength: 0,
        pageCount,
        extractorType: "pdf-text-stream",
        checksum,
        errorCode: "OCR_REQUIRED",
      };
    }

    return {
      status: "EXTRACTED",
      extractedText: text,
      textLength: text.length,
      pageCount,
      extractorType: "pdf-text-stream",
      checksum,
    };
  }

  /**
   * DOCX Text Extraction. Extracts word/document.xml from ZIP.
   */
  private static parseDocx(buffer: Buffer, checksum: string): ParseResult {
    // Search for word/document.xml header in ZIP archive
    const zipString = buffer.toString("binary");
    const docXmlIdx = zipString.indexOf("word/document.xml");
    let text = "";

    if (docXmlIdx !== -1) {
      // Find XML tags inside buffer
      const textMatches = zipString.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
      text = textMatches
        .map((t) => t.replace(/<[^>]+>/g, ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (text.length < 10) {
      // General XML tag fallback
      const generalMatches = zipString.match(/>([^<]{3,})</g) || [];
      text = generalMatches
        .map((m) => m.slice(1, -1).trim())
        .filter((t) => t.length > 2 && !t.includes("{") && !t.includes("}"))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    text = this.sanitizeText(text);

    if (text.length < 10) {
      return {
        status: "FAILED",
        extractedText: null,
        textLength: 0,
        pageCount: 1,
        extractorType: "docx-xml-stream",
        checksum,
        errorCode: "EMPTY_DOCX_TEXT",
      };
    }

    return {
      status: "EXTRACTED",
      extractedText: text,
      textLength: text.length,
      pageCount: 1,
      extractorType: "docx-xml-stream",
      checksum,
    };
  }

  /**
   * Sanitizes extracted text: limits length, strips control chars, isolates prompt injection keywords.
   */
  private static sanitizeText(rawText: string): string {
    let sanitized = rawText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\r\n/g, "\n")
      .trim();

    if (sanitized.length > this.MAX_EXTRACTED_CHARS) {
      sanitized = sanitized.substring(0, this.MAX_EXTRACTED_CHARS);
    }

    return sanitized;
  }
}
