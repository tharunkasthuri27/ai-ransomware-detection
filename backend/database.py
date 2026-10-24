"""
SENTINEL-X SQLite Database Storage Layer
Handles persistent storage for audit events, sliding window features,
alerts, and scenario metadata.
"""

import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime


class SentinelDatabase:
    def __init__(self, db_path: str = "sentinel_lab.db"):
        self.db_path = Path(db_path).resolve()
        self.init_schema()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_schema(self):
        """Initialise tables for events, features, alerts, and model evaluation metrics."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Audit Events table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                sandbox_path TEXT NOT NULL,
                filename TEXT NOT NULL,
                old_path TEXT,
                file_size_bytes INTEGER DEFAULT 0,
                entropy_delta REAL DEFAULT 0.0,
                activity_rate REAL DEFAULT 0.0,
                risk_level TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                detection_reason TEXT,
                scenario_id TEXT NOT NULL,
                is_simulated INTEGER DEFAULT 1
            );
            """)

            # 2. Extracted Features table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS feature_vectors (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                window_seconds REAL NOT NULL,
                event_rate_per_sec REAL NOT NULL,
                modification_ratio REAL NOT NULL,
                rename_ratio REAL NOT NULL,
                extension_entropy REAL NOT NULL,
                rapid_burst_count INTEGER NOT NULL,
                unique_files_targeted INTEGER NOT NULL,
                suspicious_ext_count INTEGER NOT NULL,
                ml_prediction TEXT NOT NULL,
                ml_confidence REAL NOT NULL,
                rule_warnings TEXT,
                final_risk_score INTEGER NOT NULL,
                classification TEXT NOT NULL
            );
            """)

            # 3. Security Alerts table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                title TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                features_triggered TEXT,
                acknowledged INTEGER DEFAULT 0,
                scenario_id TEXT NOT NULL,
                event_id TEXT
            );
            """)

            # 4. Simulation Sessions table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS simulation_sessions (
                id TEXT PRIMARY KEY,
                scenario_type TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                events_count INTEGER DEFAULT 0,
                max_risk_score INTEGER DEFAULT 0,
                status TEXT NOT NULL
            );
            """)

            conn.commit()

    def insert_event(self, event_data: Dict[str, Any]):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO audit_events (
                id, timestamp, event_type, sandbox_path, filename, old_path,
                file_size_bytes, entropy_delta, activity_rate, risk_level,
                risk_score, detection_reason, scenario_id, is_simulated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_data.get("id"),
                event_data.get("timestamp"),
                event_data.get("event_type"),
                event_data.get("sandbox_path"),
                event_data.get("filename"),
                event_data.get("old_path"),
                event_data.get("file_size_bytes", 0),
                event_data.get("entropy_delta", 0.0),
                event_data.get("activity_rate", 0.0),
                event_data.get("risk_level", "NORMAL"),
                event_data.get("risk_score", 0),
                event_data.get("detection_reason", ""),
                event_data.get("scenario_id", "NORMAL_OFFICE"),
                1 if event_data.get("is_simulated", True) else 0
            ))
            conn.commit()

    def insert_feature_vector(self, feat_data: Dict[str, Any]):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO feature_vectors (
                id, timestamp, window_seconds, event_rate_per_sec,
                modification_ratio, rename_ratio, extension_entropy,
                rapid_burst_count, unique_files_targeted, suspicious_ext_count,
                ml_prediction, ml_confidence, rule_warnings,
                final_risk_score, classification
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                feat_data.get("id"),
                feat_data.get("timestamp"),
                feat_data.get("window_seconds", 3.0),
                feat_data.get("event_rate_per_sec", 0.0),
                feat_data.get("modification_ratio", 0.0),
                feat_data.get("rename_ratio", 0.0),
                feat_data.get("extension_entropy", 0.0),
                feat_data.get("rapid_burst_count", 0),
                feat_data.get("unique_files_targeted", 0),
                feat_data.get("suspicious_ext_count", 0),
                feat_data.get("ml_prediction", "NORMAL"),
                feat_data.get("ml_confidence", 0.0),
                json.dumps(feat_data.get("rule_warnings", [])),
                feat_data.get("final_risk_score", 0),
                feat_data.get("classification", "NORMAL")
            ))
            conn.commit()

    def insert_alert(self, alert_data: Dict[str, Any]):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO alerts (
                id, timestamp, title, severity, message, risk_score,
                features_triggered, acknowledged, scenario_id, event_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert_data.get("id"),
                alert_data.get("timestamp"),
                alert_data.get("title"),
                alert_data.get("severity"),
                alert_data.get("message"),
                alert_data.get("risk_score", 0),
                json.dumps(alert_data.get("features_triggered", [])),
                1 if alert_data.get("acknowledged", False) else 0,
                alert_data.get("scenario_id", "NORMAL_OFFICE"),
                alert_data.get("event_id")
            ))
            conn.commit()

    def get_recent_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_recent_features(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM feature_vectors ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            result = []
            for r in rows:
                d = dict(r)
                if d.get("rule_warnings"):
                    try:
                        d["rule_warnings"] = json.loads(d["rule_warnings"])
                    except:
                        pass
                result.append(d)
            return result

    def get_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["acknowledged"] = bool(d["acknowledged"])
                if d.get("features_triggered"):
                    try:
                        d["features_triggered"] = json.loads(d["features_triggered"])
                    except:
                        pass
                result.append(d)
            return result

    def acknowledge_alert(self, alert_id: str):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (alert_id,))
            conn.commit()

    def reset_database(self):
        """Wipes events, features, and alerts tables only."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM audit_events;")
            cursor.execute("DELETE FROM feature_vectors;")
            cursor.execute("DELETE FROM alerts;")
            cursor.execute("DELETE FROM simulation_sessions;")
            conn.commit()
