/**
 * SENTINEL-X Local Python Backend Client
 * Connects to the local FastAPI backend running at http://localhost:8000 in Linux / VirtualBox.
 * Gracefully reports offline status when running in standalone browser mode.
 */

export interface BackendStatus {
  online: boolean;
  version?: string;
  sandbox_dir?: string;
  watcher_status?: string;
  database_status?: string;
  model_loaded?: boolean;
  error?: string;
}

const DEFAULT_API_URL = 'http://localhost:8000';

export class ApiClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = localStorage.getItem('sentinel_api_url') || DEFAULT_API_URL;
  }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  public setApiUrl(url: string) {
    this.apiUrl = url;
    localStorage.setItem('sentinel_api_url', url);
  }

  public async checkHealth(): Promise<BackendStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.apiUrl}/api/status`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          online: true,
          version: data.version || '1.0.0-lab',
          sandbox_dir: data.sandbox_dir || './sandbox_data',
          watcher_status: data.watcher_status || 'MONITORING ACTIVE',
          database_status: data.database_status || 'SQLITE CONNECTED',
          model_loaded: data.model_loaded ?? true
        };
      }
      return { online: false, error: `HTTP ${res.status}` };
    } catch {
      return {
        online: false,
        error: 'Backend daemon not detected on port 8000. Operating in Embedded Lab Engine mode.'
      };
    }
  }

  public async sendCommand(endpoint: string, method: string = 'POST', body?: unknown): Promise<any> {
    try {
      const res = await fetch(`${this.apiUrl}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      throw new Error(err.message || 'Network error');
    }
  }
}

export const apiClient = new ApiClient();
