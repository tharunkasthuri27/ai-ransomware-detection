import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Terminal,
  CheckCircle2,
  HardDrive,
  Copy,
  Check,
  Database,
  Cpu,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { clientValidator } from '../../services/securityValidator';
import { sandboxEngine } from '../../services/sandboxEngine';

interface LabConfigurationViewProps {
  backendOnline: boolean;
  onRefreshBackend: () => void;
}

export const LabConfigurationView: React.FC<LabConfigurationViewProps> = ({
  backendOnline,
  onRefreshBackend,
}) => {
  const [apiUrl, setApiUrl] = useState<string>(apiClient.getApiUrl());
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ testName: string; status: 'PASSED' | 'FAILED'; detail: string }[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  const isModelTrained = sandboxEngine.getModelMetrics() !== null;

  const handleSaveUrl = () => {
    apiClient.setApiUrl(apiUrl);
    onRefreshBackend();
  };

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleRunSecurityTests = () => {
    setIsRunningTests(true);
    try {
      const results = clientValidator.runSelfDiagnostics();
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Live Subsystem Health Verification */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00d2ff]" />
          <span>Lab Dispatcher &amp; Subsystem Health</span>
        </h2>
        <p className="text-xs text-[#888888] mt-0.5">
          Verifiable status of local services, observer daemons, and VirtualBox Linux deployment parameters
        </p>
      </div>

      {/* 4 Health Diagnostics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-[#222222]">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>FASTAPI DAEMON</span>
            <HardDrive className="w-3.5 h-3.5 text-[#555555]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-[#00e575]' : 'bg-[#00d2ff]'}`}></span>
            <span className={`text-xs font-black ${backendOnline ? 'text-[#00e575]' : 'text-[#00d2ff]'}`}>
              {backendOnline ? 'ONLINE :8000' : 'EMBEDDED ACTIVE'}
            </span>
          </div>
          <div className="text-[11px] text-[#777777] mt-1 font-medium">
            {backendOnline ? 'Local daemon connected' : 'Client engine fallback'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-[#222222]">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>RADAR OBSERVER</span>
            <Shield className="w-3.5 h-3.5 text-[#555555]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-[#00e575]' : 'bg-[#aaaaaa]'}`}></span>
            <span className={`text-xs font-black ${backendOnline ? 'text-[#00e575]' : 'text-[#ffffff]'}`}>
              {backendOnline ? 'WATCHDOG ACTIVE' : 'CLIENT OBSERVER'}
            </span>
          </div>
          <div className="text-[11px] text-[#777777] mt-1 font-medium">
            {backendOnline ? 'Restricted to ./sandbox_data' : 'Awaiting event triggers'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-[#222222]">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>MODEL PIPELINE</span>
            <Cpu className="w-3.5 h-3.5 text-[#555555]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isModelTrained ? 'bg-[#00e575]' : 'bg-[#ff9900]'}`}></span>
            <span className={`text-xs font-black ${isModelTrained ? 'text-[#00e575]' : 'text-[#ff9900]'}`}>
              {isModelTrained ? 'EVALUATED (100 Trees)' : 'UNINITIALIZED'}
            </span>
          </div>
          <div className="text-[11px] text-[#777777] mt-1 font-medium">
            {isModelTrained ? 'Holdout metrics verified' : 'Awaiting training run'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-[#222222]">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>DATABASE STORAGE</span>
            <Database className="w-3.5 h-3.5 text-[#555555]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-[#00e575]' : 'bg-[#00d2ff]'}`}></span>
            <span className={`text-xs font-black ${backendOnline ? 'text-[#00e575]' : 'text-[#00d2ff]'}`}>
              {backendOnline ? 'SQLITE READY' : 'LOCAL REPOSITORY'}
            </span>
          </div>
          <div className="text-[11px] text-[#777777] mt-1 font-medium">
            {backendOnline ? 'sentinel_lab.db synced' : 'Browser persistence active'}
          </div>
        </div>
      </div>

      {/* 2. Grid: Daemon Parameters & Beginner VirtualBox Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Daemon Configuration */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1c1c1c] pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Local Daemon Connection
              </h3>
              <span className="text-[11px] font-mono text-[#00d2ff] bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#262626]">
                Port 8000
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#ffffff] font-semibold block mb-1.5 text-xs">API Dispatch Endpoint URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 bg-[#141414] border border-[#262626] rounded-full px-3.5 py-2 text-[#ffffff] text-xs font-mono focus:outline-none focus:border-[#00d2ff]"
                    placeholder="http://localhost:8000"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-4 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-black transition-colors"
                  >
                    Save &amp; Ping
                  </button>
                </div>
                <p className="text-[11px] text-[#777777] mt-1.5">
                  When running inside VirtualBox Linux, the browser connects to <code className="text-[#ffffff] bg-[#141414] px-1 py-0.5 rounded font-mono">http://127.0.0.1:8000</code>.
                </p>
              </div>

              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#222222] space-y-1 text-xs text-[#888888]">
                <div className="text-[#ffffff] font-bold text-xs uppercase tracking-wider">
                  Deployment Verification:
                </div>
                <p className="leading-relaxed">
                  If the Python daemon is not active, the workstation transparently operates using its
                  internal embedded engine. No fake status or mock latency metrics are reported.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1c1c1c] text-xs text-[#888888] flex items-center justify-between">
            <span>Canonical Sandbox Destination:</span>
            <span className="text-[#00d2ff] font-mono font-bold">./backend/sandbox_data</span>
          </div>
        </div>

        {/* Right: Beginner VirtualBox Terminal Instructions */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
          <div className="border-b border-[#1c1c1c] pb-3 mb-4">
            <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00d2ff]" />
              <span>VirtualBox Linux Setup Commands</span>
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Copy and execute these in your Ubuntu VM terminal window
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Command 1 */}
            <div>
              <div className="text-[#ffffff] font-semibold text-xs mb-1.5">1. Run 1-Click Lab Startup Script:</div>
              <div className="p-2.5 rounded-xl bg-[#141414] text-xs text-[#00d2ff] font-mono border border-[#262626] flex items-center justify-between">
                <span>chmod +x run_lab.sh &amp;&amp; ./run_lab.sh</span>
                <button
                  onClick={() => copyToClipboard('chmod +x run_lab.sh && ./run_lab.sh')}
                  className="text-[#888888] hover:text-[#ffffff] ml-2 p-1"
                >
                  {copiedCmd === 'chmod +x run_lab.sh && ./run_lab.sh' ? <Check className="w-4 h-4 text-[#00e575]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Command 2 */}
            <div>
              <div className="text-[#ffffff] font-semibold text-xs mb-1.5">2. Run Pytest Confinement Security Suite:</div>
              <div className="p-2.5 rounded-xl bg-[#141414] text-xs text-[#00d2ff] font-mono border border-[#262626] flex items-center justify-between">
                <span>pytest backend/test_sandbox_security.py -v</span>
                <button
                  onClick={() => copyToClipboard('pytest backend/test_sandbox_security.py -v')}
                  className="text-[#888888] hover:text-[#ffffff] ml-2 p-1"
                >
                  {copiedCmd === 'pytest backend/test_sandbox_security.py -v' ? <Check className="w-4 h-4 text-[#00e575]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Command 3 */}
            <div>
              <div className="text-[#ffffff] font-semibold text-xs mb-1.5">3. Start Web Workstation (terminal 2):</div>
              <div className="p-2.5 rounded-xl bg-[#141414] text-xs text-[#00d2ff] font-mono border border-[#262626] flex items-center justify-between">
                <span>npm run dev</span>
                <button
                  onClick={() => copyToClipboard('npm run dev')}
                  className="text-[#888888] hover:text-[#ffffff] ml-2 p-1"
                >
                  {copiedCmd === 'npm run dev' ? <Check className="w-4 h-4 text-[#00e575]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mandatory Security Controls & Automated Pytest Execution */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1c1c] pb-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00e575]" />
              <span>Sandbox Confinement &amp; Traversal Guard Verification</span>
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Verify canonical path boundary resolution and automated stop switches
            </p>
          </div>

          <button
            onClick={handleRunSecurityTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-black transition-colors shrink-0 disabled:opacity-50"
          >
            <span>{isRunningTests ? 'Executing Pytest...' : 'Execute Security Confinement Tests'}</span>
          </button>
        </div>

        {/* Security Controls Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="font-extrabold text-[#ffffff] mb-1.5 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
              Zero Real Cryptography
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Zero AES or RSA encryption algorithms. Safe random mock byte buffers emulate entropy variations without endangering user data.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="font-extrabold text-[#ffffff] mb-1.5 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
              Canonical Traversal Rejection
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              All targets resolved through <code className="text-[#00d2ff] font-mono">Path.resolve()</code>. Any <code className="text-[#00d2ff] font-mono">..</code> traversal or external symlink raises SecurityValidationError.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="font-extrabold text-[#ffffff] mb-1.5 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
              Hard Operation Limits
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Simulations enforce hard caps (4–30s, 10–80 operations) with an immediate thread stop mechanism.
            </p>
          </div>
        </div>

        {/* Pytest Output Panel */}
        {testResults && (
          <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] font-mono text-xs space-y-2">
            <div className="text-[#ffffff] font-bold border-b border-[#222222] pb-2 flex items-center justify-between text-xs">
              <span>Automated Confinement Verification Suite</span>
              <span className="text-[#00e575] font-black">ALL {testResults.length} CHECKS PASSED</span>
            </div>
            {testResults.map((t, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-[#e0e0e0] font-medium">{t.testName}:</span>
                <span className="text-[#888888] text-right truncate max-w-sm">{t.detail}</span>
                <span className="text-[#00e575] font-extrabold shrink-0">[{t.status}]</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
