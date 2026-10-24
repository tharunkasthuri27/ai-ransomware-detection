"""
SENTINEL-X Safe Behavioural Simulator
Simulates benign vs ransomware-like file activity strictly inside an isolated sandbox directory.
SAFETY CONTROLS ENFORCED:
- Zero real encryption algorithms (AES/RSA) or irreversible deletion.
- Path traversal strictly blocked by SandboxSecurityValidator.
- Maximum operation limits and explicit stop mechanisms.
- Purely educational and research-oriented.
"""

import os
import time
import random
import threading
from pathlib import Path
from typing import Optional, Callable
from security_validator import SandboxSecurityValidator, SecurityValidationError


DUMMY_TEMPLATES = [
    ("annual_report_2026.docx", b"SENTINEL-X Dummy Annual Report content for sandbox analysis. Confidential 2026."),
    ("q3_financial_model.xlsx", b"Dummy Financial Spreadsheet Data: Q1, Q2, Q3 Revenues, Costs, Projections."),
    ("meeting_minutes_lab.txt", b"Staff Meeting Notes: Discussion on security telemetry, false positives, ML models."),
    ("vendor_agreement_v2.pdf", b"%PDF-1.4 Dummy Vendor Service Agreement generated for sandbox testing."),
    ("crypto_vault_backup.tar", b"Dummy tar archive file container with mock file headers."),
    ("customer_records_sample.csv", b"id,name,email,company\n1,Alice,alice@example.com,Acme\n2,Bob,bob@example.com,Initech"),
    ("system_architecture.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR Dummy image bytes for testing."),
    ("project_proposal_draft.docx", b"Project proposal for machine-learning powered behavioral endpoint detection."),
    ("database_dump_test.sql", b"CREATE TABLE users (id INT, user VARCHAR(50)); INSERT INTO users VALUES (1, 'demo');")
]


class SafeSandboxSimulator:
    def __init__(self, sandbox_dir: str = "./sandbox_data", on_event: Optional[Callable] = None):
        self.validator = SandboxSecurityValidator(sandbox_dir)
        self.sandbox_dir = self.validator.get_sandbox_path()
        self.on_event = on_event
        self.is_running = False
        self.stop_requested = False
        self.active_thread: Optional[threading.Thread] = None

        # Populate initial dummy files if empty
        self.reset_sandbox_files()

    def reset_sandbox_files(self):
        """Cleans and resets only dummy files inside the approved sandbox directory."""
        self.stop_simulation()
        
        # Clean current files safely
        for item in self.sandbox_dir.iterdir():
            if item.is_file() or item.is_symlink():
                item.unlink(missing_ok=True)
            elif item.is_dir():
                for subitem in item.iterdir():
                    subitem.unlink(missing_ok=True)
                item.rmdir()

        # Recreate structured subfolders
        (self.sandbox_dir / "documents").mkdir(parents=True, exist_ok=True)
        (self.sandbox_dir / "spreadsheets").mkdir(parents=True, exist_ok=True)
        (self.sandbox_dir / "notes").mkdir(parents=True, exist_ok=True)
        (self.sandbox_dir / "locked").mkdir(parents=True, exist_ok=True)

        # Write pristine safe dummy files
        for filename, content in DUMMY_TEMPLATES:
            category = "documents" if filename.endswith((".docx", ".pdf")) else "spreadsheets" if filename.endswith(".xlsx") else "notes"
            dest = self.validator.validate_target_path(f"{category}/{filename}")
            dest.write_bytes(content)

    def start_simulation(self, scenario: str, duration_sec: int = 10, max_operations: int = 50):
        if self.is_running:
            self.stop_simulation()

        self.is_running = True
        self.stop_requested = False

        self.active_thread = threading.Thread(
            target=self._run_scenario_worker,
            args=(scenario, duration_sec, max_operations),
            daemon=True
        )
        self.active_thread.start()

    def stop_simulation(self):
        self.stop_requested = True
        if self.active_thread and self.active_thread.is_alive():
            self.active_thread.join(timeout=2.0)
        self.is_running = False

    def _run_scenario_worker(self, scenario: str, duration_sec: int, max_operations: int):
        start_time = time.time()
        ops_count = 0

        try:
            while not self.stop_requested and (time.time() - start_time) < duration_sec and ops_count < max_operations:
                if scenario == "NORMAL_OFFICE":
                    self._step_normal_office()
                    time.sleep(random.uniform(0.8, 1.4))
                elif scenario == "RAPID_ENCRYPTION_SIM":
                    self._step_rapid_modification()
                    time.sleep(random.uniform(0.04, 0.08))  # High-frequency burst
                elif scenario == "RENAME_BURST_SIM":
                    self._step_rename_burst()
                    time.sleep(random.uniform(0.05, 0.12))  # Rapid renaming
                else:
                    break

                ops_count += 1
        finally:
            self.is_running = False

    def _step_normal_office(self):
        """Simulate realistic human document editing."""
        files = [p for p in self.sandbox_dir.rglob("*.*") if p.is_file() and not str(p).endswith(".locked")]
        if not files:
            self.reset_sandbox_files()
            return
        
        target = random.choice(files)
        validated_target = self.validator.validate_target_path(str(target))

        # Append harmless low-entropy log line
        with open(validated_target, "a", encoding="utf-8", errors="ignore") as f:
            f.write(f"\n[Routine Edit] User saved update at {time.strftime('%Y-%m-%d %H:%M:%S')}")

    def _step_rapid_modification(self):
        """Simulate rapid overwrite with high-entropy bytes (Safe mock data)."""
        files = [p for p in self.sandbox_dir.rglob("*.*") if p.is_file() and not str(p).endswith(".locked")]
        if not files:
            self.reset_sandbox_files()
            return

        target = random.choice(files)
        validated_target = self.validator.validate_target_path(str(target))

        # Generate harmless random byte buffer to simulate high Shannon entropy
        mock_high_entropy_bytes = os.urandom(1024)
        with open(validated_target, "wb") as f:
            f.write(mock_high_entropy_bytes)

    def _step_rename_burst(self):
        """Simulate ransomware appending extension like .locked to files."""
        files = [p for p in self.sandbox_dir.rglob("*.*") if p.is_file() and not any(str(p).endswith(x) for x in [".locked", ".crypto", ".enc"])]
        if not files:
            self.reset_sandbox_files()
            return

        target = random.choice(files)
        validated_target = self.validator.validate_target_path(str(target))

        ext_choice = random.choice([".locked", ".crypto", ".enc"])
        new_name = validated_target.name + ext_choice
        new_path = self.sandbox_dir / "locked" / new_name
        validated_new_path = self.validator.validate_target_path(str(new_path))

        validated_target.rename(validated_new_path)
