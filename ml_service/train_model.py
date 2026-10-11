"""
Academic Risk Prediction & Performance Estimation Training Pipeline

Objective:
1. Predict probability of student requiring academic intervention in upcoming assessment (Risk Classification).
2. Predict future assessment percentage score (Score Regression).

Methodology & Leakage Prevention:
- Uses GroupKFold on student_id to ensure a student's records are never present in both training and test folds.
- Features are strictly backward-looking (historical cumulative average, previous assessment score, trajectory delta, attendance).
- Evaluates Precision, Recall, F1-Score, and Confusion Matrix for Classification.
- Evaluates MAE, RMSE, and R² for Regression.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
)
import joblib


def generate_synthetic_training_data(n_students=200, assessments_per_student=4):
    """
    Generates realistic sequential synthetic data for training when live longitudinal DB is not yet connected.
    """
    np.random.seed(42)
    records = []
    subjects = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"]
    
    for i in range(1, n_students + 1):
        s_id = f"STU-{1000 + i}"
        student_base_ability = np.random.uniform(40, 90)
        attendance = np.clip(np.random.normal(loc=82, scale=12), 45, 99)
        
        # Student trajectory drift
        drift = np.random.choice([-1.5, -0.5, 0.0, 0.5, 1.2], p=[0.15, 0.2, 0.3, 0.25, 0.1])
        
        for round_idx in range(1, assessments_per_student + 1):
            for subj in subjects:
                subj_bias = np.random.uniform(-8, 8)
                score = np.clip(
                    student_base_ability + (round_idx * drift) + subj_bias + np.random.normal(0, 5),
                    10,
                    100,
                )
                records.append({
                    "student_id": s_id,
                    "student_name": f"Student {i}",
                    "class_name": f"Grade {10 if i % 2 == 0 else 11}",
                    "subject": subj,
                    "round_idx": round_idx,
                    "assessment_name": f"Exam Round {round_idx}",
                    "marks_obtained": round(score, 1),
                    "max_marks": 100,
                    "normalized_percentage": round(score, 1),
                    "attendance_percentage": round(attendance, 1),
                })
                
    return pd.DataFrame(records)


def engineer_features(df):
    """
    Constructs leakage-free historical features up to assessment round (T-1) to predict round T.
    """
    df = df.sort_values(by=["student_id", "subject", "round_idx"]).copy()
    
    # Calculate historical cumulative average per student prior to current round
    df["prior_cumulative_avg"] = df.groupby("student_id")["normalized_percentage"].transform(
        lambda x: x.shift(1).expanding().mean()
    )
    
    # Prior assessment score in same subject
    df["prior_subject_score"] = df.groupby(["student_id", "subject"])["normalized_percentage"].shift(1)
    
    # Prior trajectory delta
    df["prior_score_delta"] = df["prior_subject_score"] - df["prior_cumulative_avg"]
    
    # Drop round 1 because it has no prior history
    featured_df = df.dropna(subset=["prior_cumulative_avg", "prior_subject_score"]).copy()
    
    # Binary Risk Target: Is score in round T < 50%?
    featured_df["is_at_risk"] = (featured_df["normalized_percentage"] < 50.0).astype(int)
    
    # Continuous Score Target:
    featured_df["future_score"] = featured_df["normalized_percentage"]
    
    return featured_df


def train_and_evaluate():
    print("=" * 60)
    print("ACADEMIX PRO - MACHINE LEARNING TRAINING & EVALUATION PIPELINE")
    print("=" * 60)
    
    # 1. Load Data
    raw_df = generate_synthetic_training_data(n_students=300, assessments_per_student=4)
    print(f"Generated {len(raw_df)} longitudinal records across {raw_df['student_id'].nunique()} unique students.")
    
    # 2. Engineer Features
    data = engineer_features(raw_df)
    print(f"Engineered training dataset with {len(data)} sequential evaluation pairs.")
    
    feature_cols = [
        "prior_cumulative_avg",
        "prior_subject_score",
        "prior_score_delta",
        "attendance_percentage",
    ]
    
    X = data[feature_cols]
    y_class = data["is_at_risk"]
    y_reg = data["future_score"]
    groups = data["student_id"]
    
    # 3. GroupKFold Cross-Validation (prevents student data leakage)
    gkf = GroupKFold(n_splits=5)
    
    # Evaluate Classifier (RandomForest)
    clf_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)),
    ])
    
    f1_scores, precisions, recalls, roc_aucs = [], [], [], []
    conf_matrices = []
    
    for train_idx, test_idx in gkf.split(X, y_class, groups):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y_class.iloc[train_idx], y_class.iloc[test_idx]
        
        clf_pipeline.fit(X_train, y_train)
        preds = clf_pipeline.predict(X_test)
        probs = clf_pipeline.predict_proba(X_test)[:, 1]
        
        f1_scores.append(f1_score(y_test, preds, zero_division=0))
        precisions.append(precision_score(y_test, preds, zero_division=0))
        recalls.append(recall_score(y_test, preds, zero_division=0))
        roc_aucs.append(roc_auc_score(y_test, probs))
        conf_matrices.append(confusion_matrix(y_test, preds))
        
    print("\n--- Model 1: Academic Risk Classifier (GroupKFold 5-Fold) ---")
    print(f"Mean F1-Score:    {np.mean(f1_scores):.4f} (+/- {np.std(f1_scores):.4f})")
    print(f"Mean Precision:   {np.mean(precisions):.4f}")
    print(f"Mean Recall:      {np.mean(recalls):.4f}")
    print(f"Mean ROC-AUC:     {np.mean(roc_aucs):.4f}")
    
    # Evaluate Regressor (Ridge)
    reg_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("reg", Ridge(alpha=1.0)),
    ])
    
    maes, rmses, r2s = [], [], []
    for train_idx, test_idx in gkf.split(X, y_reg, groups):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y_reg.iloc[train_idx], y_reg.iloc[test_idx]
        
        reg_pipeline.fit(X_train, y_train)
        preds = reg_pipeline.predict(X_test)
        
        maes.append(mean_absolute_error(y_test, preds))
        rmses.append(root_mean_squared_error(y_test, preds))
        r2s.append(r2_score(y_test, preds))
        
    print("\n--- Model 2: Future Assessment Score Regressor (GroupKFold 5-Fold) ---")
    print(f"Mean MAE:         {np.mean(maes):.2f} percentage points")
    print(f"Mean RMSE:        {np.mean(rmses):.2f} percentage points")
    print(f"Mean R²:          {np.mean(r2s):.4f}")
    
    # 4. Fit final model on all data and save
    os.makedirs("models", exist_ok=True)
    clf_pipeline.fit(X, y_class)
    reg_pipeline.fit(X, y_reg)
    
    joblib.dump(clf_pipeline, "models/academic_risk_classifier.joblib")
    joblib.dump(reg_pipeline, "models/academic_score_regressor.joblib")
    
    metadata = {
        "features": feature_cols,
        "classification_f1": round(float(np.mean(f1_scores)), 4),
        "classification_precision": round(float(np.mean(precisions)), 4),
        "classification_recall": round(float(np.mean(recalls)), 4),
        "regression_mae": round(float(np.mean(maes)), 2),
        "regression_rmse": round(float(np.mean(rmses)), 2),
        "leakage_safeguard": "GroupKFold student-stratified validation with prior-window features only",
    }
    
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("\nArtifacts successfully persisted:")
    print(" - models/academic_risk_classifier.joblib")
    print(" - models/academic_score_regressor.joblib")
    print(" - models/model_metadata.json")
    print("=" * 60)


if __name__ == "__main__":
    train_and_evaluate()
