"""
SENTINEL-X Scikit-Learn Model Training & Evaluation Pipeline
Trains an ensemble RandomForestClassifier on reproducible synthetic behavioral datasets.
Splits strictly into 80% Train and 20% Test sets to prevent data leakage.
Exports metrics.json, confusion matrix, and serialized joblib model.
"""

import json
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, precision_score, recall_score, f1_score, accuracy_score
import joblib

from dataset_generator import generate_synthetic_behavioral_dataset

FEATURE_NAMES = [
    "event_rate_per_sec",
    "modification_ratio",
    "rename_ratio",
    "extension_entropy",
    "rapid_burst_count",
    "suspicious_ext_count"
]


def train_and_evaluate(
    n_samples: int = 5000,
    model_output_path: str = "ransomware_detector.joblib",
    metrics_output_path: str = "model_metrics.json"
):
    print("==================================================")
    print(" SENTINEL-X AI Model Training & Evaluation")
    print("==================================================")
    print(f"[*] Generating {n_samples} reproducible synthetic behavioral traces...")
    df = generate_synthetic_behavioral_dataset(n_samples=n_samples, random_seed=42)

    X = df[FEATURE_NAMES]
    y = df["label"]

    # Strict 80/20 train/test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[*] Training samples: {len(X_train)} | Test samples: {len(X_test)}")
    print("[*] Training RandomForestClassifier (100 estimators, max_depth=8)...")

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=42
    )
    clf.fit(X_train, y_train)

    # Predictions on unseen test set
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

    # Feature importances
    importances = clf.feature_importances_
    feat_imp = []
    descriptions = {
        "event_rate_per_sec": "Operations per second in sliding window",
        "modification_ratio": "Percentage of events that modify files",
        "rename_ratio": "Percentage of events that rename files",
        "extension_entropy": "Shannon entropy variance (indicates ciphertext)",
        "rapid_burst_count": "Count of sub-100ms automated operations",
        "suspicious_ext_count": "Files bearing known ransomware canary extensions"
    }
    for name, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True):
        feat_imp.append({
            "name": name,
            "weight": round(float(imp), 4),
            "description": descriptions.get(name, "")
        })

    metrics = {
        "algorithm": "RandomForestClassifier (Ensemble 100 Trees)",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "true_negative": int(tn),
            "false_negative": int(fn)
        },
        "total_training_samples": len(X_train),
        "total_test_samples": len(X_test),
        "feature_importances": feat_imp,
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "dataset_source": "Reproducible Synthetic Behavioral Trace Dataset",
        "limitations": [
            "Evaluation on synthetic data provides a baseline but does not substitute for testing on diverse real-world malware samples.",
            "Heavily throttled ransomware operations ('low-and-slow') can evade rate-based windowing features.",
            "High-throughput benign tasks (e.g. batch compilation) may produce false positives unless supplemented by process lineage checks."
        ]
    }

    # Save trained model and metrics file
    joblib.dump(clf, model_output_path)
    with open(metrics_output_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n--- MODEL PERFORMANCE RESULTS ---")
    print(f"Accuracy:  {acc*100:.2f}%")
    print(f"Precision: {prec*100:.2f}%")
    print(f"Recall:    {rec*100:.2f}%")
    print(f"F1 Score:  {f1*100:.2f}%")
    print(f"\nConfusion Matrix:")
    print(f"  TN: {tn:4d} | FP: {fp:4d}")
    print(f"  FN: {fn:4d} | TP: {tp:4d}")
    print(f"\nSaved model artifact to: {model_output_path}")
    print(f"Saved evaluation metrics to: {metrics_output_path}")
    print("==================================================")
    return metrics


if __name__ == "__main__":
    train_and_evaluate()
