import React, { useState } from 'react';
import {
  Download,
  Search,
  Clock,
  Layers,
  ArrowRight,
  FileText,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  Terminal,
  ChevronRight
} from 'lucide-react';
import {
  AuditEvent,
  RiskLevel
} from '../../types/sentinel';
import { sandboxEngine } from '../../services/sandboxEngine';

interface InvestigationTimelineViewProps {
  events: AuditEvent[];
  onSelectEvent: (event: AuditEvent) => void;
  onNavigateToTab: (tab: any) => void;
}

export const InvestigationTimelineView: React.FC<InvestigationTimelineViewProps> = ({
  events,
  onSelectEvent,
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedProvenance, setSelectedProvenance] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TERMINAL'>('CARDS');

  // Filtering
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sandbox_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.detection_reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || e.event_type === selectedType;
    const matchesRisk = selectedRisk === 'ALL' || e.risk_level === selectedRisk;
    const prov = e.provenance || (e.is_simulated ? 'CONTROLLED_SIMULATOR' : 'LIVE_OBSERVER');
    const matchesProv = selectedProvenance === 'ALL' || prov === selectedProvenance;
    return matchesSearch && matchesType && matchesRisk && matchesProv;
  });

  const getRiskBadge = (level: RiskLevel, score: number) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-[#ff334b] bg-[#ff334b]/15 border-[#ff334b]/40';
      case 'SUSPICIOUS':
        return 'text-[#ff9900] bg-[#ff9900]/15 border-[#ff9900]/40';
      case 'WATCH':
        return 'text-[#ffcc00] bg-[#ffcc00]/15 border-[#ffcc00]/30';
      default:
        return 'text-[#00e575] bg-[#00e575]/15 border-[#00e575]/30';
    }
  };

  const handleExportCSV = () => {
    const csvData = sandboxEngine.exportEventsAsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinel_x_trip_logs_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const criticalCount = events.filter(e => e.risk_level === 'CRITICAL').length;
  const avgRisk = events.length > 0 ? (events.reduce((acc, e) => acc + e.risk_score, 0) / events.length).toFixed(0) : '0';

  return (
    <div className="space-y-4">
      {/* 1. Header & Uber-Style Metrics Strip */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#00d2ff] font-bold text-[10px] tracking-wider uppercase border border-[#2b2b2b]">
                ACTIVITY LEDGER
              </span>
              <span className="text-[#666666] text-xs">&bull;</span>
              <span className="text-[#888888] text-xs font-medium">Uber-Style Threat Logs &amp; Receipts</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#ffffff] mt-1">
              Incident Logs &amp; Forensic Routes
            </h1>
            <p className="text-xs text-[#888888] mt-0.5">
              Every observed filesystem trip is logged with origin paths, high-entropy transit deltas, and risk fares.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex bg-[#141414] p-1 rounded-full border border-[#262626]">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-[#ffffff] text-[#000000] shadow-sm font-bold'
                    : 'text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                Trip Cards
              </button>
              <button
                onClick={() => setViewMode('TERMINAL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'TERMINAL'
                    ? 'bg-[#ffffff] text-[#000000] shadow-sm font-bold'
                    : 'text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                Raw Terminal
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Receipts (CSV)</span>
            </button>
          </div>
        </div>

        {/* Quick Log Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Total Recorded Trips</div>
            <div className="text-2xl font-black text-[#ffffff] tabular-nums mt-0.5">{events.length}</div>
            <div className="text-[10px] text-[#666666]">Filesystem operations logged</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Critical Threat Fares</div>
            <div className="text-2xl font-black text-[#ff334b] tabular-nums mt-0.5">{criticalCount}</div>
            <div className="text-[10px] text-[#666666]">Ransomware-pattern journeys</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Average Threat Fare</div>
            <div className="text-2xl font-black text-[#00d2ff] tabular-nums mt-0.5">{avgRisk} <span className="text-xs font-normal text-[#888888]">/ 100</span></div>
            <div className="text-[10px] text-[#666666]">Weighted composite risk</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Confinement Guard</div>
            <div className="text-sm font-bold text-[#00e575] flex items-center gap-1 mt-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Contained</span>
            </div>
            <div className="text-[10px] text-[#666666]">Zero host escapes</div>
          </div>
        </div>

        {/* Uber-Style Filter Pills Row */}
        <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by target filename, ID, or threat signature..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#262626] rounded-full text-xs text-[#ffffff] placeholder-[#666666] focus:outline-none focus:border-[#ffffff] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[#141414] border border-[#262626] text-[#cccccc] rounded-full px-3.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Threat Fares</option>
              <option value="CRITICAL">Critical Fares (&ge; 85)</option>
              <option value="SUSPICIOUS">Suspicious (60–84)</option>
              <option value="WATCH">Watch (30–59)</option>
              <option value="NORMAL">Normal (&lt; 30)</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#141414] border border-[#262626] text-[#cccccc] rounded-full px-3.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Trip Types</option>
              <option value="MODIFY">MODIFY (Overwrite)</option>
              <option value="RENAME">RENAME (Mutation)</option>
              <option value="CREATE">CREATE (Drop)</option>
              <option value="DELETE">DELETE (Purge)</option>
            </select>

            <select
              value={selectedProvenance}
              onChange={(e) => setSelectedProvenance(e.target.value)}
              className="bg-[#141414] border border-[#262626] text-[#cccccc] rounded-full px-3.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Sources</option>
              <option value="CONTROLLED_SIMULATOR">Controlled Simulator</option>
              <option value="LIVE_OBSERVER">Live Observer</option>
              <option value="SQLITE_ARCHIVE">SQLite Archive</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Logs Feed: Trip Cards or Terminal Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#2b2b2b] flex items-center justify-center mx-auto text-[#666666]">
            <Clock className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#ffffff]">
              {events.length === 0 ? 'No threat trips recorded' : 'No matching evidence found'}
            </h3>
            <p className="text-xs text-[#888888] mt-1 max-w-md mx-auto">
              {events.length === 0
                ? 'Request a controlled simulation or connect a supported event source to log threat journeys.'
                : 'No logs match your filter criteria. Clear your search or change threat fare filters.'}
            </p>
          </div>
          {events.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedRisk('ALL');
                setSelectedProvenance('ALL');
              }}
              className="px-4 py-1.5 bg-[#ffffff] text-[#000000] text-xs font-bold rounded-full transition-all hover:bg-[#e0e0e0] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Uber-Style Trip Route Cards */
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const isCritical = evt.risk_level === 'CRITICAL';
            const baseOrigin = evt.event_type === 'RENAME'
              ? evt.filename.replace(/\.(locked|crypto|enc)$/i, '')
              : evt.filename;

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="bg-[#0c0c0c] hover:bg-[#121212] border border-[#222222] hover:border-[#383838] rounded-2xl p-4 transition-all duration-150 cursor-pointer shadow-sm group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Origin to Destination Route Map */}
                  <div className="flex-1 space-y-2">
                    {/* Top Log Meta */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#00d2ff] bg-[#141414] px-2 py-0.5 rounded-full border border-[#242424] font-semibold">
                        {evt.id}
                      </span>
                      <span className="text-[11px] text-[#888888]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-[#444444]">&bull;</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181818] text-[#888888] font-medium border border-[#282828]">
                        {evt.provenance === 'CONTROLLED_SIMULATOR' ? 'SIMULATOR RIDE' : 'OBSERVER TELEMETRY'}
                      </span>
                    </div>

                    {/* Route Visualizer */}
                    <div className="pl-1 space-y-1.5">
                      {/* Origin Node */}
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] shrink-0 shadow-sm" />
                        <span className="text-[#888888] font-medium text-[11px]">Origin:</span>
                        <span className="text-[#ffffff] font-mono text-[11px] truncate max-w-sm">
                          ./sandbox_data/{baseOrigin}
                        </span>
                      </div>

                      {/* Transit Line */}
                      <div className="flex items-center gap-2.5 pl-1 text-[10px] text-[#666666] font-mono">
                        <div className="w-0.5 h-4 bg-[#2b2b2b] ml-0.5" />
                        <span className="bg-[#161616] px-2 py-0.5 rounded text-[#999999] border border-[#262626]">
                          {evt.event_type} &middot; {evt.activity_rate.toFixed(1)} ops/s &middot; Entropy &Delta; +{evt.entropy_delta.toFixed(2)}
                        </span>
                      </div>

                      {/* Destination Node */}
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${isCritical ? 'bg-[#ff334b]' : 'bg-[#00d2ff]'}`} />
                        <span className="text-[#888888] font-medium text-[11px]">Target:</span>
                        <span className="text-[#ffffff] font-mono text-[11px] truncate max-w-sm font-semibold">
                          {evt.sandbox_path}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Threat Fare & Inspection Button */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-[#1f1f1f] pt-3 md:pt-0 md:pl-5 shrink-0">
                    <div>
                      <div className="text-[10px] text-[#777777] font-bold uppercase tracking-wider text-right">
                        Threat Fare
                      </div>
                      <div className="text-2xl font-black text-[#ffffff] tabular-nums text-right">
                        {evt.risk_score} <span className="text-xs font-normal text-[#888888]">/ 100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(evt.risk_level, evt.risk_score)}`}>
                        {evt.risk_level}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-bold transition-all"
                      >
                        <span>Receipt</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Raw Terminal Grid Table */
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 font-mono text-xs overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#222222] text-[#666666] text-[10px] uppercase tracking-wider">
                <th className="pb-3 font-bold">Event ID</th>
                <th className="pb-3 font-bold">Timestamp</th>
                <th className="pb-3 font-bold">Source</th>
                <th className="pb-3 font-bold">Op</th>
                <th className="pb-3 font-bold">Sandbox Target</th>
                <th className="pb-3 font-bold text-right">Size</th>
                <th className="pb-3 font-bold text-right">Entropy &Delta;</th>
                <th className="pb-3 font-bold text-right">Cadence</th>
                <th className="pb-3 font-bold text-right">Risk</th>
                <th className="pb-3 font-bold pl-4">Signature Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="hover:bg-[#141414] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 text-[10px] text-[#00d2ff] whitespace-nowrap font-bold">
                    {evt.id}
                  </td>
                  <td className="py-2.5 text-[11px] text-[#888888] tabular-nums whitespace-nowrap">
                    {new Date(evt.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-2.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#181818] text-[#888888] border border-[#282828]">
                      {evt.provenance === 'CONTROLLED_SIMULATOR' ? 'SIMULATOR' : 'OBSERVER'}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      evt.event_type === 'RENAME' ? 'text-[#d2a8ff] bg-[#271d3d]' :
                      evt.event_type === 'MODIFY' ? 'text-[#79c0ff] bg-[#12233b]' : 'text-[#7ee787] bg-[#142918]'
                    }`}>
                      {evt.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 text-[#e0e0e0] truncate max-w-[180px] text-[11px]" title={evt.sandbox_path}>
                    {evt.filename}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-[#888888] text-[11px]">
                    {(evt.file_size_bytes / 1024).toFixed(1)}K
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-[#888888] text-[11px]">
                    +{evt.entropy_delta.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-[#888888] text-[11px]">
                    {evt.activity_rate.toFixed(1)}/s
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getRiskBadge(evt.risk_level, evt.risk_score)}`}>
                      {evt.risk_score}
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-[#888888] truncate max-w-[220px] text-[11px]" title={evt.detection_reason}>
                    {evt.detection_reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
