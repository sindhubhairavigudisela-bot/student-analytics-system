# Academix Pro - Machine Learning Extension Service

This module provides a production-grade, decoupled Machine Learning training and inference service for the **Student Performance Analytics & Early Intervention System**.

---

## 1. Objectives & Prediction Targets

1. **Academic Risk Classification (Binary)**
   - **Target:** Predict whether a student has high risk of falling below the academic threshold (<50%) in an upcoming assessment round.
   - **Output:** Calibrated probability score (0.0 to 100.0%) and risk tier.

2. **Future Assessment Score Estimation (Continuous Regression)**
   - **Target:** Estimate expected normalized percentage score in the forthcoming evaluation round.
   - **Output:** Predicted percentage score with confidence intervals.

---

## 2. Prevention of Data Leakage & Methodological Integrity

In educational data analytics, traditional random train/test splits cause severe **data leakage** because records from the same student appear in both train and test partitions. This produces falsely inflated accuracy metrics that collapse when applied to new cohorts.

To prevent leakage, this pipeline implements:
1. **Student Group Stratification (`GroupKFold`):**
   Folds are split strictly across `student_id`. A student's entire historical trajectory is exclusively in either the training set or the validation set.
2. **Strict Time Ordering:**
   Features for round $T$ are computed exclusively from rounds $1, \dots, T-1$. No future grades or concurrent summative outcomes are leaked into the feature space.
3. **No Unwarranted Inferences:**
   Predictions serve exclusively as decision-support alerts for human teachers. The model never assumes intrinsic psychological characteristics or produces automated grading decisions.

---

## 3. Feature Engineering Specification

The model consumes strictly backward-looking features:
- `prior_cumulative_avg`: Running mean score percentage across all prior assessments for the student.
- `prior_subject_score`: Score recorded in the most recent assessment for the target subject.
- `prior_score_delta`: Trajectory slope indicator ($\text{prior\_subject\_score} - \text{prior\_cumulative\_avg}$).
- `attendance_percentage`: Current documented attendance rate (presence exposure metric).

---

## 4. How to Run Locally

### Prerequisites
- Python 3.10+
- `pip`

### Step 1: Install Dependencies
```bash
cd ml_service
pip install -r requirements.txt
```

### Step 2: Train & Evaluate Models
```bash
python train_model.py
```
This executes 5-fold `GroupKFold` cross-validation, prints evaluation metrics (F1, Precision, Recall, ROC-AUC, MAE, RMSE), and exports trained model pipelines to `models/`.

### Step 3: Launch FastAPI Inference API
```bash
uvicorn api:app --reload --port 8000
```
Interactive OpenAPI documentation will be accessible at:
`http://127.0.0.1:8000/docs`

---

## 5. API Endpoints

- `GET /health`: Returns service health and loaded model metadata.
- `POST /predict/academic-risk`:
  **Request Body:**
  ```json
  {
    "student_id": "STU-1002",
    "prior_cumulative_avg": 78.5,
    "prior_subject_score": 52.0,
    "attendance_percentage": 80.0
  }
  ```
  **Response:**
  ```json
  {
    "student_id": "STU-1002",
    "risk_probability": 68.4,
    "is_at_risk_flag": true,
    "predicted_score": 54.2,
    "model_version": "RandomForest-GroupKFold-v1.0",
    "confidence_tier": "High",
    "decision_support_notice": "Advisory prediction for teacher review only. Not for automated disciplinary or grading action."
  }
  ```
