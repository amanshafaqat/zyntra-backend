import { describe, expect, it, beforeAll, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { createCanvas } from "canvas";
import { PDFDocument } from "pdf-lib";
import { OcrService } from "../src/modules/documents/ocr.service";
import { DocumentParserService } from "../src/modules/documents/parser.service";

describe("Workstream 2 — OCR & Scanned Document Extraction Tests", () => {
  const tmpDir = path.join(__dirname, "tmp-ocr");

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("should extract text from a valid PDF document using OcrService & pdf-lib", async () => {
    const pdfPath = path.join(tmpDir, "sample_transcript.pdf");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText("TRANSCRIPT OF RECORDS Name: Shehroz Ali CGPA: 3.85 IELTS: 7.5 Degree: BSc Computer Science", {
      x: 50,
      y: 350,
      size: 14,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, Buffer.from(pdfBytes));

    const res = await OcrService.processFile(pdfPath, "application/pdf");
    expect(res.status).toBe("EXTRACTED");
    expect(res.extractorType).toBe("tesseract-ocr");
    expect(res.extractedText).toContain("3.85");
    expect(res.extractedText).toContain("IELTS");
    expect(res.confidence).toBeGreaterThan(0.5);
    expect(res.pageCount).toBe(1);
  });

  it("should perform genuine pixel OCR on rendered image files using Tesseract.js", async () => {
    const imgPath = path.join(tmpDir, "scanned_certificate.png");
    
    // Generate real pixel PNG using canvas
    const canvas = createCanvas(500, 150);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 500, 150);
    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.fillText("CERTIFICATE OF COMPLETION", 30, 40);
    ctx.fillText("Name: Shehroz Ali  IELTS Score: 7.5", 30, 80);

    const pngBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(imgPath, pngBuffer);

    const res = await OcrService.processFile(imgPath, "image/png");
    expect(res.status).toBe("EXTRACTED");
    expect(res.extractorType).toBe("tesseract-ocr");
    expect(res.extractedText).toBeDefined();
    expect(res.extractedText?.toUpperCase()).toContain("CERTIFICATE");
    expect(res.confidence).toBeGreaterThan(0.4);
    expect(res.checksum).toBeDefined();
  }, 20000);

  it("should detect password-protected encrypted PDFs and return FAILED status", async () => {
    const encPdfPath = path.join(tmpDir, "encrypted_transcript.pdf");
    const encPdfBytes = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n2 0 obj\n<< /Filter /Standard /V 2 /R 3 /P -4 /Encrypt 3 0 R >>\nendobj\n%%EOF"
    );
    fs.writeFileSync(encPdfPath, encPdfBytes);

    const res = await OcrService.processFile(encPdfPath, "application/pdf");
    expect(res.status).toBe("FAILED");
    expect(res.errorCode).toBe("PASSWORD_PROTECTED_PDF");
  });

  it("should handle corrupt or unreadable files gracefully with FAILED status", async () => {
    const badPath = path.join(tmpDir, "corrupt.png");
    fs.writeFileSync(badPath, Buffer.from("corrupt pixel buffer data"));

    const res = await DocumentParserService.parseFileAsync(badPath, "image/png");
    expect(res.status).toBe("FAILED");
    expect(res.errorCode).toBeDefined();
  });
});
