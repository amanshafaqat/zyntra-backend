import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Workstream 5 — Real Portal HTML Fixture & Field Matching Tests", () => {
  const portalDir = path.join(__dirname, "fixtures/portals");

  const FIELD_MAP = [
    { keys: ["email", "user_email", "applicant_email"], field: "email", label: "Email Address" },
    { keys: ["degree", "qualification", "bachelor_degree", "major"], field: "degree", label: "Degree Title" },
    { keys: ["institution", "university", "college", "school"], field: "institution", label: "University" },
    { keys: ["cgpa", "gpa", "grade", "marks"], field: "cgpa", label: "CGPA / Grade" },
    { keys: ["ielts", "ielts_score", "ielts_band"], field: "ielts", label: "IELTS Band Score" },
    { keys: ["toefl", "toefl_score"], field: "toefl", label: "TOEFL Score" },
    { keys: ["fullname", "full_name", "applicant_name", "first_name", "last_name", "name"], field: "name", label: "Full Name" },
  ];

  function isSensitive(name: string, type: string) {
    const n = name.toLowerCase();
    const t = type.toLowerCase();
    return t === "password" || n.includes("password") || n.includes("card") || n.includes("ssn");
  }

  function simulateFieldDetection(html: string) {
    const inputMatches = html.match(/<input[^>]+>/gi) || [];
    const detected: { field: string; name: string }[] = [];

    for (const tag of inputMatches) {
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      const typeMatch = tag.match(/type=["']([^"']+)["']/i);
      const name = nameMatch ? nameMatch[1] : "";
      const type = typeMatch ? typeMatch[1] : "text";

      if (isSensitive(name, type)) continue;

      for (const rule of FIELD_MAP) {
        if (rule.keys.some((k) => name.toLowerCase().includes(k))) {
          detected.push({ field: rule.field, name });
          break;
        }
      }
    }
    return detected;
  }

  it("should accurately detect target fields on Uni-Assist portal fixture", () => {
    const html = fs.readFileSync(path.join(portalDir, "uni-assist.html"), "utf-8");
    const matches = simulateFieldDetection(html);

    expect(matches.some((m) => m.field === "name")).toBe(true);
    expect(matches.some((m) => m.field === "email")).toBe(true);
    expect(matches.some((m) => m.field === "degree")).toBe(true);
    expect(matches.some((m) => m.field === "institution")).toBe(true);
    expect(matches.some((m) => m.field === "cgpa")).toBe(true);
    expect(matches.some((m) => m.field === "ielts")).toBe(true);

    // Verify password field is excluded
    expect(matches.some((m) => m.name.includes("password"))).toBe(false);
  });

  it("should accurately detect target fields on TUMonline portal fixture", () => {
    const html = fs.readFileSync(path.join(portalDir, "tum-online.html"), "utf-8");
    const matches = simulateFieldDetection(html);

    expect(matches.some((m) => m.field === "name")).toBe(true);
    expect(matches.some((m) => m.field === "email")).toBe(true);
    expect(matches.some((m) => m.field === "degree")).toBe(true);
    expect(matches.some((m) => m.field === "cgpa")).toBe(true);

    // Verify payment credit card field is excluded
    expect(matches.some((m) => m.name.includes("card"))).toBe(false);
  });

  it("should accurately detect target fields on Passau, Curtin, and Deakin portal fixtures", () => {
    for (const file of ["passau-portal.html", "curtin-apply.html", "deakin-apply.html"]) {
      const html = fs.readFileSync(path.join(portalDir, file), "utf-8");
      const matches = simulateFieldDetection(html);

      expect(matches.length).toBeGreaterThanOrEqual(4);
      expect(matches.some((m) => m.field === "name")).toBe(true);
      expect(matches.some((m) => m.field === "email")).toBe(true);
    }
  });
});
