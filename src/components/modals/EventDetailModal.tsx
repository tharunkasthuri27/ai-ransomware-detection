import React from 'react';
import {
  X,
  Shield,
  Activity,
  Layers,
  Clock,
  FolderLock
} from 'lucide-react';
import { AuditEvent, RiskLevel } from '../../types/sentinel';

interface EventDetailModalProps {
  event: AuditEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
}) => {
  if (!event) return null;

  const getRiskBadge = (level: RiskLevel) => {
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

  const isCritical = event.risk_level === 'CRITICAL';
  const baseOrigin = event.old_path || (event.event_type === 'RENAME'
    ? event.filename.replace(/\.(locked|crypto|enc)$/i, '')
    : event.filename);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c0c0c] border border-[#2b2b2b] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
        {/* Receipt Header */}
        <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[#ffffff]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#777777] font-bold tracking-wider uppercase">
                SENTINEL-X DISPATCH
              </div>
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Trip Receipt &amp; Forensic Breakdown
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#888888] hover:text-[#ffffff] hover:bg-[#1f1f1f] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Fare / Risk Banner */}
        <div className="p-4 bg-[#141414] border border-[#262626] rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#777777] font-bold uppercase tracking-wider">
              Total Threat Fare
            </div>
            <div className="text-3xl font-black text-[#ffffff] tabular-nums mt-0.5">
              {event.risk_score} <span className="text-xs font-normal text-[#888888]">/ 100</span>
            </div>
            <div className="text-[11px] text-[#888888] font-mono mt-0.5">
              Trip ID: #{event.id}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskBadge(event.risk_level)}`}>
              {event.risk_level}
            </span>
            <div className="text-[10px] text-[#777777] mt-1.5">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Uber-Style Route Section */}
        <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] space-y-2">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-2">
            Observed Filesystem Route
          </div>

          {/* Origin */}
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] shrink-0 mt-1" />
            <div>
              <div className="text-[10px] text-[#777777] font-bold uppercase">Pickup Point (Origin)</div>
              <div className="text-xs font-bold text-[#ffffff] font-mono">
                ./sandbox_data/{baseOrigin}
              </div>
            </div>
          </div>

          {/* Connecting Line */}
          <div className="ml-1 pl-3.5 border-l-2 border-[#2b2b2b] py-1 text-[11px] text-[#888888] font-mono">
            Operation: <strong className="text-[#00d2ff]">{event.event_type}</strong> &bull; Cadence: {event.activity_rate.toFixed(1)} ops/s
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3">
            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 mt-1 ${isCritical ? 'bg-[#ff334b]' : 'bg-[#00d2ff]'}`} />
            <div>
              <div className="text-[10px] text-[#777777] font-bold uppercase">Destination Target</div>
              <div className="text-xs font-bold text-[#ffffff] font-mono break-all">
                {event.sandbox_path}
              </div>
            </div>
          </div>
        </div>

        {/* Fare Receipt Line Items */}
        <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] space-y-2">
          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            Fare Breakdown &amp; Heuristics
          </div>

          <div className="flex justify-between text-xs py-1 border-b border-[#1c1c1c]">
            <span className="text-[#888888]">Shannon Entropy Surge:</span>
            <span className="text-[#ffffff] font-mono font-bold">
              +{event.entropy_delta.toFixed(2)} {event.entropy_delta > 0.65 ? '(High Ciphertext Surge)' : '(Nominal)'}
            </span>
          </div>

          <div className="flex justify-between text-xs py-1 border-b border-[#1c1c1c]">
            <span className="text-[#888888]">Window Cadence (Velocity):</span>
            <span className="text-[#ffffff] font-mono font-bold">
              {event.activity_rate.toFixed(1)} ops/sec
            </span>
          </div>

          <div className="flex justify-between text-xs py-1 border-b border-[#1c1c1c]">
            <span className="text-[#888888]">Payload File Size:</span>
            <span className="text-[#ffffff] font-mono font-bold">
              {(event.file_size_bytes / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="flex justify-between text-xs py-1">
            <span className="text-[#888888]">Trip Provenance:</span>
            <span className="text-[#00d2ff] font-bold">
              {event.provenance === 'CONTROLLED_SIMULATOR' ? 'Controlled Simulator' : 'Live Filesystem Observer'}
            </span>
          </div>
        </div>

        {/* Technical Decision Reasoning */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
            Forensic Signature &amp; Evidence
          </span>
          <p className="text-xs text-[#cccccc] leading-relaxed">
            {event.detection_reason}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#666666]">
            Strict Confinement: ./sandbox_data
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
