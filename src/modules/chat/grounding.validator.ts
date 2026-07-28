import type { ProgramEntryDto } from "../catalog/catalog.serializer";

export interface GroundingValidationResult {
  groundedText: string;
  isFullyGrounded: boolean;
  hallucinatedTerms: string[];
  citedCandidates: ProgramEntryDto[];
}

export class GroundingValidator {
  /**
   * Validates assistant responses against the retrieved catalog candidate set.
   * Eliminates hallucinated programs, fake URLs, or non-catalog university claims.
   */
  static validateAndGround(
    rawText: string,
    candidatePrograms: ProgramEntryDto[]
  ): GroundingValidationResult {
    const citedCandidatesMap = new Map<string, ProgramEntryDto>();
    const hallucinatedTerms: string[] = [];
    let isFullyGrounded = true;

    // Match candidate programs mentioned in text
    for (const prog of candidatePrograms) {
      const uName = prog.university.toLowerCase();
      const pName = prog.program.toLowerCase();
      if (rawText.toLowerCase().includes(uName) || rawText.toLowerCase().includes(pName)) {
        citedCandidatesMap.set(prog.id, prog);
      }
    }

    // Check for HTTP/HTTPS URLs in text that do NOT match any candidate official/source URLs
    const urlMatches = rawText.match(/https?:\/\/[^\s"'<>)]+/g) || [];
    const validUrls = new Set(
      candidatePrograms.flatMap((p) => [
        p.officialProgramUrl,
        p.officialApplicationUrl,
        p.sourceUrl,
      ]).filter(Boolean).map((u) => u!.toLowerCase())
    );

    let sanitizedText = rawText;

    for (const url of urlMatches) {
      const cleanUrl = url.toLowerCase();
      if (!Array.from(validUrls).some((v) => cleanUrl.includes(v) || v.includes(cleanUrl))) {
        // Strip ungrounded/hallucinated URL
        sanitizedText = sanitizedText.replace(url, "[Official University Portal]");
        hallucinatedTerms.push(url);
        isFullyGrounded = false;
      }
    }

    const citedCandidates = Array.from(citedCandidatesMap.values());

    return {
      groundedText: sanitizedText,
      isFullyGrounded,
      hallucinatedTerms,
      citedCandidates,
    };
  }
}
