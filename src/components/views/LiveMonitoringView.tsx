import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Search,
  CheckCircle2,
  FolderLock
} from 'lucide-react';
import {
  AuditEvent,
  FeatureVector,
  RiskLevel
} from '../../types/sentinel';

interface LiveMonitoringViewProps {
  events: AuditEvent[];
  features: FeatureVector[];
  isMonitoring: boolean;
  onSelectEvent: (event: AuditEvent) => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  events,
  features,
  isMonitoring,
  onSelectEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Distribution calculations
  const total = events.length;
  const modCount = events.filter(e => e.event_type === 'MODIFY').length;
  const renCount = events.filter(e => e.event_type === 'RENAME').length;
  const createCount = events.filter(e => e.event_type === 'CREATE').length;
  const delCount = events.filter(e => e.event_type === 'DELETE').length;

  const modPct = total > 0 ? (modCount / total) * 100 : 0;
  const renPct = total > 0 ? (renCount / total) * 100 : 0;
  const crePct = total > 0 ? (createCount / total) * 100 : 0;
  const delPct = total > 0 ? (delCount / total) * 100 : 0;

  // Filtered live events
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.sandbox_path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || e.event_type === filterType;
    return matchesSearch && matchesType;
  });

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

  const latestFeature = features[0];

  return (
    <div className="space-y-4">
      {/* 1. Rolling Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">RADAR CADENCE (VELOCITY)</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[#00d2ff] tabular-nums tracking-tight">
              {latestFeature ? latestFeature.event_rate_per_sec.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-[#888888] font-medium">ops/sec</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Sliding 3.0-second time slice
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">MODIFICATION RATIO</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[#ffffff] tabular-nums tracking-tight">
              {latestFeature ? `${(latestFeature.modification_ratio * 100).toFixed(0)}%` : '0%'}
            </span>
            <span className="text-xs text-[#888888] font-medium">window %</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Proportion of overwrite actions
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">RENAME MUTATION RATIO</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[#ffffff] tabular-nums tracking-tight">
              {latestFeature ? `${(latestFeature.rename_ratio * 100).toFixed(0)}%` : '0%'}
            </span>
            <span className="text-xs text-[#888888] font-medium">window %</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Extension alterations observed
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">OBSERVER INTEGRITY</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#00e575] font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>./sandbox_data only</span>
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Strict sandbox boundary
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Rolling Event Rate Chart & Operation Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rolling Event Rate Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
          <div className="border-b border-[#1c1c1c] pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Live Operation Frequency Telemetry (ops/sec)
              </h2>
              <p className="text-xs text-[#888888] mt-0.5">
                Velocity indicator: Automated ransomware encryptors burst &gt; 15.0 ops/sec
              </p>
            </div>
            <div className="text-xs font-bold text-[#00d2ff] bg-[#141414] px-3 py-1 rounded-full border border-[#262626]">
              {isMonitoring ? 'RADAR ACTIVE' : 'RADAR PAUSED'}
            </div>
          </div>

          <div className="h-44 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#da3633" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="0" y1="55" x2="500" y2="55" stroke="#21262d" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="0" y1="95" x2="500" y2="95" stroke="#21262d" strokeWidth="1" strokeDasharray="2 2" />
              
              <text x="6" y="16" fill="#f85149" fontSize="8" fontFamily="monospace">15.0 ops/sec (Threat Threshold)</text>
              <text x="6" y="51" fill="#8b949e" fontSize="8" fontFamily="monospace">8.0 ops/sec (Elevated Alert)</text>
              <text x="6" y="91" fill="#8b949e" fontSize="8" fontFamily="monospace">2.0 ops/sec (Baseline Authoring)</text>

              {features.length <= 1 && (
                <text x="250" y="75" textAnchor="middle" fill="#484f58" fontSize="10" fontFamily="monospace">
                  Awaiting multi-point sliding window telemetry
                </text>
              )}

              {features.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#58a6ff"
                  strokeWidth="1.5"
                  points={features.slice(0, 20).reverse().map((f, i, arr) => {
                    const x = (i / Math.max(1, arr.length - 1)) * 480 + 10;
                    const y = 110 - Math.min(100, (f.event_rate_per_sec / 25) * 90);
                    return `${x},${y}`;
                  }).join(' ')}
                />
              )}
            </svg>
          </div>
        </div>

        {/* Operation Distribution (1 Col) */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
          <div className="border-b border-[#1c1c1c] pb-3 mb-4">
            <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00d2ff]" />
              <span>Operation Breakdown</span>
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Filesystem operation distribution in transit
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                  <span>MODIFY (Overwrites)</span>
                </span>
                <span className="tabular-nums font-bold text-[#ffffff]">{modCount} ({modPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2 overflow-hidden">
                <div className="bg-[#00d2ff] h-full rounded-full transition-all duration-300" style={{ width: `${modPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                  <span>RENAME (Extension Alterations)</span>
                </span>
                <span className="tabular-nums font-bold text-[#ffffff]">{renCount} ({renPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2 overflow-hidden">
                <div className="bg-[#c084fc] h-full rounded-full transition-all duration-300" style={{ width: `${renPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                  <span>CREATE (New Files)</span>
                </span>
                <span className="tabular-nums font-bold text-[#ffffff]">{createCount} ({crePct.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2 overflow-hidden">
                <div className="bg-[#00e575] h-full rounded-full transition-all duration-300" style={{ width: `${crePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#e0e0e0] mb-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#777777]" />
                  <span>DELETE (Removals)</span>
                </span>
                <span className="tabular-nums font-bold text-[#ffffff]">{delCount} ({delPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2 overflow-hidden">
                <div className="bg-[#777777] h-full rounded-full transition-all duration-300" style={{ width: `${delPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Chronological Event Stream Table */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1c1c] pb-4 mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
              Live Threat Telemetry Stream
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Click any event row to open forensic evidence breakdown and trip receipt
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded-full text-xs text-[#ffffff] placeholder-[#666666] focus:outline-none focus:border-[#00d2ff] w-44 font-medium"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#141414] border border-[#262626] rounded-full px-3 py-1.5 text-xs text-[#e0e0e0] font-medium focus:outline-none focus:border-[#00d2ff]"
            >
              <option value="ALL">All Trip Types</option>
              <option value="MODIFY">MODIFY</option>
              <option value="RENAME">RENAME</option>
              <option value="CREATE">CREATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto mb-3">
              <Activity className="w-5 h-5 text-[#555555]" />
            </div>
            <div className="text-sm font-bold text-[#ffffff]">No telemetry recorded</div>
            <div className="text-xs text-[#777777] mt-1 max-w-md mx-auto">
              Observer awaiting filesystem activity. Run a controlled simulation or connect a supported event source to begin monitoring.
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#888888]">
            No telemetry records match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[#888888] text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-2.5">Timestamp</th>
                  <th className="pb-2.5">Provenance</th>
                  <th className="pb-2.5">Trip Type</th>
                  <th className="pb-2.5">Target File</th>
                  <th className="pb-2.5 text-right">Size</th>
                  <th className="pb-2.5 text-right">Entropy &Delta;</th>
                  <th className="pb-2.5 text-right">Cadence</th>
                  <th className="pb-2.5 text-right">Threat Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {filteredEvents.slice(0, 10).map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="hover:bg-[#141414] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 text-xs text-[#888888] tabular-nums whitespace-nowrap font-medium">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#aaaaaa] border border-[#262626]">
                        {evt.provenance === 'CONTROLLED_SIMULATOR' ? 'SIMULATOR' : evt.provenance === 'SQLITE_ARCHIVE' ? 'SQLITE' : 'OBSERVER'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.event_type === 'RENAME' ? 'text-[#c084fc] bg-[#22152e] border border-[#a855f7]/30' :
                        evt.event_type === 'MODIFY' ? 'text-[#00d2ff] bg-[#0d2230] border border-[#00d2ff]/30' : 'text-[#00e575] bg-[#0f2416] border border-[#00e575]/30'
                      }`}>
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="py-3 text-[#ffffff] font-medium truncate max-w-[200px] text-xs group-hover:text-[#00d2ff] transition-colors" title={evt.filename}>
                      {evt.filename}
                    </td>
                    <td className="py-3 text-right tabular-nums text-[#888888] text-xs font-mono">
                      {(evt.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 text-right tabular-nums text-[#888888] text-xs font-mono">
                      +{evt.entropy_delta.toFixed(2)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-[#888888] text-xs font-mono">
                      {evt.activity_rate.toFixed(1)} /s
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${getRiskBadge(evt.risk_level, evt.risk_score)}`}>
                        {evt.risk_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
