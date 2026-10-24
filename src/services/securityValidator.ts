/**
 * SENTINEL-X Client & Sandbox Path Security Validator
 * Enforces strict sandbox confinement, blocks traversal attempts,
 * and canonicalizes paths to prevent escapes.
 */

export class SecurityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityValidationError';
  }
}

export class ClientSandboxValidator {
  private sandboxRoot: string;

  constructor(sandboxRoot: string = 'sandbox_data') {
    this.sandboxRoot = sandboxRoot.replace(/\/+$/, '');
  }

  public validatePath(targetPath: string): { valid: boolean; normalizedPath: string } {
    if (!targetPath || targetPath.trim() === '') {
      throw new SecurityValidationError('Path cannot be empty.');
    }

    const trimmed = targetPath.trim();

    // Block path traversal indicators
    if (trimmed.includes('..') || trimmed.includes('../') || trimmed.includes('..\\')) {
      throw new SecurityValidationError("Directory traversal attempt ('..') detected and blocked.");
    }

    // Block absolute root escapes
    if (trimmed.startsWith('/') || trimmed.startsWith('C:\\') || trimmed.startsWith('\\')) {
      throw new SecurityValidationError(`Security Violation: Absolute path '${trimmed}' escapes approved sandbox.`);
    }

    // Normalize path
    const normalized = trimmed.startsWith(this.sandboxRoot)
      ? trimmed
      : `${this.sandboxRoot}/${trimmed.replace(/^\/+/, '')}`;

    return { valid: true, normalizedPath: normalized };
  }

  public runSelfDiagnostics(): { testName: string; status: 'PASSED' | 'FAILED'; detail: string }[] {
    const results: { testName: string; status: 'PASSED' | 'FAILED'; detail: string }[] = [];

    // Test 1: Valid path inside sandbox
    try {
      this.validatePath('documents/annual_report.docx');
      results.push({
        testName: 'test_valid_sandbox_path',
        status: 'PASSED',
        detail: 'Confinement inside sandbox boundary verified.'
      });
    } catch (e: any) {
      results.push({ testName: 'test_valid_sandbox_path', status: 'FAILED', detail: e.message });
    }

    // Test 2: Traversal escape blocked
    try {
      this.validatePath('../outside.txt');
      results.push({ testName: 'test_directory_traversal_blocked', status: 'FAILED', detail: 'Traversal was not blocked.' });
    } catch (e: any) {
      if (e instanceof SecurityValidationError) {
        results.push({ testName: 'test_directory_traversal_blocked', status: 'PASSED', detail: 'Traversal (../outside.txt) successfully rejected.' });
      } else {
        results.push({ testName: 'test_directory_traversal_blocked', status: 'FAILED', detail: e.message });
      }
    }

    // Test 3: Root escape blocked
    try {
      this.validatePath('/etc/shadow');
      results.push({ testName: 'test_absolute_path_escape_blocked', status: 'FAILED', detail: 'Absolute path escape was not blocked.' });
    } catch (e: any) {
      if (e instanceof SecurityValidationError) {
        results.push({ testName: 'test_absolute_path_escape_blocked', status: 'PASSED', detail: 'Absolute root escape (/etc/shadow) successfully blocked.' });
      } else {
        results.push({ testName: 'test_absolute_path_escape_blocked', status: 'FAILED', detail: e.message });
      }
    }

    // Test 4: Nested traversal blocked
    try {
      this.validatePath('notes/../../etc/passwd');
      results.push({ testName: 'test_nested_traversal_blocked', status: 'FAILED', detail: 'Nested traversal was not blocked.' });
    } catch (e: any) {
      if (e instanceof SecurityValidationError) {
        results.push({ testName: 'test_nested_traversal_blocked', status: 'PASSED', detail: 'Nested traversal (notes/../../) successfully blocked.' });
      } else {
        results.push({ testName: 'test_nested_traversal_blocked', status: 'FAILED', detail: e.message });
      }
    }

    return results;
  }
}

export const clientValidator = new ClientSandboxValidator();
