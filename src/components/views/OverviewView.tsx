import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Shield,
  Bell,
  Database,
  ArrowUpRight,
  Check,
  FolderLock
} from 'lucide-react';
import {
  AuditEvent,
  AlertItem,
  RiskAnalysisSummary,
  RiskLevel
} from '../../types/sentinel';

interface OverviewViewProps {
  events: AuditEvent[];
  alerts: AlertItem[];
  riskAnalysis: RiskAnalysisSummary | null;
  isMonitoring: boolean;
  activeScenario: string | null;
  backendOnline: boolean;
  onAcknowledgeAlert: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  onSelectEvent: (event: AuditEvent) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  events,
  alerts,
  riskAnalysis,
  isMonitoring,
  backendOnline,
  onAcknowledgeAlert,
  onNavigateToTab,
  onSelectEvent,
}) => {
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'suspicious'>('all');

  // Exact metrics derived strictly from actual event records
  const totalEvents = events.length;
  const recentEventsInWindow = events.slice(0, 10);
  const modificationsInWindow = recentEventsInWindow.filter(e => e.event_type === 'MODIFY').length;
  const suspiciousEventsCount = events.filter(e => e.risk_level === 'SUSPICIOUS' || e.risk_level === 'CRITICAL').length;
  const highestObservedRisk = events.length > 0 ? Math.max(...events.map(e => e.risk_score)) : 0;
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  const displayEvents = (timelineFilter === 'suspicious' 
    ? events.filter(e => e.risk_level === 'SUSPICIOUS' || e.risk_level === 'CRITICAL')
    : events).slice(0, 16);

  const getRiskBadge = (level: RiskLevel, score: number) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-[#f85149] bg-[#3c1e1e] border-[#da3633]/60';
      case 'SUSPICIOUS':
        return 'text-[#d29922] bg-[#2d2214] border-[#d29922]/50';
      case 'WATCH':
        return 'text-[#e3b341] bg-[#262214] border-[#bb8009]/40';
      default:
        return 'text-[#3fb950] bg-[#16261a] border-[#238636]/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Uber-Style Dispatch Status Bar */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-radar-pulse"></span>
            <span className="text-[#888888] font-medium">Confinement:</span>
            <span className="text-[#ffffff] font-bold text-xs bg-[#181818] px-2.5 py-0.5 rounded-full border border-[#2a2a2a]">
              SANDBOX ISOLATED (./sandbox_data)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#888888] font-medium">Threat Radar:</span>
            <span className={`text-xs font-bold ${isMonitoring ? 'text-[#00e575]' : 'text-[#888888]'}`}>
              {isMonitoring ? 'OBSERVER ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#888888] font-medium">Inference Engine:</span>
            <span className="text-[#cccccc] text-xs font-semibold">
              RandomForest (100 Trees)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#888888] font-medium">Trip Storage:</span>
            <span className="text-[#cccccc] text-xs font-semibold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#00d2ff]" />
              {backendOnline ? 'SQLite (sentinel_lab.db)' : 'Local Dispatch Engine'}
            </span>
          </div>
        </div>

        <div className="text-xs text-[#777777] font-medium">
          Source: <strong className="text-[#ffffff] font-bold">{backendOnline ? 'Python Daemon :8000' : 'Embedded Engine'}</strong>
        </div>
      </div>

      {/* 2. Uber-Style Operational Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-[#0c0c0c] border border-[#222222] hover:border-[#383838] transition-all rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>OBSERVED TRIPS</span>
            <span className="text-[#555555]">LIFETIME</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#ffffff] tabular-nums tracking-tight">
              {totalEvents}
            </span>
            <span className="text-xs text-[#888888] font-medium">logged trips</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777] truncate font-medium">
            {totalEvents > 0 ? 'Sliding 3.0s window telemetry' : 'No events recorded in session'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0c0c0c] border border-[#222222] hover:border-[#383838] transition-all rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>MUTATIONS IN TRANSIT</span>
            <span className="text-[#555555]">OVERWRITES</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#00d2ff] tabular-nums tracking-tight">
              {modificationsInWindow}
            </span>
            <span className="text-xs text-[#888888] font-medium">window ops</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777] truncate font-medium">
            {recentEventsInWindow.length > 0 ? `${((modificationsInWindow / recentEventsInWindow.length) * 100).toFixed(0)}% of recent ops` : 'No modifications recorded'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0c0c0c] border border-[#222222] hover:border-[#383838] transition-all rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>ANOMALOUS TRIPS</span>
            <span className="text-[#555555]">FLAGGED</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black tabular-nums tracking-tight ${suspiciousEventsCount > 0 ? 'text-[#ff9900]' : 'text-[#ffffff]'}`}>
              {suspiciousEventsCount}
            </span>
            <span className="text-xs text-[#888888] font-medium">
              {totalEvents > 0 ? `(${((suspiciousEventsCount / totalEvents) * 100).toFixed(0)}%)` : 'records'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777] truncate font-medium">
            {suspiciousEventsCount > 0 ? 'Threat fare &ge; 60' : 'No suspicious events detected'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0c0c0c] border border-[#222222] hover:border-[#383838] transition-all rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider flex justify-between">
            <span>PEAK THREAT FARE</span>
            <span className="text-[#555555]">0–100</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black tabular-nums tracking-tight ${highestObservedRisk >= 85 ? 'text-[#ff334b]' : highestObservedRisk >= 60 ? 'text-[#ff9900]' : 'text-[#00e575]'}`}>
              {highestObservedRisk}
            </span>
            <span className="text-xs text-[#888888] font-medium">/ 100 index</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777] truncate font-medium">
            {totalEvents > 0 && riskAnalysis ? `Status: ${riskAnalysis.classification}` : 'Awaiting event telemetry'}
          </div>
        </div>
      </div>

      {/* 3. Quick Threat Dispatcher (Uber-Style Trip Selection) */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
              <span>Quick Threat Dispatch</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#00d2ff] font-semibold border border-[#2c2c2c]">
                SIMULATION MODES
              </span>
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Select and dispatch a controlled ransomware behavioral trip in the isolated sandbox
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('behaviour-lab')}
            className="px-4 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
          >
            Open Full Behaviour Lab
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigateToTab('behaviour-lab')}
            className="p-3.5 rounded-xl bg-[#121212] hover:bg-[#181818] border border-[#242424] hover:border-[#383838] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-[#ffffff] group-hover:text-[#00d2ff] transition-colors">
                Nominal Office
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e575]/15 text-[#00e575] font-bold border border-[#00e575]/30">
                SAFE &bull; ~12 RISK
              </span>
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Standard document authoring, edits, and spreadsheet saves at human operational velocity (0.8–1.5 ops/s).
            </p>
          </div>

          <div
            onClick={() => onNavigateToTab('behaviour-lab')}
            className="p-3.5 rounded-xl bg-[#121212] hover:bg-[#181818] border border-[#242424] hover:border-[#383838] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-[#ffffff] group-hover:text-[#ff334b] transition-colors">
                Rapid Encryptor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff334b]/15 text-[#ff334b] font-bold border border-[#ff334b]/30">
                CRITICAL &bull; ~88 RISK
              </span>
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              High-velocity in-place overwrite with high-entropy random buffers simulating automated ransomware encryptors (24 ops/s).
            </p>
          </div>

          <div
            onClick={() => onNavigateToTab('behaviour-lab')}
            className="p-3.5 rounded-xl bg-[#121212] hover:bg-[#181818] border border-[#242424] hover:border-[#383838] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-[#ffffff] group-hover:text-[#ff9900] transition-colors">
                Mass Mutator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff9900]/15 text-[#ff9900] font-bold border border-[#ff9900]/30">
                CRITICAL &bull; ~94 RISK
              </span>
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Extortion campaign simulation mass-appending canary extensions (.locked, .crypto) across directory hierarchies.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Primary Analytical Workspace: Behavioural Activity Chart & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Primary Behavioural Activity Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1c1c] pb-3 mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                  Behavioural Velocity &amp; Threat Telemetry
                </h2>
                <p className="text-xs text-[#888888] mt-0.5">
                  Chronological event trajectory mapping operation velocity (ops/sec) and composite risk index
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-[#141414] border border-[#262626] rounded-full">
                <button
                  onClick={() => setTimelineFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
                    timelineFilter === 'all'
                      ? 'bg-[#ffffff] text-[#000000] font-bold shadow-sm'
                      : 'text-[#888888] hover:text-[#ffffff]'
                  }`}
                >
                  All Trips
                </button>
                <button
                  onClick={() => setTimelineFilter('suspicious')}
                  className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
                    timelineFilter === 'suspicious'
                      ? 'bg-[#ffffff] text-[#000000] font-bold shadow-sm'
                      : 'text-[#888888] hover:text-[#ffffff]'
                  }`}
                >
                  Risk &ge; 60 Only
                </button>
              </div>
            </div>

            {/* Empty State vs Real Chart */}
            {events.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center border border-dashed border-[#262626] rounded-xl p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center mb-2.5 text-[#666666]">
                  <Activity className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-sm font-bold text-[#ffffff]">No events recorded</p>
                <p className="text-xs text-[#888888] max-w-sm mt-1">
                  Run a controlled experiment or connect a supported event source to begin analysis.
                </p>
                <button
                  onClick={() => onNavigateToTab('behaviour-lab')}
                  className="mt-4 px-4 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm"
                >
                  Open Behaviour Lab
                </button>
              </div>
            ) : (
              <div className="h-60 relative w-full pt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 170" preserveAspectRatio="none">
                  {/* Threshold Lines */}
                  <line x1="0" y1="25" x2="600" y2="25" stroke="#ff334b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="0" y1="70" x2="600" y2="70" stroke="#ff9900" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="115" x2="600" y2="115" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="155" x2="600" y2="155" stroke="#262626" strokeWidth="1" />

                  {/* Axis Threshold Labels */}
                  <text x="6" y="21" fill="#ff334b" fontSize="9" fontFamily="monospace">Risk 85 (Critical Threshold)</text>
                  <text x="6" y="66" fill="#ff9900" fontSize="9" fontFamily="monospace">Risk 60 (Suspicious Anomaly)</text>
                  <text x="6" y="111" fill="#888888" fontSize="9" fontFamily="monospace">Risk 30 (Watch Boundary)</text>

                  {/* Line Connection */}
                  {displayEvents.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#00d2ff"
                      strokeWidth="2"
                      points={displayEvents
                        .slice(0, 24)
                        .reverse()
                        .map((evt, idx, arr) => {
                          const x = (idx / Math.max(1, arr.length - 1)) * 580 + 10;
                          const y = 155 - (evt.risk_score / 100) * 130;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Event Points */}
                  {displayEvents.slice(0, 24).reverse().map((evt, idx, arr) => {
                    const x = (idx / Math.max(1, arr.length - 1)) * 580 + 10;
                    const y = 155 - (evt.risk_score / 100) * 130;
                    const isThreat = evt.risk_level === 'CRITICAL' || evt.risk_level === 'SUSPICIOUS';
                    return (
                      <g key={evt.id} className="cursor-pointer" onClick={() => onSelectEvent(evt)}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isThreat ? 4.5 : 3}
                          fill={isThreat ? (evt.risk_level === 'CRITICAL' ? '#ff334b' : '#ff9900') : '#00d2ff'}
                          stroke="#0c0c0c"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="flex items-center justify-between text-[11px] text-[#777777] mt-3 px-1 font-medium">
                  <span>Earliest in window</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00d2ff]"></span> Normal
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#ff9900]"></span> Suspicious (&ge;60)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#ff334b]"></span> Critical (&ge;85)
                    </span>
                  </div>
                  <span>Latest observation</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Assessment & Fare Breakdown Panel (1 Column) */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1c1c1c] pb-3 mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                  Risk Fare Assessment
                </h2>
                <p className="text-xs text-[#888888]">
                  Composite heuristic + Scikit-learn
                </p>
              </div>
              {riskAnalysis && (
                <span className={`text-xs px-3 py-1 rounded-full border font-bold ${getRiskBadge(riskAnalysis.classification, riskAnalysis.currentScore)}`}>
                  {riskAnalysis.classification} &bull; {riskAnalysis.currentScore}
                </span>
              )}
            </div>

            {riskAnalysis ? (
              <div className="space-y-3">
                {/* Model Probability vs Heuristic Score */}
                <div className="p-3 rounded-xl bg-[#141414] border border-[#242424] text-xs space-y-2">
                  <div className="flex justify-between text-[#888888]">
                    <span>ML Model Confidence:</span>
                    <span className="text-[#ffffff] font-bold">{(riskAnalysis.model_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>Predicted Classification:</span>
                    <span className={`font-bold ${riskAnalysis.model_prediction === 'RANSOMWARE_LIKE' ? 'text-[#ff334b]' : 'text-[#00e575]'}`}>
                      {riskAnalysis.model_prediction}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>Heuristic Triggers:</span>
                    <span className="text-[#ffffff] font-bold">{riskAnalysis.rule_trigger_count} flagged</span>
                  </div>
                </div>

                {/* Contributing Features */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                    Contributing Factor Weights
                  </div>
                  {riskAnalysis.contributing_features.map((feat, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#141414] border border-[#222222] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#ffffff] font-bold text-[11px]">{feat.factor}</span>
                        <span className="tabular-nums text-[11px] text-[#00d2ff] font-semibold">{feat.observed_value}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#777777] mt-1 font-medium">
                        <span>Threshold: {feat.threshold}</span>
                        <span className={feat.status === 'ANOMALOUS' ? 'text-[#ff334b] font-bold' : feat.status === 'WARNING' ? 'text-[#ff9900] font-bold' : 'text-[#00e575]'}>
                          {feat.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#888888] space-y-1">
                <p className="text-[#ffffff] font-bold">No risk assessment available</p>
                <p className="text-[11px]">Telemetry required for inference.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1a1a1a] text-xs text-[#888888] leading-relaxed">
            <span className="text-[#ffffff] font-bold block mb-1">ANALYSIS SUMMARY:</span>
            {riskAnalysis ? riskAnalysis.explanation : 'Awaiting filesystem activity to evaluate behavioral rules.'}
          </div>
        </div>
      </div>

      {/* 5. Lower Section: Recent Forensic Trip Observations & Alert Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Forensic Observations (2 Columns) */}
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3 mb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Recent Threat Journeys &amp; Observations
              </h2>
              <p className="text-xs text-[#888888] mt-0.5">
                Observed filesystem trip routes with technical forensics
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('investigation-timeline')}
              className="text-xs font-bold text-[#00d2ff] hover:text-[#5ce1e6] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#888888]">
              No events recorded. Run a controlled experiment or connect a supported event source to begin analysis.
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="p-3 rounded-xl bg-[#121212] hover:bg-[#181818] border border-[#222222] hover:border-[#333333] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${evt.risk_level === 'CRITICAL' ? 'bg-[#ff334b]' : evt.risk_level === 'SUSPICIOUS' ? 'bg-[#ff9900]' : 'bg-[#00e575]'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#ffffff] font-bold text-xs truncate max-w-[200px]" title={evt.filename}>
                          {evt.filename}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          evt.event_type === 'RENAME' ? 'text-[#d2a8ff] bg-[#271d3d]' :
                          evt.event_type === 'MODIFY' ? 'text-[#79c0ff] bg-[#12233b]' : 'text-[#7ee787] bg-[#142918]'
                        }`}>
                          {evt.event_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777777] font-mono mt-0.5 truncate">
                        {evt.sandbox_path} &bull; Cadence: {evt.activity_rate.toFixed(1)} ops/s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-[#ffffff] tabular-nums">
                        {evt.risk_score}
                      </div>
                      <div className="text-[10px] text-[#777777] font-mono">
                        +{(evt.entropy_delta).toFixed(2)} &Delta;H
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(evt.risk_level, evt.risk_score)}`}>
                      {evt.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Queue & Storage Health Summary (1 Column) */}
        <div className="space-y-4">
          {/* Alert Queue */}
          <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3 mb-3">
              <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#ff334b]" />
                <span>Incident Queue</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1c1c1c] text-[#888888] border border-[#2b2b2b]">
                {activeAlerts.length} Active / {alerts.length}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#888888]">
                No active threat alerts in queue.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs ${
                      alert.acknowledged
                        ? 'bg-[#121212] border-[#222222] text-[#888888]'
                        : alert.severity === 'CRITICAL'
                        ? 'bg-[#251515] border-[#ff334b]/40 text-[#ffffff]'
                        : 'bg-[#21180f] border-[#ff9900]/40 text-[#ffffff]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold ${
                        alert.severity === 'CRITICAL' ? 'text-[#ff334b]' : 'text-[#ff9900]'
                      }`}>
                        {alert.severity} &bull; Risk {alert.risk_score}
                      </span>
                      <span className="text-[10px] text-[#777777]">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#ffffff] truncate">
                      {alert.title}
                    </div>
                    <div className="text-[11px] text-[#888888] line-clamp-1 mt-0.5">
                      {alert.message}
                    </div>
                    {!alert.acknowledged && (
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] text-[11px] font-bold rounded-full transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-[#000000]" />
                          <span>Acknowledge</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confinement Integrity Card */}
          <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 text-xs">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-2">
              Confinement &amp; Dispatch Integrity
            </div>
            <div className="space-y-2 text-xs text-[#888888]">
              <div className="flex justify-between">
                <span>Model Pipeline:</span>
                <span className="text-[#00e575] font-bold">100 Trees Fitted</span>
              </div>
              <div className="flex justify-between">
                <span>Traversal Guard:</span>
                <span className="text-[#00e575] font-bold">Path.resolve() Active</span>
              </div>
              <div className="flex justify-between">
                <span>Remediation Policy:</span>
                <span className="text-[#cccccc] font-semibold">Alert &amp; Log Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
