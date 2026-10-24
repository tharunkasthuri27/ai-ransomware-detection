"""
SENTINEL-X FastAPI Backend Server
Provides local REST API endpoints for the cybersecurity workstation interface.
Binds to localhost by default. Integrates filesystem monitoring, safe simulation,
behavioral ML inference, SQLite persistence, and security controls.
"""

import os
import uuid
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import SentinelDatabase
from security_validator import SandboxSecurityValidator
from simulator import SafeSandboxSimulator
from monitor import SandboxWatcherService
from feature_extractor import FeatureExtractor
from detector import BehavioralDetector
from train_eval import train_and_evaluate


app = FastAPI(
    title="SENTINEL-X AI Ransomware Behaviour Analysis Daemon",
    description="Local backend service for educational cybersecurity laboratory",
    version="1.0.0-lab"
)

# Enable CORS for local Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core services
SANDBOX_PATH = os.path.abspath("./sandbox_data")
db = SentinelDatabase("sentinel_lab.db")
validator = SandboxSecurityValidator(SANDBOX_PATH)
detector = BehavioralDetector("ransomware_detector.joblib")
extractor = FeatureExtractor(window_seconds=3.0)

# In-memory sliding window buffer for real-time feature extraction
recent_events_buffer: List[Dict[str, Any]] = []


def on_fs_event(event_dict: Dict[str, Any]):
    """Callback invoked by watchdog monitor when sandbox file activity occurs."""
    event_id = f"evt-{uuid.uuid4().hex[:8]}"
    event_dict["id"] = event_id
    event_dict["scenario_id"] = "LIVE_MONITOR"
    event_dict["is_simulated"] = 1

    # Keep sliding buffer of recent 20 events
    recent_events_buffer.append(event_dict)
    if len(recent_events_buffer) > 20:
        recent_events_buffer.pop(0)

    # Extract features from current window
    features = extractor.extract_features(recent_events_buffer)
    
    # Run ML detector + behavioral rule evaluation
    result = detector.predict(features)
    
    event_dict["activity_rate"] = features["event_rate_per_sec"]
    event_dict["risk_score"] = result["risk_score"]
    event_dict["risk_level"] = result["risk_level"]
    event_dict["detection_reason"] = result["detection_explanation"]

    # Persist to SQLite
    db.insert_event(event_dict)

    # Insert feature record
    feature_record = {
        "id": f"fv-{uuid.uuid4().hex[:8]}",
        "timestamp": event_dict["timestamp"],
        "window_seconds": 3.0,
        **features,
        "ml_prediction": result["ml_prediction"],
        "ml_confidence": result["ml_confidence"],
        "rule_warnings": result["rule_warnings"],
        "final_risk_score": result["risk_score"],
        "classification": result["risk_level"]
    }
    db.insert_feature_vector(feature_record)

    # Trigger alert if risk >= 60
    if result["risk_score"] >= 60:
        alert_data = {
            "id": f"alt-{uuid.uuid4().hex[:8]}",
            "timestamp": event_dict["timestamp"],
            "title": f"{result['risk_level']}: Behavioral Threat Detected",
            "severity": result["risk_level"],
            "message": result["detection_explanation"],
            "risk_score": result["risk_score"],
            "features_triggered": result["rule_warnings"],
            "acknowledged": False,
            "scenario_id": "LIVE_MONITOR",
            "event_id": event_id
        }
        db.insert_alert(alert_data)


# Instantiate simulator & watcher
simulator = SafeSandboxSimulator(SANDBOX_PATH)
watcher = SandboxWatcherService(SANDBOX_PATH, on_event=on_fs_event)


@app.on_event("startup")
def startup_event():
    watcher.start()


@app.on_event("shutdown")
def shutdown_event():
    watcher.stop()
    simulator.stop_simulation()


# --- Pydantic Request Models ---
class SimulationRequest(BaseModel):
    scenario: str = Field(..., example="NORMAL_OFFICE")
    duration_seconds: int = Field(10, ge=3, le=60)
    operation_limit: int = Field(30, ge=5, le=100)


class PredictRequest(BaseModel):
    event_rate_per_sec: float
    modification_ratio: float
    rename_ratio: float
    extension_entropy: float
    rapid_burst_count: int
    suspicious_ext_count: int


# --- API Endpoints ---
@app.get("/api/status")
def get_system_status():
    return {
        "online": True,
        "version": "1.0.0-lab",
        "sandbox_dir": str(SANDBOX_PATH),
        "watcher_status": "MONITORING ACTIVE" if watcher.is_active else "STOPPED",
        "database_status": "SQLITE READY",
        "model_loaded": detector.model is not None,
        "simulation_running": simulator.is_running
    }


@app.get("/api/events")
def get_audit_events(limit: int = Query(100, le=500)):
    return db.get_recent_events(limit=limit)


@app.get("/api/features")
def get_feature_vectors(limit: int = Query(50, le=200)):
    return db.get_recent_features(limit=limit)


@app.get("/api/alerts")
def get_alerts(limit: int = Query(50, le=100)):
    return db.get_alerts(limit=limit)


@app.post("/api/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str):
    db.acknowledge_alert(alert_id)
    return {"status": "success", "acknowledged_id": alert_id}


@app.post("/api/simulate/start")
def start_simulation(req: SimulationRequest):
    if req.scenario not in ["NORMAL_OFFICE", "RAPID_ENCRYPTION_SIM", "RENAME_BURST_SIM"]:
        raise HTTPException(status_code=400, detail="Invalid scenario name.")
    
    simulator.start_simulation(
        scenario=req.scenario,
        duration_sec=req.duration_seconds,
        max_operations=req.operation_limit
    )
    return {
        "status": "started",
        "scenario": req.scenario,
        "duration_seconds": req.duration_seconds,
        "sandbox_directory": str(SANDBOX_PATH)
    }


@app.post("/api/simulate/stop")
def stop_simulation():
    simulator.stop_simulation()
    return {"status": "stopped"}


@app.post("/api/simulate/reset")
def reset_sandbox():
    simulator.reset_sandbox_files()
    return {"status": "reset_complete", "sandbox_directory": str(SANDBOX_PATH)}


@app.post("/api/predict")
def run_model_inference(req: PredictRequest):
    features = req.dict()
    result = detector.predict(features)
    return result


@app.get("/api/model/metrics")
def get_model_metrics():
    metrics_path = "model_metrics.json"
    if os.path.exists(metrics_path):
        import json
        with open(metrics_path, "r") as f:
            return json.load(f)
    # Generate on the fly if not yet run
    return train_and_evaluate(n_samples=2500)


@app.post("/api/model/train")
def train_model():
    metrics = train_and_evaluate(n_samples=5000)
    detector.load_model_if_available()
    return {"status": "trained", "metrics": metrics}


@app.post("/api/database/reset")
def reset_database():
    db.reset_database()
    return {"status": "database_cleared"}


@app.get("/api/export/csv")
def export_csv():
    events = db.get_recent_events(limit=1000)
    headers = ["id", "timestamp", "event_type", "sandbox_path", "filename", "file_size_bytes", "entropy_delta", "activity_rate", "risk_score", "risk_level", "scenario_id", "detection_reason"]
    rows = [headers]
    for e in events:
        rows.append([
            str(e.get("id")),
            str(e.get("timestamp")),
            str(e.get("event_type")),
            str(e.get("sandbox_path")),
            str(e.get("filename")),
            str(e.get("file_size_bytes")),
            str(e.get("entropy_delta")),
            str(e.get("activity_rate")),
            str(e.get("risk_score")),
            str(e.get("risk_level")),
            str(e.get("scenario_id")),
            f'"{str(e.get("detection_reason", "")).replace(chr(34), "")}"'
        ])
    csv_content = "\n".join([",".join(row) for row in rows])
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinel_x_events.csv"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
