import React, { useState } from 'react';
import {
  Database,
  Download,
  Trash2,
  Table,
  AlertTriangle
} from 'lucide-react';
import {
  AuditEvent,
  FeatureVector,
  AlertItem
} from '../../types/sentinel';
import { sandboxEngine } from '../../services/sandboxEngine';

interface EventArchiveViewProps {
  events: AuditEvent[];
  features: FeatureVector[];
  alerts: AlertItem[];
  onResetDatabase: () => void;
}

export const EventArchiveView: React.FC<EventArchiveViewProps> = ({
  events,
  features,
  alerts,
  onResetDatabase,
}) => {
  const [activeTable, setActiveTable] = useState<'events' | 'features' | 'alerts'>('events');
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const handleExportEventsCSV = () => {
    const csv = sandboxEngine.exportEventsAsCSV();
    downloadBlob(csv, `sentinel_events_archive_${Date.now()}.csv`);
  };

  const handleExportFeaturesCSV = () => {
    const csv = sandboxEngine.exportFeaturesAsCSV();
    downloadBlob(csv, `sentinel_features_archive_${Date.now()}.csv`);
  };

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. Database Storage Header */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1c1c] pb-4 mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00d2ff]" />
              <span>SQLite Persistent Telemetry Store</span>
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Database schema: <code className="text-[#00d2ff] bg-[#141414] px-1.5 py-0.5 rounded font-mono">sentinel_lab.db</code> &middot; Persists all threat journeys, feature vectors, and fare calculations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={activeTable === 'features' ? handleExportFeaturesCSV : handleExportEventsCSV}
              disabled={activeTable === 'events' ? events.length === 0 : activeTable === 'features' ? features.length === 0 : alerts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] text-[#ffffff] border border-[#262626] rounded-full text-xs font-bold transition-colors shrink-0 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>Export Archive (CSV)</span>
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              disabled={events.length === 0 && features.length === 0 && alerts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a0e14] hover:bg-[#38131b] text-[#ff334b] border border-[#ff334b]/30 rounded-full text-xs font-bold transition-colors shrink-0 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#ff334b]" />
              <span>Reset Store</span>
            </button>
          </div>
        </div>

        {/* Table Selector Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTable('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeTable === 'events'
                ? 'bg-[#ffffff] text-[#000000] shadow-sm'
                : 'text-[#888888] hover:text-[#ffffff] bg-[#141414] border border-[#262626]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>audit_events ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTable('features')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeTable === 'features'
                ? 'bg-[#ffffff] text-[#000000] shadow-sm'
                : 'text-[#888888] hover:text-[#ffffff] bg-[#141414] border border-[#262626]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>feature_vectors ({features.length})</span>
          </button>

          <button
            onClick={() => setActiveTable('alerts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeTable === 'alerts'
                ? 'bg-[#ffffff] text-[#000000] shadow-sm'
                : 'text-[#888888] hover:text-[#ffffff] bg-[#141414] border border-[#262626]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>alerts ({alerts.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Table Viewer with Strict Empty State */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        {activeTable === 'events' && (
          events.length === 0 ? (
            <div className="py-16 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto mb-3">
                <Table className="w-5 h-5 text-[#555555]" />
              </div>
              <p className="text-sm font-bold text-[#ffffff]">No archived records</p>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">Events will appear after they have been persisted successfully.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[#888888] text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Provenance</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Target Path</th>
                    <th className="pb-3 text-right">Size (B)</th>
                    <th className="pb-3 text-right">Entropy &Delta;</th>
                    <th className="pb-3 text-right">Threat Fare</th>
                    <th className="pb-3">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {events.slice(0, 15).map((e) => (
                    <tr key={e.id} className="hover:bg-[#141414] transition-colors">
                      <td className="py-3 text-[11px] text-[#00d2ff] font-mono truncate max-w-[80px]">{e.id}</td>
                      <td className="py-3 text-[#888888] text-xs tabular-nums whitespace-nowrap font-medium">
                        {new Date(e.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#aaaaaa] border border-[#262626]">
                          {e.provenance === 'CONTROLLED_SIMULATOR' ? 'SIMULATOR' : e.provenance === 'SQLITE_ARCHIVE' ? 'SQLITE' : 'OBSERVER'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-semibold text-[#ffffff]">{e.event_type}</span>
                      </td>
                      <td className="py-3 text-[#e0e0e0] font-medium truncate max-w-[200px]" title={e.sandbox_path}>{e.sandbox_path}</td>
                      <td className="py-3 text-right text-[#888888] tabular-nums font-mono">{e.file_size_bytes}</td>
                      <td className="py-3 text-right text-[#888888] tabular-nums font-mono">+{e.entropy_delta.toFixed(2)}</td>
                      <td className="py-3 text-right font-black text-[#ffffff] tabular-nums">{e.risk_score}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          e.risk_level === 'CRITICAL' ? 'text-[#ff334b] bg-[#2a0e14] border border-[#ff334b]/30' :
                          e.risk_level === 'SUSPICIOUS' ? 'text-[#ff9900] bg-[#261706] border border-[#ff9900]/30' :
                          'text-[#00e575] bg-[#0c2415] border border-[#00e575]/30'
                        }`}>
                          {e.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTable === 'features' && (
          features.length === 0 ? (
            <div className="py-16 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto mb-3">
                <Table className="w-5 h-5 text-[#555555]" />
              </div>
              <p className="text-sm font-bold text-[#ffffff]">No archived records</p>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">Feature vectors will appear after they have been extracted and persisted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[#888888] text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Rate (/s)</th>
                    <th className="pb-3 text-right">Mod %</th>
                    <th className="pb-3 text-right">Rename %</th>
                    <th className="pb-3 text-right">Entropy</th>
                    <th className="pb-3 text-right">Bursts</th>
                    <th className="pb-3">ML Inference</th>
                    <th className="pb-3 text-right">ML Prob</th>
                    <th className="pb-3 text-right">Threat Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {features.slice(0, 15).map((f) => (
                    <tr key={f.id} className="hover:bg-[#141414] transition-colors">
                      <td className="py-3 text-[#888888] tabular-nums whitespace-nowrap font-medium">
                        {new Date(f.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-right text-[#00d2ff] tabular-nums font-mono">{f.event_rate_per_sec.toFixed(1)}</td>
                      <td className="py-3 text-right text-[#e0e0e0] tabular-nums font-mono">{(f.modification_ratio * 100).toFixed(0)}%</td>
                      <td className="py-3 text-right text-[#e0e0e0] tabular-nums font-mono">{(f.rename_ratio * 100).toFixed(0)}%</td>
                      <td className="py-3 text-right text-[#e0e0e0] tabular-nums font-mono">+{f.extension_entropy.toFixed(2)}</td>
                      <td className="py-3 text-right text-[#e0e0e0] tabular-nums font-mono">{f.rapid_burst_count}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.ml_prediction === 'RANSOMWARE_LIKE' ? 'text-[#ff334b] bg-[#2a0e14] border border-[#ff334b]/30' : 'text-[#00e575] bg-[#0c2415] border border-[#00e575]/30'}`}>
                          {f.ml_prediction}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[#e0e0e0] tabular-nums font-mono">{(f.ml_confidence * 100).toFixed(0)}%</td>
                      <td className="py-3 text-right font-black text-[#ffffff] tabular-nums">{f.final_risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTable === 'alerts' && (
          alerts.length === 0 ? (
            <div className="py-16 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto mb-3">
                <Table className="w-5 h-5 text-[#555555]" />
              </div>
              <p className="text-sm font-bold text-[#ffffff]">No archived records</p>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">Security alerts will appear after threshold violations occur.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[#888888] text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Alert Title</th>
                    <th className="pb-3 text-right">Score</th>
                    <th className="pb-3">Acknowledged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {alerts.map((a) => (
                    <tr key={a.id} className="hover:bg-[#141414] transition-colors">
                      <td className="py-3 text-[#888888] tabular-nums whitespace-nowrap font-medium">
                        {new Date(a.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="py-3 font-bold">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a.severity === 'CRITICAL' ? 'text-[#ff334b] bg-[#2a0e14] border border-[#ff334b]/30' : 'text-[#ff9900] bg-[#261706] border border-[#ff9900]/30'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-3 text-[#ffffff] font-semibold">{a.title}</td>
                      <td className="py-3 text-right font-black text-[#ffffff] tabular-nums">{a.risk_score}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.acknowledged ? 'text-[#00e575] bg-[#0c2415] border border-[#00e575]/30' : 'text-[#ff9900] bg-[#261706] border border-[#ff9900]/30'}`}>
                          {a.acknowledged ? 'YES' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Confirmation Modal for Reset Database */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2.5 text-[#ff334b]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Reset Local SQLite Database?
              </h3>
            </div>
            <p className="text-xs text-[#888888] leading-relaxed">
              This action will truncate the <code className="text-[#00d2ff] bg-[#141414] px-1 py-0.5 rounded font-mono">audit_events</code>, <code className="text-[#00d2ff] bg-[#141414] px-1 py-0.5 rounded font-mono">feature_vectors</code>, and <code className="text-[#00d2ff] bg-[#141414] px-1 py-0.5 rounded font-mono">alerts</code> tables.
              Only project database records and sandbox files are affected. Host files remain untouched.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] text-[#ffffff] rounded-full font-bold border border-[#262626] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDatabase();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 bg-[#ff334b] hover:bg-[#ff4d63] text-white rounded-full font-extrabold transition-colors shadow-lg shadow-[#ff334b]/20"
              >
                Confirm Truncate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
