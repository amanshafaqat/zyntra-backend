"""
Zyntra ML Prediction Service (FastAPI).

A standalone microservice the Node backend calls (ML_SERVICE_URL) for
admission-success prediction. It ships with a transparent logistic model whose
weights mirror the platform's readiness formula, so predictions are consistent
with the rest of Zyntra while remaining a genuine, swappable ML endpoint —
retrain `MODEL_WEIGHTS` offline and redeploy without touching the backend.

Run:
    pip install -r requirements.txt
    uvicorn app:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import math
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Zyntra ML Prediction Service", version="1.0.0")


class PredictionInput(BaseModel):
    cgpa: float = Field(0, ge=0, le=4)
    ielts: float = Field(0, ge=0, le=9)
    toefl: float = Field(0, ge=0, le=120)
    strengthOverall: float = Field(0, ge=0, le=100)
    cgpaMin: float = Field(0, ge=0, le=4)
    ieltsMin: float = Field(0, ge=0, le=9)
    ranking: int = Field(1000, ge=1)
    academicFit: float = Field(0, ge=0, le=100)
    languageFit: float = Field(0, ge=0, le=100)


class PredictionOutput(BaseModel):
    admissionProbability: float
    probability: float
    confidence: float


# Logistic-regression-style weights over normalised features. These can be
# replaced with values learned from historical admission outcomes.
MODEL_WEIGHTS = {
    "bias": -0.9,
    "academic_fit": 2.4,
    "language_fit": 1.3,
    "strength": 1.6,
    "selectivity": -1.1,
}


def _selectivity(ranking: int) -> float:
    if ranking <= 300:
        return 0.28
    if ranking <= 500:
        return 0.18
    return 0.10


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def predict(data: PredictionInput) -> PredictionOutput:
    academic = data.academicFit / 100.0
    language = data.languageFit / 100.0
    strength = data.strengthOverall / 100.0
    selectivity = _selectivity(data.ranking)

    z = (
        MODEL_WEIGHTS["bias"]
        + MODEL_WEIGHTS["academic_fit"] * academic
        + MODEL_WEIGHTS["language_fit"] * language
        + MODEL_WEIGHTS["strength"] * strength
        + MODEL_WEIGHTS["selectivity"] * selectivity
    )
    prob = _sigmoid(z)
    prob = max(0.05, min(0.95, prob))

    signal = sum(1 for v in (data.cgpa, max(data.ielts, data.toefl), data.strengthOverall) if v > 0)
    confidence = round(0.5 + signal * 0.15, 2)

    return PredictionOutput(
        admissionProbability=round(prob * 100, 1),
        probability=round(prob, 4),
        confidence=confidence,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "zyntra-ml"}


@app.post("/predict", response_model=PredictionOutput)
def predict_endpoint(data: PredictionInput) -> PredictionOutput:
    return predict(data)


@app.post("/predict/batch", response_model=list[PredictionOutput])
def predict_batch(items: list[PredictionInput]) -> list[PredictionOutput]:
    return [predict(item) for item in items]
