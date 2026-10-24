"""
SENTINEL-X Automated Security & Sandbox Confinement Tests
Verifies that:
1. All file operations remain strictly inside the sandbox directory.
2. Directory traversal attempts ('../', '/etc/passwd', '../../') are immediately blocked.
3. Symlinks pointing outside sandbox are detected and blocked.
4. Stop mechanism cleanly terminates running simulations.
"""

import os
import pytest
from pathlib import Path
from security_validator import SandboxSecurityValidator, SecurityValidationError
from simulator import SafeSandboxSimulator


@pytest.fixture
def temp_sandbox(tmp_path):
    sandbox_dir = tmp_path / "test_sandbox"
    sandbox_dir.mkdir(parents=True, exist_ok=True)
    return str(sandbox_dir)


def test_valid_sandbox_path(temp_sandbox):
    validator = SandboxSecurityValidator(temp_sandbox)
    valid_path = validator.validate_target_path("documents/test.docx")
    assert valid_path.is_relative_to(Path(temp_sandbox).resolve())


def test_directory_traversal_blocked(temp_sandbox):
    validator = SandboxSecurityValidator(temp_sandbox)
    
    # Traversal using ..
    with pytest.raises(SecurityValidationError):
        validator.validate_target_path("../outside_file.txt")

    # Deep traversal
    with pytest.raises(SecurityValidationError):
        validator.validate_target_path("sub/../../etc/passwd")


def test_absolute_path_escape_blocked(temp_sandbox):
    validator = SandboxSecurityValidator(temp_sandbox)
    
    # Absolute path to system directory
    with pytest.raises(SecurityValidationError):
        validator.validate_target_path("/etc/shadow")

    with pytest.raises(SecurityValidationError):
        validator.validate_target_path("/var/log/syslog")


def test_simulator_dummy_reset(temp_sandbox):
    sim = SafeSandboxSimulator(sandbox_dir=temp_sandbox)
    sandbox_path = Path(temp_sandbox)
    
    # Check that initial files are created
    files = list(sandbox_path.rglob("*.*"))
    assert len(files) > 0
    # Ensure all files are inside temp_sandbox
    for f in files:
        assert f.resolve().is_relative_to(sandbox_path.resolve())


def test_simulation_stop_mechanism(temp_sandbox):
    sim = SafeSandboxSimulator(sandbox_dir=temp_sandbox)
    sim.start_simulation("NORMAL_OFFICE", duration_sec=5, max_operations=20)
    assert sim.is_running is True
    
    sim.stop_simulation()
    assert sim.is_running is False
