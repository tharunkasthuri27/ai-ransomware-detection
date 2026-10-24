import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Check,
  CheckCheck
} from 'lucide-react';
import { AlertItem, RiskLevel } from '../../types/sentinel';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAll,
}) => {
  if (!isOpen) return null;

  const unackAlerts = alerts.filter(a => !a.acknowledged);

  const getSeverityStyle = (sev: RiskLevel) => {
    switch (sev) {
      case 'CRITICAL': return 'text-[#ff334b] bg-[#251515] border-[#ff334b]/40';
      case 'SUSPICIOUS': return 'text-[#ff9900] bg-[#21180f] border-[#ff9900]/40';
      case 'WATCH': return 'text-[#ffcc00] bg-[#1e1c12] border-[#ffcc00]/30';
      default: return 'text-[#00e575] bg-[#112417] border-[#00e575]/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#000000] border-l border-[#1e1e1e] h-full flex flex-col justify-between shadow-2xl text-xs">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-[#ff334b]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#777777] font-bold uppercase tracking-wider">
                DISPATCH NOTIFICATIONS
              </div>
              <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Incident Queue ({alerts.length})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#888888] hover:text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action strip */}
        <div className="px-4 py-2.5 bg-[#0a0a0a] border-b border-[#1c1c1c] flex items-center justify-between text-xs">
          <span className="text-[#888888] font-medium">
            {unackAlerts.length} Unacknowledged Incidents
          </span>
          {unackAlerts.length > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="py-20 text-center text-[#888888]">
              <div className="w-12 h-12 rounded-full bg-[#121212] border border-[#242424] flex items-center justify-center mx-auto mb-3 text-[#00e575]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-[#ffffff] font-bold text-sm">Zero threat alerts recorded</p>
              <p className="text-xs text-[#777777] mt-1 max-w-xs mx-auto">
                Alerts dispatch automatically when simulation operations violate behavioral thresholds.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border text-xs transition-all shadow-sm ${
                  alert.acknowledged
                    ? 'bg-[#0d0d0d] border-[#1e1e1e] text-[#777777]'
                    : getSeverityStyle(alert.severity)
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    {alert.severity} &bull; Threat Fare {alert.risk_score}/100
                  </span>
                  <span className="text-[10px] text-[#777777]">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-extrabold text-[#ffffff] text-xs mb-1">
                  {alert.title}
                </div>

                <p className="text-xs text-[#cccccc] leading-relaxed mb-2.5">
                  {alert.message}
                </p>

                {alert.features_triggered && alert.features_triggered.length > 0 && (
                  <div className="mb-2.5 space-y-1">
                    <div className="text-[9px] text-[#888888] uppercase tracking-wider font-bold">Heuristic Surge Flags:</div>
                    {alert.features_triggered.map((rule, idx) => (
                      <div key={idx} className="text-[10px] text-[#ff9900] pl-2 border-l-2 border-[#ff9900]/60">
                        {rule}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-[#222222] text-[11px]">
                  <span className="text-[#777777]">
                    Profile: {alert.scenario_id}
                  </span>
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full transition-all flex items-center gap-1 font-bold text-xs cursor-pointer shadow-sm"
                    >
                      <Check className="w-3 h-3 text-[#000000]" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[#00e575] font-bold">ACKNOWLEDGED</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c1c1c] bg-[#070707] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a1a1a] hover:bg-[#262626] text-[#cccccc] text-xs font-semibold rounded-full transition-all cursor-pointer"
          >
            Close Queue
          </button>
        </div>
      </div>
    </div>
  );
};
