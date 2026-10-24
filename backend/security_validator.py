"""
SENTINEL-X Mandatory Security Controls & Path Validator
Ensures that all file operations are strictly confined within the approved
sandbox directory. Rejects directory traversal attempts, symbolic links,
and paths outside the canonical sandbox boundary.
"""

import os
from pathlib import Path


class SecurityValidationError(Exception):
    """Raised when an operation attempts to breach sandbox boundaries."""
    pass


class SandboxSecurityValidator:
    def __init__(self, sandbox_dir: str):
        # Resolve canonical absolute path for sandbox
        self.sandbox_dir = Path(sandbox_dir).resolve()
        self.max_file_size_bytes = 10 * 1024 * 1024  # 10MB maximum dummy file
        self.max_operation_rate = 100  # Max 100 ops/sec hard cap for safety

        # Ensure sandbox directory exists
        self.sandbox_dir.mkdir(parents=True, exist_ok=True)

    def validate_target_path(self, relative_or_absolute_path: str) -> Path:
        """
        Validates that target file path resides strictly inside the sandbox directory.
        Rejects directory traversal (e.g. '../'), absolute paths outside sandbox,
        and symbolic links that resolve outside.
        """
        if not relative_or_absolute_path:
            raise SecurityValidationError("Path cannot be empty.")

        # Disallow explicit traversal indicators
        if ".." in str(relative_or_absolute_path):
            raise SecurityValidationError("Directory traversal attempt ('..') detected and blocked.")

        # If relative, anchor to sandbox_dir
        path_obj = Path(relative_or_absolute_path)
        if not path_obj.is_absolute():
            resolved = (self.sandbox_dir / path_obj).resolve()
        else:
            resolved = path_obj.resolve()

        # Check if canonical path is within sandbox_dir
        try:
            resolved.relative_to(self.sandbox_dir)
        except ValueError:
            raise SecurityValidationError(
                f"Security Violation: Target path '{resolved}' escapes approved sandbox '{self.sandbox_dir}'."
            )

        # Check for symbolic links
        if resolved.is_symlink():
            real_target = resolved.resolve()
            try:
                real_target.relative_to(self.sandbox_dir)
            except ValueError:
                raise SecurityValidationError(
                    f"Security Violation: Symlink points to unapproved destination '{real_target}'."
                )

        return resolved

    def get_sandbox_path(self) -> Path:
        return self.sandbox_dir
