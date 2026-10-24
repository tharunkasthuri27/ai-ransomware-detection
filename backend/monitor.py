"""
SENTINEL-X Watchdog File System Monitor
Attaches solely to the approved sandbox directory. Observes real-time CREATE,
MODIFY, and RENAME file system events without expanding beyond configured boundaries.
"""

import time
import os
from pathlib import Path
from typing import Callable, Optional
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent, FileMovedEvent
from security_validator import SandboxSecurityValidator
from feature_extractor import compute_shannon_entropy


class SandboxEventHandler(FileSystemEventHandler):
    def __init__(self, sandbox_dir: Path, on_event_callback: Callable):
        super().__init__()
        self.sandbox_dir = sandbox_dir
        self.on_event_callback = on_event_callback

    def _process_event(self, event_type: str, path: str, old_path: Optional[str] = None):
        # Ignore temporary editor or system files
        if "~" in path or ".tmp" in path or ".swp" in path:
            return

        try:
            rel_path = str(Path(path).relative_to(self.sandbox_dir))
        except ValueError:
            return

        filename = os.path.basename(path)
        file_size = 0
        entropy_delta = 0.05

        if os.path.exists(path) and os.path.isfile(path):
            try:
                file_size = os.path.getsize(path)
                with open(path, "rb") as f:
                    chunk = f.read(2048)
                    entropy_delta = compute_shannon_entropy(chunk)
            except Exception:
                pass

        event_payload = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "event_type": event_type,
            "sandbox_path": rel_path,
            "filename": filename,
            "old_path": str(Path(old_path).relative_to(self.sandbox_dir)) if old_path else None,
            "file_size_bytes": file_size,
            "entropy_delta": round(entropy_delta, 2),
        }

        self.on_event_callback(event_payload)

    def on_created(self, event: FileSystemEvent):
        if not event.is_directory:
            self._process_event("CREATE", event.src_path)

    def on_modified(self, event: FileSystemEvent):
        if not event.is_directory:
            self._process_event("MODIFY", event.src_path)

    def on_moved(self, event: FileMovedEvent):
        if not event.is_directory:
            self._process_event("RENAME", event.dest_path, old_path=event.src_path)


class SandboxWatcherService:
    def __init__(self, sandbox_dir: str = "./sandbox_data", on_event: Optional[Callable] = None):
        self.validator = SandboxSecurityValidator(sandbox_dir)
        self.sandbox_dir = self.validator.get_sandbox_path()
        self.on_event = on_event or (lambda ev: None)
        self.observer = None
        self.is_active = False

    def start(self):
        if self.is_active:
            return
        event_handler = SandboxEventHandler(self.sandbox_dir, self.on_event)
        self.observer = Observer()
        self.observer.schedule(event_handler, str(self.sandbox_dir), recursive=True)
        self.observer.start()
        self.is_active = True
        print(f"[Watcher] Actively monitoring approved sandbox: {self.sandbox_dir}")

    def stop(self):
        if self.observer and self.is_active:
            self.observer.stop()
            self.observer.join(timeout=2.0)
            self.is_active = False
            print("[Watcher] Stopped monitoring.")
