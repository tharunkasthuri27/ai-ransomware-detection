#!/usr/bin/env bash
# ==============================================================================
# SENTINEL-X AI Ransomware Behaviour Analysis & Detection Lab
# 1-Click Startup Script for Linux / VirtualBox Environments
# ==============================================================================

set -e

echo "=========================================================="
echo "          SENTINEL-X CYBERSECURITY LAB STARTUP            "
echo "  Behavioural Analysis & Intelligent Threat Detection Lab "
echo "=========================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_DIR}/backend"
VENV_DIR="${BACKEND_DIR}/.venv"

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "[!] Error: python3 is not installed. Please run: sudo apt update && sudo apt install -y python3 python3-venv python3-pip"
    exit 1
fi

echo "[*] Step 1: Checking Python virtual environment..."
if [ ! -d "${VENV_DIR}" ]; then
    echo "[*] Creating new virtual environment at ${VENV_DIR}..."
    python3 -m venv "${VENV_DIR}"
fi

echo "[*] Step 2: Activating virtual environment..."
source "${VENV_DIR}/bin/activate"

echo "[*] Step 3: Upgrading pip and installing requirements..."
pip install --upgrade pip -q
pip install -r "${BACKEND_DIR}/requirements.txt" -q

echo "[*] Step 4: Running automated sandbox security tests..."
python3 -m pytest "${BACKEND_DIR}/test_sandbox_security.py" -q

echo "[*] Step 5: Initializing AI Behavioral Model and Database..."
cd "${BACKEND_DIR}"
if [ ! -f "ransomware_detector.joblib" ]; then
    echo "[*] Generating synthetic traces and training baseline model..."
    python3 train_eval.py
fi

echo "[*] Step 6: Starting SENTINEL-X Daemon on http://127.0.0.1:8000..."
echo "[*] Safe sandbox folder: ${BACKEND_DIR}/sandbox_data"
echo "----------------------------------------------------------"
echo " Daemon is running. Keep this terminal window open."
echo " In a second terminal, start the UI: npm run dev"
echo " Or open the SENTINEL-X interface in your browser."
echo " Press Ctrl+C to safely shut down."
echo "----------------------------------------------------------"

uvicorn app:app --host 127.0.0.1 --port 8000 --reload
