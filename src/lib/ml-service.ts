import { env } from "@/config/env";
import { logger } from "@/config/logger";

export interface MlPredictionInput {
  cgpa: number;
  ielts: number;
  toefl: number;
  strengthOverall: number;
  cgpaMin: number;
  ieltsMin: number;
  ranking: number;
  academicFit: number;
  languageFit: number;
}

export interface MlPredictionResult {
  admissionProbability: number; // 0..100
  confidence: number; // 0..1
  source: "ml-service" | "local-model";
}

/**
 * Calls the FastAPI ML microservice for admission-success prediction when
 * ML_SERVICE_URL is configured. Otherwise returns a deterministic local
 * estimate that matches the frontend/recommendation formula, so the endpoint
 * always responds even without the Python service running.
 */
export const mlService = {
  isEnabled: env.hasMlService,

  async predict(input: MlPredictionInput): Promise<MlPredictionResult> {
    if (env.hasMlService) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), env.ML_SERVICE_TIMEOUT_MS);
        const res = await fetch(`${env.ML_SERVICE_URL.replace(/\/$/, "")}/predict`, {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        }).finally(() => clearTimeout(timeout));

        if (res.ok) {
          const data = (await res.json()) as { admissionProbability?: number; probability?: number; confidence?: number };
          const prob = data.admissionProbability ?? (data.probability !== undefined ? data.probability * 100 : undefined);
          if (typeof prob === "number") {
            return {
              admissionProbability: Math.round(Math.max(5, Math.min(95, prob))),
              confidence: data.confidence ?? 0.8,
              source: "ml-service",
            };
          }
        }
        logger.warn({ status: res.status }, "ML service returned an unusable response; using local model");
      } catch (err) {
        logger.warn({ err }, "ML service unreachable; using local model");
      }
    }

    return { ...localPredict(input), source: "local-model" };
  },
};

const clamp = (n: number, min = 0, max = 100): number => Math.max(min, Math.min(max, Math.round(n)));

/** Same shape as matching.ts admissionProbability, exposed as a standalone model. */
function localPredict(input: MlPredictionInput): Omit<MlPredictionResult, "source"> {
  const selectivity = input.ranking <= 300 ? 0.72 : input.ranking <= 500 ? 0.82 : 0.9;
  const admissionProbability = clamp(
    (input.academicFit * 0.45 + input.languageFit * 0.25 + input.strengthOverall * 0.3) * selectivity,
    5,
    95,
  );
  // Confidence grows with how much profile signal we have.
  const signal = (input.cgpa > 0 ? 1 : 0) + (input.ielts > 0 || input.toefl > 0 ? 1 : 0) + (input.strengthOverall > 0 ? 1 : 0);
  return { admissionProbability, confidence: 0.5 + signal * 0.15 };
}
