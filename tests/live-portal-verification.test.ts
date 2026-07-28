import { describe, expect, it } from "vitest";
import http from "node:http";
import https from "node:https";

interface PortalStatus {
  domain: string;
  url: string;
  status: "REACHABLE" | "BLOCKED_BY_WAF" | "UNREACHABLE";
  httpStatusCode?: number;
  note: string;
}

async function checkPortalDomain(url: string, timeoutMs: number = 8000): Promise<PortalStatus> {
  const urlObj = new URL(url);
  const client = urlObj.protocol === "https:" ? https : http;

  return new Promise((resolve) => {
    const req = client.request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: timeoutMs,
      },
      (res) => {
        const code = res.statusCode || 0;
        let status: "REACHABLE" | "BLOCKED_BY_WAF" | "UNREACHABLE" = "UNREACHABLE";
        let note = "";

        if (code >= 200 && code < 400) {
          status = "REACHABLE";
          note = `HTTP ${code} OK`;
        } else if (code === 403 || code === 429 || code === 503) {
          status = "BLOCKED_BY_WAF";
          note = `HTTP ${code} (Protected by WAF / Bot Guard / Cloudflare)`;
        } else {
          status = "UNREACHABLE";
          note = `HTTP ${code} response received`;
        }

        resolve({
          domain: urlObj.hostname,
          url,
          status,
          httpStatusCode: code,
          note,
        });
      }
    );

    req.on("error", (err) => {
      resolve({
        domain: urlObj.hostname,
        url,
        status: "UNREACHABLE",
        note: `Network Error: ${err.message}`,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        domain: urlObj.hostname,
        url,
        status: "UNREACHABLE",
        note: "Request Timed Out",
      });
    });

    req.end();
  });
}

describe("Workstream D — Controlled Live Portal Domain Verification", () => {
  const targetPortals = [
    { name: "Uni-Assist Germany", url: "https://my.uni-assist.de" },
    { name: "TUM Online Germany", url: "https://campus.tum.de" },
    { name: "University of Passau Germany", url: "https://www.uni-passau.de/en/msc-computer-science" },
    { name: "Curtin University Australia", url: "https://study.curtin.edu.au" },
    { name: "Deakin University Australia", url: "https://www.deakin.edu.au/course/master-of-information-technology" },
  ];

  it("should perform controlled non-destructive probes on all 5 supported target domains and report truthful status", async () => {
    const results: PortalStatus[] = [];

    for (const portal of targetPortals) {
      const res = await checkPortalDomain(portal.url);
      results.push(res);
    }

    expect(results).toHaveLength(5);

    console.log("\n=======================================================");
    console.log("TRUTHFUL LIVE PORTAL DOMAIN VERIFICATION REPORT");
    console.log("=======================================================");
    for (const r of results) {
      console.log(`- ${r.domain} (${r.url}): [${r.status}] -> ${r.note}`);
    }
    console.log("=======================================================\n");

    // Ensure all 5 domains were probed and status was recorded
    for (const r of results) {
      expect(["REACHABLE", "BLOCKED_BY_WAF", "UNREACHABLE"]).toContain(r.status);
    }
  }, 45000);
});
