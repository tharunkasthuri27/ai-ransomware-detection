"""
SENTINEL-X Behavioral Feature Extractor
Processes raw file system event streams within sliding time windows (e.g. 3.0s)
and computes numerical features for machine learning inference and rule heuristics.
"""

import math
from typing import List, Dict, Any
from datetime import datetime


SUSPICIOUS_EXTENSIONS = {
    ".locked", ".crypto", ".enc", ".crypted", ".crypt",
    ".ransom", ".wnry", ".locky", ".cerber", ".zepto"
}


def compute_shannon_entropy(data_bytes: bytes) -> float:
    """Calculates Shannon entropy in range [0.0, 8.0] divided by 8 for normalized [0, 1]."""
    if not data_bytes:
        return 0.0
    freq = {}
    for byte in data_bytes:
        freq[byte] = freq.get(byte, 0) + 1
    
    entropy = 0.0
    length = len(data_bytes)
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    
    return entropy / 8.0  # Normalize to [0.0, 1.0]


class FeatureExtractor:
    def __init__(self, window_seconds: float = 3.0):
        self.window_seconds = window_seconds

    def extract_features(self, events_window: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes a list of event dictionaries occurring within the sliding window
        and produces a consolidated numerical feature vector.
        """
        if not events_window:
            return {
                "event_rate_per_sec": 0.0,
                "modification_ratio": 0.0,
                "rename_ratio": 0.0,
                "extension_entropy": 0.0,
                "rapid_burst_count": 0,
                "unique_files_targeted": 0,
                "suspicious_ext_count": 0,
            }

        total_events = len(events_window)
        event_rate = total_events / max(1.0, self.window_seconds)

        mod_count = sum(1 for e in events_window if e.get("event_type") == "MODIFY")
        rename_count = sum(1 for e in events_window if e.get("event_type") == "RENAME")
        
        mod_ratio = mod_count / total_events if total_events > 0 else 0.0
        rename_ratio = rename_count / total_events if total_events > 0 else 0.0

        # Unique file paths touched
        unique_paths = set(e.get("sandbox_path", "") for e in events_window)
        unique_files_targeted = len(unique_paths)

        # Count suspicious extensions
        suspicious_ext_count = 0
        for e in events_window:
            fname = e.get("filename", "").lower()
            if any(fname.endswith(ext) for ext in SUSPICIOUS_EXTENSIONS):
                suspicious_ext_count += 1

        # Entropy delta average
        entropy_deltas = [e.get("entropy_delta", 0.0) for e in events_window]
        avg_entropy_delta = sum(entropy_deltas) / len(entropy_deltas) if entropy_deltas else 0.0

        # Rapid burst counter: time delta < 100ms between adjacent events
        burst_count = 0
        sorted_events = sorted(events_window, key=lambda x: x.get("timestamp", ""))
        for i in range(1, len(sorted_events)):
            try:
                t1 = datetime.fromisoformat(sorted_events[i-1]["timestamp"])
                t2 = datetime.fromisoformat(sorted_events[i]["timestamp"])
                delta_ms = (t2 - t1).total_seconds() * 1000.0
                if delta_ms < 100.0:
                    burst_count += 1
            except:
                pass

        return {
            "event_rate_per_sec": round(event_rate, 2),
            "modification_ratio": round(mod_ratio, 2),
            "rename_ratio": round(rename_ratio, 2),
            "extension_entropy": round(avg_entropy_delta, 2),
            "rapid_burst_count": burst_count,
            "unique_files_targeted": unique_files_targeted,
            "suspicious_ext_count": suspicious_ext_count,
        }
