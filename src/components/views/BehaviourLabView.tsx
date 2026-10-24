import React, { useState } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Shield,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  FolderLock,
  Terminal,
  Activity,
  CheckCircle2
} from 'lucide-react';
import {
  ScenarioType,
  AuditEvent,
  SandboxFile
} from '../../types/sentinel';

interface BehaviourLabViewProps {
  isRunning: boolean;
  activeScenario: ScenarioType | null;
  events: AuditEvent[];
  sandboxFiles: SandboxFile[];
  onStartSimulation: (scenario: ScenarioType, duration: number, limit: number) => void;
  onStopSimulation: () => void;
  onResetSandbox: () => void;
}

export const BehaviourLabView: React.FC<BehaviourLabViewProps> = ({
  isRunning,
  activeScenario,
  events,
  sandboxFiles,
  onStartSimulation,
  onStopSimulation,
  onResetSandbox,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('RAPID_ENCRYPTION_SIM');
  const [duration, setDuration] = useState<number>(12);
  const [opLimit, setOpLimit] = useState<number>(35);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const scenarioMeta: Record<ScenarioType, {
    label: string;
    code: string;
    description: string;
    technicalSignature: string;
    expectedCadence: string;
    expectedEntropy: string;
    targetExtensions: string[];
    riskTier: string;
    badgeStyle: string;
  }> = {
    'NORMAL_OFFICE': {
      label: 'Scenario A: Normal Document Workflow',
      code: 'SCENARIO-A',
      description: 'Emulates routine user authoring, document drafting, note updates, and periodic spreadsheet autosaves at realistic human cadences.',
      technicalSignature: 'Nominal event cadence (0.8–1.5 ops/sec), standard file extensions (.docx, .xlsx, .pdf), negligible Shannon entropy variation (< +0.15).',
      expectedCadence: '0.8–1.5 ops/sec',
      expectedEntropy: '< +0.15 delta',
      targetExtensions: ['.docx', '.xlsx', '.txt', '.pdf'],
      riskTier: 'NORMAL (5–18 / 100)',
      badgeStyle: 'text-[#3fb950] border-[#238636]/50 bg-[#142918]'
    },
    'RAPID_ENCRYPTION_SIM': {
      label: 'Scenario B: Controlled Rapid Modification',
      code: 'SCENARIO-B',
      description: 'Simulates high-velocity in-place overwrite of dummy files using random high-entropy byte buffers to mimic automated ransomware encryption.',
      technicalSignature: 'Bursts of 18–32 ops/sec, modification ratio > 75%, elevated Shannon entropy delta (+0.70 to +0.95), zero file extension alterations.',
      expectedCadence: '18–32 ops/sec',
      expectedEntropy: '+0.70 to +0.95 delta',
      targetExtensions: ['.docx', '.xlsx', '.csv', '.tar'],
      riskTier: 'CRITICAL (75–94 / 100)',
      badgeStyle: 'text-[#f85149] border-[#da3633]/60 bg-[#3c1e1e]'
    },
    'RENAME_BURST_SIM': {
      label: 'Scenario C: Controlled Mass-Renaming Activity',
      code: 'SCENARIO-C',
      description: 'Simulates ransomware mass-appending known extortion extensions (.locked, .crypto, .enc) across directory hierarchies to restrict file access.',
      technicalSignature: 'Mass RENAME operations (> 70% window ratio), canary extension triggers, rapid directory traversal into ./sandbox_data/locked/.',
      expectedCadence: '14–22 ops/sec',
      expectedEntropy: '+0.45 to +0.80 delta',
      targetExtensions: ['.locked', '.crypto', '.enc'],
      riskTier: 'CRITICAL (85–98 / 100)',
      badgeStyle: 'text-[#f85149] border-[#da3633]/60 bg-[#3c1e1e]'
    }
  };

  const handleStart = () => {
    onStartSimulation(selectedScenario, duration, opLimit);
  };

  const handleConfirmedReset = () => {
    onResetSandbox();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Mandatory Safety & Confinement Notice */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-[#ffffff] shrink-0 font-extrabold">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#ffffff] flex items-center gap-2">
              <span>CONTROLLED SANDBOX DISPATCH &bull; NO REAL MALWARE</span>
              <span className="text-[10px] font-bold text-[#00e575] px-2.5 py-0.5 rounded-full border border-[#00e575]/30 bg-[#00e575]/10">
                100% CONFINED
              </span>
            </div>
            <p className="text-xs text-[#888888] mt-0.5">
              All threat rides execute harmless mock operations strictly within <code className="text-[#00d2ff] bg-[#141414] px-1.5 py-0.5 rounded font-mono">./sandbox_data/</code>.
              Zero real encryption binaries, zero system compromise, and zero external network transmission.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Ride Configuration & Sandbox State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Threat Ride Selector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scenario Selection */}
          <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
            <div className="border-b border-[#1c1c1c] pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                  Select Threat Simulation Ride
                </h2>
                <p className="text-xs text-[#888888] mt-0.5">
                  Choose a threat profile to dispatch and observe behavioral telemetry in real-time
                </p>
              </div>
              <span className="text-xs text-[#888888] font-semibold bg-[#141414] px-2.5 py-1 rounded-full border border-[#262626]">
                3 Profiles Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(scenarioMeta) as ScenarioType[]).map((scKey) => {
                const sc = scenarioMeta[scKey];
                const isSelected = selectedScenario === scKey;
                const isCurrentlySimulatingThis = isRunning && activeScenario === scKey;

                return (
                  <button
                    key={scKey}
                    onClick={() => !isRunning && setSelectedScenario(scKey)}
                    disabled={isRunning}
                    className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#181818] border-[#ffffff] text-[#ffffff] shadow-sm'
                        : 'bg-[#121212] border-[#222222] hover:border-[#383838] text-[#888888]'
                    } ${isRunning ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                        <span>{sc.code}</span>
                        {isCurrentlySimulatingThis && (
                          <span className="text-[#00e575] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-radar-pulse" />
                            RIDE ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-extrabold text-[#ffffff] mb-1 leading-snug">
                        {sc.label.split(':')[1] || sc.label}
                      </div>
                      <p className="text-[11px] text-[#888888] leading-relaxed mb-3">
                        {sc.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#222222] text-[10px] space-y-1.5 font-medium">
                      <div className="flex justify-between text-[#888888]">
                        <span>Velocity:</span>
                        <span className="text-[#ffffff] font-bold">{sc.expectedCadence}</span>
                      </div>
                      <div className="flex justify-between text-[#888888]">
                        <span>Entropy Delta:</span>
                        <span className="text-[#00d2ff] font-bold">{sc.expectedEntropy}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#888888] pt-0.5">
                        <span>Expected Fare:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${sc.badgeStyle}`}>
                          {sc.riskTier}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ride Parameters & Request Dispatch Bar */}
          <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs text-[#ffffff] font-bold block mb-1.5 flex justify-between">
                  <span>Trip Duration:</span>
                  <span className="text-[#00d2ff] font-bold">{duration} seconds</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="2"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-[#ffffff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#666666] font-medium mt-1">
                  <span>4 sec</span>
                  <span>15 sec</span>
                  <span>30 sec</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#ffffff] font-bold block mb-1.5 flex justify-between">
                  <span>Operation Cap (Dispatches):</span>
                  <span className="text-[#00d2ff] font-bold">{opLimit} operations</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={opLimit}
                  onChange={(e) => setOpLimit(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-[#ffffff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#666666] font-medium mt-1">
                  <span>10 ops</span>
                  <span>45 ops</span>
                  <span>80 ops</span>
                </div>
              </div>
            </div>

            {/* Uber-Style Request Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1c1c1c]">
              <div className="flex items-center gap-3">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-black transition-all cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#000000]" />
                    <span>Request Threat Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={onStopSimulation}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#ff334b] hover:bg-[#ff4d61] text-[#ffffff] rounded-full text-xs font-black transition-all cursor-pointer shadow-md animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-[#ffffff]" />
                    <span>Cancel Threat Journey</span>
                  </button>
                )}

                <button
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] text-[#cccccc] hover:text-[#ffffff] border border-[#2b2b2b] rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#888888]" />
                  <span>Reset Sandbox Files</span>
                </button>
              </div>

              <div className="text-xs text-[#888888] font-medium flex items-center gap-2">
                <span>Trip Status:</span>
                {isRunning ? (
                  <span className="text-[#00e575] font-extrabold flex items-center gap-1.5 bg-[#00e575]/10 px-2.5 py-0.5 rounded-full border border-[#00e575]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-radar-pulse" />
                    DISPATCHING {activeScenario}
                  </span>
                ) : (
                  <span className="text-[#888888] bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#262626]">
                    STANDBY AT BASE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Threat Journey Telemetry Stream */}
          <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#ffffff]">
                <Activity className="w-4 h-4 text-[#00d2ff]" />
                <span>Live Journey Telemetry (Real-Time Sandbox Logs)</span>
              </div>
              <span className="text-xs text-[#888888] font-semibold bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#242424]">
                {events.length} trips logged
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {events.slice(0, 8).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 text-xs bg-[#121212] hover:bg-[#181818] p-2.5 rounded-xl border border-[#202020] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#00e575] shrink-0" />
                    <span className="text-[#777777] font-mono text-[10px] whitespace-nowrap">
                      [{new Date(e.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      e.event_type === 'RENAME' ? 'text-[#d2a8ff] bg-[#271d3d]' :
                      e.event_type === 'MODIFY' ? 'text-[#79c0ff] bg-[#12233b]' : 'text-[#7ee787] bg-[#142918]'
                    }`}>
                      {e.event_type}
                    </span>
                    <span className="text-[#ffffff] font-medium text-xs truncate max-w-[200px]" title={e.sandbox_path}>
                      {e.filename}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <span className="text-[#888888] font-mono text-[11px]">
                      &Delta;H +{e.entropy_delta.toFixed(2)}
                    </span>
                    <span className="text-xs font-black text-[#ffffff] bg-[#1a1a1a] px-2 py-0.5 rounded-full border border-[#2a2a2a]">
                      Fare: {e.risk_score}
                    </span>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-[#777777] py-6 text-center text-xs">
                  Simulator idle. Select a threat scenario and click "Request Threat Simulation" to dispatch activity.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Virtual Sandbox Directory Inspector */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3 mb-3">
              <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-[#00d2ff]" />
                <span>Sandbox State</span>
              </h2>
              <span className="text-xs text-[#888888] font-semibold bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#242424]">
                {sandboxFiles.length} dummy files
              </span>
            </div>

            <div className="text-xs text-[#777777] mb-3">
              Boundary: <code className="text-[#00d2ff] bg-[#141414] px-1.5 py-0.5 rounded font-mono">./sandbox_data</code>
            </div>

            {/* File List */}
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {sandboxFiles.map((file, idx) => {
                const isDoc = file.name.endsWith('.docx') || file.name.endsWith('.txt') || file.name.endsWith('.pdf');
                const isLocked = file.status === 'simulated_lock' || file.name.includes('.locked') || file.name.includes('.crypto');

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                      isLocked
                        ? 'bg-[#251515] border-[#ff334b]/40 text-[#ffffff]'
                        : file.status === 'renamed'
                        ? 'bg-[#231a10] border-[#ff9900]/40 text-[#ffffff]'
                        : file.status === 'modified'
                        ? 'bg-[#12233b] border-[#00d2ff]/30 text-[#ffffff]'
                        : 'bg-[#121212] border-[#222222]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isDoc ? (
                        <FileText className={`w-4 h-4 shrink-0 ${isLocked ? 'text-[#ff334b]' : 'text-[#888888]'}`} />
                      ) : (
                        <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isLocked ? 'text-[#ff334b]' : 'text-[#888888]'}`} />
                      )}
                      <div className="min-w-0">
                        <div className="text-[#ffffff] font-bold truncate max-w-[130px] text-xs" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[10px] text-[#777777] font-mono">
                          {(file.size_bytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isLocked ? 'bg-[#ff334b] text-[#ffffff]' :
                      file.status === 'renamed' ? 'bg-[#ff9900] text-[#000000]' :
                      file.status === 'modified' ? 'bg-[#00d2ff] text-[#000000]' : 'bg-[#1e1e1e] text-[#888888]'
                    }`}>
                      {file.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a1a1a] text-xs text-[#777777]">
            Files safely restore to pristine baseline upon clicking "Reset Sandbox Files".
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Sandbox */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#2b2b2b] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#ff9900]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Reset Sandbox Dummy Files?
              </h3>
            </div>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              This will restore all dummy files in <code className="text-[#00d2ff] font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded">./sandbox_data/</code> back to clean baseline state and purge simulation buffers.
              Zero host or external files are touched.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#262626] text-[#cccccc] text-xs font-semibold rounded-full transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedReset}
                className="px-5 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
