"""
Academix Pro - Machine Learning Inference Microservice
Built with FastAPI, Pydantic, and scikit-learn
"""

import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI(
    title="Academix Pro ML Analytics Service",
    description="Validated student academic risk prediction and score estimation inference API.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
CLF_PATH = os.path.join(MODELS_DIR, "academic_risk_classifier.joblib")
REG_PATH = os.path.join(MODELS_DIR, "academic_score_regressor.joblib")
META_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

classifier = None
regressor = None
metadata = {}


@app.on_event("startup")
def load_models():
    global classifier, regressor, metadata
    if os.path.exists(CLF_PATH):
        classifier = joblib.load(CLF_PATH)
    if os.path.exists(REG_PATH):
        regressor = joblib.load(REG_PATH)
    if os.path.exists(META_PATH):
        with open(META_PATH, "r") as f:
            metadata = json.load(f)


class PredictionRequest(BaseModel):
    student_id: str
    prior_cumulative_avg: float = Field(..., ge=0.0, le=100.0, description="Prior cumulative normalized percentage")
    prior_subject_score: float = Field(..., ge=0.0, le=100.0, description="Most recent score in the same subject")
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="Current recorded attendance percentage")


class PredictionResponse(BaseModel):
    student_id: str
    risk_probability: float
    is_at_risk_flag: bool
    predicted_score: Optional[float]
    model_version: str
    confidence_tier: str
    decision_support_notice: str


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "classifier_loaded": classifier is not None,
        "regressor_loaded": regressor is not None,
        "metadata": metadata,
    }


@app.post("/predict/academic-risk", response_model=PredictionResponse)
def predict_academic_risk(req: PredictionRequest):
    if classifier is None:
        raise HTTPException(
            status_code=503,
            detail="Trained ML model pipeline is not yet initialized. Run `python train_model.py` to compile artifacts.",
        )

    prior_delta = req.prior_subject_score - req.prior_cumulative_avg
    features = pd.DataFrame([{
        "prior_cumulative_avg": req.prior_cumulative_avg,
        "prior_subject_score": req.prior_subject_score,
        "prior_score_delta": prior_delta,
        "attendance_percentage": req.attendance_percentage,
    }])

    prob = float(classifier.predict_proba(features)[0, 1])
    is_at_risk = bool(prob >= 0.5)

    pred_score = None
    if regressor is not None:
        pred_score = round(float(regressor.predict(features)[0]), 1)

    confidence = "High" if abs(prob - 0.5) > 0.25 else "Moderate"

    return PredictionResponse(
        student_id=req.student_id,
        risk_probability=round(prob * 100, 1),
        is_at_risk_flag=is_at_risk,
        predicted_score=pred_score,
        model_version="RandomForest-GroupKFold-v1.0",
        confidence_tier=confidence,
        decision_support_notice="Advisory prediction for teacher review only. Not for automated disciplinary or grading action.",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
