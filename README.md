# SENTINEL-X
## AI Ransomware Behaviour Analysis & Detection Lab
*Cybersecurity Education, Behavioural Analysis and Intelligent Threat Detection*

A college minor project designed for local execution in a controlled VirtualBox Linux environment. SENTINEL-X safely simulates harmless ransomware-like filesystem behaviors, observes real-time file activity, extracts sliding-window behavioral features, trains and runs Scikit-learn machine learning inference, calculates composite risk scores, and generates actionable security alerts.

---

### ⚠️ Critical Educational & Safety Declaration
- **SIMULATED BEHAVIOR ONLY**: This application contains **zero malware**, zero encryption routines, and zero destructive capabilities.
- **Strict Sandbox Confinement**: All simulation operations are restricted to `./backend/sandbox_data/` and only operate on dummy project-generated files.
- **Mandatory Path Validation**: The system validates canonical paths, rejects `../` traversal, rejects symlinks, and implements hard operation limits and stop switches.

---

### 1. Project Architecture Overview

```
SENTINEL-X System Architecture
┌────────────────────────────────────────────────────────┐
│               REACT + TAILWIND FRONTEND                │
│  - Security Command Centre (Overview)                 │
│  - Behaviour Lab (Simulations & Live Terminal)         │
│  - Live Monitoring (Sliding Window Rates & Telemetry)  │
│  - Detection Engine (Feature Weights & XAI Heuristics) │
│  - Investigation Timeline (Forensic Event Explorer)    │
│  - Model Evaluation (Confusion Matrix & ML Metrics)    │
│  - Event Archive (Persistent SQLite Records Explorer)  │
│  - Lab Configuration & Setup Guide                     │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API / WebSocket (or Embedded Fallback)
┌──────────────────────────▼─────────────────────────────┐
│             PYTHON FASTAPI LOCAL BACKEND               │
│  - app.py: REST endpoints for events, alerts, training │
│  - monitor.py: Watchdog observer for ./sandbox_data    │
│  - simulator.py: Safe dummy file behavioral simulator  │
│  - feature_extractor.py: Sliding 3-second window math  │
│  - detector.py: Random Forest & Rule-based Risk Scorer │
│  - dataset_generator.py: Synthetic trace generator     │
│  - train_eval.py: 80/20 split trainer & metrics        │
│  - security_validator.py: Path containment enforcer    │
│  - database.py: SQLite storage (sentinel_lab.db)       │
└────────────────────────────────────────────────────────┘
```

---

### 2. File Manifest & Detailed Purposes

| File Path | Purpose & Description (Beginner Explanation) |
|---|---|
| `backend/app.py` | FastAPI web server providing API endpoints (`/api/status`, `/api/events`, `/api/simulate/start`, `/api/model/train`, etc.). |
| `backend/simulator.py` | Generates safe filesystem events (Normal Office, Rapid Overwrite, Rename Burst) using dummy files only. |
| `backend/monitor.py` | Uses Python `watchdog` to monitor the sandbox directory and capture real-time file creation, modification, and rename events. |
| `backend/feature_extractor.py` | Aggregates event streams into 3-second sliding windows, computing metrics like operation rate, entropy delta, and rename ratio. |
| `backend/detector.py` | Runs Scikit-learn Random Forest model inference and combines results with transparent heuristic rules into a 0-100 Risk Score. |
| `backend/dataset_generator.py` | Creates reproducible synthetic normal and ransomware-like behavioral traces (5,000 samples). |
| `backend/train_eval.py` | Trains the model on an 80/20 train/test split, generates a confusion matrix, computes F1-score, and exports `ransomware_detector.joblib`. |
| `backend/security_validator.py` | Ensures all file operations strictly stay within `./sandbox_data/`, blocking directory traversal (`..`) and symlink escapes. |
| `backend/test_sandbox_security.py` | Automated unit tests (pytest) verifying path confinement and simulation safety controls. |
| `backend/database.py` | SQLite helper creating tables for audit events, feature vectors, alerts, and simulation sessions. |
| `backend/requirements.txt` | Python packages required for the project (FastAPI, watchdog, scikit-learn, pandas, numpy, joblib). |
| `run_lab.sh` | 1-click startup bash script for Linux / VirtualBox that sets up the virtualenv, runs security tests, and launches the server. |
| `src/App.tsx` | Main React application state manager and view router. |
| `src/services/sandboxEngine.ts` | In-browser embedded simulation and detection engine enabling 100% immediate interaction even before launching Python daemon. |
| `src/services/apiClient.ts` | Handles communication between the frontend and the local Python FastAPI daemon on `http://localhost:8000`. |

---

### 3. Step-by-Step VirtualBox Linux Setup Guide

If you are a beginner running this inside a VirtualBox Linux VM (such as Ubuntu 22.04 or 24.04 LTS):

#### Step 1: Open Terminal in your VM
Press `Ctrl + Alt + T` to open a terminal inside your Ubuntu VM.

#### Step 2: Install Python & Node.js prerequisites
```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git curl
# Install Node.js (v20 or v22 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 3: Run the Python Backend
In the project root, make the startup script executable and run it:
```bash
chmod +x run_lab.sh
./run_lab.sh
```
This will automatically:
1. Create a Python virtual environment (`backend/.venv`)
2. Install all required Python packages
3. Run automated sandbox security verification tests
4. Generate the synthetic dataset and train the Random Forest model
5. Start the backend daemon on `http://127.0.0.1:8000`

#### Step 4: Run the Web Interface
Open a second terminal window, navigate to the project directory, and run:
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

### 4. Behavioral Feature Vectors Explained

| Feature Name | Definition | Benign Baseline | Ransomware Signature |
|---|---|---|---|
| `event_rate_per_sec` | Operations per second in 3s window | 0.5 – 3.0 ops/sec | 15.0 – 40.0+ ops/sec |
| `modification_ratio` | Proportion of events modifying files | 0.1 – 0.4 | 0.7 – 0.95 |
| `rename_ratio` | Proportion of events renaming files | 0.0 – 0.1 | 0.4 – 0.85 |
| `extension_entropy` | Content Shannon entropy increase | < 0.20 delta | > 0.65 delta (ciphertext) |
| `rapid_burst_count` | Events occurring with < 100ms delta | 0 – 1 | 5 – 25 bursts |
| `suspicious_ext_count` | Files with `.locked`, `.crypto`, `.enc` | 0 | 1 – 10+ files |

---

### 5. Risk Scoring & Alert Thresholds

- **NORMAL (0 – 29)**: Standard human editing velocity. Zero malicious signatures.
- **WATCH (30 – 59)**: Minor burst or elevated activity; no payload encryption signatures.
- **SUSPICIOUS (60 – 84)**: High operation rate or anomalous entropy detected. Alert generated.
- **CRITICAL (85 – 100)**: Rapid mass modification or mass extension renaming detected. High-severity incident alert generated with full forensic telemetry.
