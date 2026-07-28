import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DocumentParserService } from "@/modules/documents/parser.service";

describe("Phase 2: Document Parser Service Unit Tests", () => {
  let tmpDir: string;
  let samplePdfPath: string;
  let samplePngPath: string;
  let sampleDocxPath: string;
  let sampleDocPath: string;
  let invalidPdfPath: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zyntra-parser-test-"));

    // Valid PDF header
    samplePdfPath = path.join(tmpDir, "sample.pdf");
    fs.writeFileSync(
      samplePdfPath,
      Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nBT\n(Degree: MSc Computer Science. CGPA: 3.85. IELTS: 7.5.)\nET\n")
    );

    // Valid PNG header
    samplePngPath = path.join(tmpDir, "sample.png");
    fs.writeFileSync(samplePngPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    // Valid DOCX header
    sampleDocxPath = path.join(tmpDir, "sample.docx");
    fs.writeFileSync(
      sampleDocxPath,
      Buffer.concat([
        Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        Buffer.from("word/document.xml<w:t>Bachelor of Software Engineering</w:t><w:t>University of Engineering</w:t>"),
      ])
    );

    // Legacy DOC header
    sampleDocPath = path.join(tmpDir, "sample.doc");
    fs.writeFileSync(sampleDocPath, Buffer.from([0xd0, 0xcf, 0x11, 0xe0]));

    // Fake PDF with invalid magic bytes (txt content disguised as pdf)
    invalidPdfPath = path.join(tmpDir, "fake.pdf");
    fs.writeFileSync(invalidPdfPath, Buffer.from("Not a real PDF file"));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("validates magic bytes correctly", () => {
    const validPdf = DocumentParserService.validateMagicBytes(samplePdfPath, "application/pdf");
    expect(validPdf.valid).toBe(true);

    const fakePdf = DocumentParserService.validateMagicBytes(invalidPdfPath, "application/pdf");
    expect(fakePdf.valid).toBe(false);
  });

  it("extracts text from a valid text PDF", () => {
    const result = DocumentParserService.parseFile(samplePdfPath, "application/pdf");
    expect(result.status).toBe("EXTRACTED");
    expect(result.extractedText).toContain("MSc Computer Science");
    expect(result.extractedText).toContain("CGPA: 3.85");
    expect(result.extractedText).toContain("IELTS: 7.5");
    expect(result.textLength).toBeGreaterThan(10);
  });

  it("extracts text from a valid DOCX file", () => {
    const result = DocumentParserService.parseFile(sampleDocxPath, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(result.status).toBe("EXTRACTED");
    expect(result.extractedText).toContain("Software Engineering");
  });

  it("returns OCR_REQUIRED for image files", () => {
    const result = DocumentParserService.parseFile(samplePngPath, "image/png");
    expect(result.status).toBe("OCR_REQUIRED");
    expect(result.errorCode).toBe("OCR_REQUIRED");
  });

  it("returns UNSUPPORTED with clear guidance for legacy .doc files", () => {
    const result = DocumentParserService.parseFile(sampleDocPath, "application/msword");
    expect(result.status).toBe("UNSUPPORTED");
    expect(result.errorCode).toBe("UNSUPPORTED_FOR_EXTRACTION");
  });

  it("rejects mismatched magic bytes with INVALID_FILE_SIGNATURE", () => {
    const result = DocumentParserService.parseFile(invalidPdfPath, "application/pdf");
    expect(result.status).toBe("FAILED");
    expect(result.errorCode).toBe("INVALID_FILE_SIGNATURE");
  });
});
