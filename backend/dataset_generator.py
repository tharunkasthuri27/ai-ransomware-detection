"""
SENTINEL-X Reproducible Synthetic Behavioral Dataset Generator
Generates realistic normal vs ransomware-like behavioral trace data for machine learning training and evaluation.
Features generated per sliding-window sample:
1. event_rate_per_sec (float)
2. modification_ratio (float, 0-1)
3. rename_ratio (float, 0-1)
4. extension_entropy (float, 0-1)
5. rapid_burst_count (int)
6. suspicious_ext_count (int)
Target label: 0 for NORMAL, 1 for RANSOMWARE_LIKE.
"""

import numpy as np
import pandas as pd
from typing import Tuple


def generate_synthetic_behavioral_dataset(
    n_samples: int = 5000,
    random_seed: int = 42
) -> pd.DataFrame:
    """
    Generates synthetic traces reflecting real-world behavioral ransomware studies.
    Distribution: ~60% Benign Office / Developer workloads, ~40% Ransomware-like bursts.
    """
    np.random.seed(random_seed)
    n_benign = int(n_samples * 0.60)
    n_malicious = n_samples - n_benign

    # --- BENIGN CLASS (Label = 0) ---
    # Normal user edits, spreadsheet saves, occasional git commit bursts
    benign_rate = np.random.gamma(shape=1.5, scale=1.2, size=n_benign)  # Mostly 0.5 - 4.0 ops/sec
    benign_mod_ratio = np.random.beta(a=2, b=5, size=n_benign)           # Mostly 0.1 - 0.4
    benign_rename_ratio = np.random.beta(a=1, b=20, size=n_benign)       # Rare renames (0 - 0.1)
    benign_entropy = np.random.beta(a=1.5, b=8, size=n_benign)           # Low entropy delta (0.02 - 0.25)
    benign_bursts = np.random.poisson(lam=0.4, size=n_benign)            # Rarely any sub-100ms burst
    benign_suspicious_ext = np.zeros(n_benign, dtype=int)                # Zero ransomware extensions

    # Occasional benign compile/tar burst (false positive simulation)
    compiler_burst_idx = np.random.choice(n_benign, size=int(n_benign * 0.05), replace=False)
    benign_rate[compiler_burst_idx] = np.random.uniform(8.0, 14.0, size=len(compiler_burst_idx))
    benign_bursts[compiler_burst_idx] = np.random.poisson(lam=3.0, size=len(compiler_burst_idx))

    benign_df = pd.DataFrame({
        "event_rate_per_sec": np.clip(benign_rate, 0.1, 25.0),
        "modification_ratio": np.clip(benign_mod_ratio, 0.0, 1.0),
        "rename_ratio": np.clip(benign_rename_ratio, 0.0, 1.0),
        "extension_entropy": np.clip(benign_entropy, 0.0, 1.0),
        "rapid_burst_count": np.clip(benign_bursts, 0, 30),
        "suspicious_ext_count": benign_suspicious_ext,
        "label": 0
    })

    # --- MALICIOUS / RANSOMWARE-LIKE CLASS (Label = 1) ---
    # High-speed modification, encrypted payload writes, mass extension renames
    mal_rate = np.random.normal(loc=22.0, scale=6.0, size=n_malicious)   # High velocity (15 - 35 ops/sec)
    mal_mod_ratio = np.random.beta(a=6, b=2, size=n_malicious)           # High modification ratio (0.6 - 0.95)
    mal_rename_ratio = np.random.beta(a=4, b=3, size=n_malicious)        # Frequent renaming (0.3 - 0.8)
    mal_entropy = np.random.normal(loc=0.74, scale=0.10, size=n_malicious) # High Shannon entropy delta
    mal_bursts = np.random.poisson(lam=9.0, size=n_malicious)            # Automated high burst count
    mal_suspicious_ext = np.random.randint(1, 8, size=n_malicious)       # Append lock extensions

    mal_df = pd.DataFrame({
        "event_rate_per_sec": np.clip(mal_rate, 5.0, 50.0),
        "modification_ratio": np.clip(mal_mod_ratio, 0.1, 1.0),
        "rename_ratio": np.clip(mal_rename_ratio, 0.0, 1.0),
        "extension_entropy": np.clip(mal_entropy, 0.40, 1.0),
        "rapid_burst_count": np.clip(mal_bursts, 2, 40),
        "suspicious_ext_count": mal_suspicious_ext,
        "label": 1
    })

    # Combine and shuffle
    df = pd.concat([benign_df, mal_df], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    return df


if __name__ == "__main__":
    df = generate_synthetic_behavioral_dataset(1000)
    print("Generated synthetic dataset sample:")
    print(df.head())
    print("\nClass distribution:\n", df["label"].value_counts())
