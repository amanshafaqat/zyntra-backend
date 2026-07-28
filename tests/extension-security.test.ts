import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Workstream 4 — Extension Security & Preview-Before-Fill Tests", () => {
  const manifestPath = path.join(__dirname, "../../zyntra-frontend-final/extension/manifest.json");
  const contentScriptPath = path.join(__dirname, "../../zyntra-frontend-final/extension/content/content.js");

  it("should enforce minimal permissions in Manifest V3 without <all_urls>", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions).toEqual(["activeTab", "scripting", "storage"]);

    // Verify <all_urls> is NOT present in content script matches or host permissions
    const contentMatches = manifest.content_scripts[0].matches;
    expect(contentMatches).not.toContain("<all_urls>");
    expect(manifest.host_permissions).not.toContain("<all_urls>");

    // Verify explicit supported portal domains are configured
    const matchesStr = contentMatches.join(" ");
    expect(matchesStr).toContain("uni-assist.de");
    expect(matchesStr).toContain("tum.de");
    expect(matchesStr).toContain("uni-passau.de");
  });

  it("should contain sensitive field exclusion and Preview Modal logic in content script", () => {
    const code = fs.readFileSync(contentScriptPath, "utf-8");

    expect(code).toContain("isSensitiveField");
    expect(code).toContain("password");
    expect(code).toContain("card");
    expect(code).toContain("ssn");
    expect(code).toContain("showPreviewModal");
    expect(code).toContain("safelyInjectField");
    expect(code).not.toContain("form.submit()");
  });
});
