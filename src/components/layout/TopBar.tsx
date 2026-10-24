import React, { useState, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  Play,
  Square,
  Search,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopBarProps {
  currentTab: NavTab;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  activeAlertsCount: number;
  onOpenAlerts: () => void;
  backendOnline: boolean;
  onCheckBackend: () => void;
  isCheckingBackend: boolean;
  lastEventTimestamp: string | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGlobalSearch?: (term: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  isMonitoring,
  onToggleMonitoring,
  activeAlertsCount,
  onOpenAlerts,
  backendOnline,
  onCheckBackend,
  isCheckingBackend,
  lastEventTimestamp,
  theme,
  onToggleTheme,
  onGlobalSearch,
}) => {
  const [clockStr, setClockStr] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClockStr(now.toISOString().replace('T', ' ').substring(11, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onGlobalSearch) {
      onGlobalSearch(val);
    }
  };

  return (
    <header className="h-14 bg-[#000000] border-b border-[#1e1e1e] px-5 flex items-center justify-between gap-4 shrink-0 select-none text-xs transition-colors">
      {/* Zone 1: Current Dispatch Station */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-radar-pulse"></div>
          <span className="text-[11px] text-[#ffffff] uppercase tracking-wider font-extrabold">
            CYBER LAB DISPATCH
          </span>
          <span className="text-[#333333]">&bull;</span>
          <span className="text-[#888888] font-medium text-xs truncate">
            {backendOnline ? 'VirtualBox Daemon (Port 8000)' : 'Client Confinement Engine'}
          </span>
        </div>
      </div>

      {/* Zone 2: Uber-Style "Where to inspect?" Search & Clock */}
      <div className="hidden md:flex items-center gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Where to inspect? (Search target file, hash, or event ID)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-80 pl-9 pr-4 py-1.5 bg-[#121212] hover:bg-[#181818] border border-[#282828] focus:border-[#ffffff] rounded-full text-xs text-[#ffffff] placeholder-[#666666] focus:outline-none transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-[11px] tabular-nums font-mono">
          <span className="text-[#777777]">Last Trace:</span>
          <span className={lastEventTimestamp ? 'text-[#00d2ff] font-semibold' : 'text-[#555555]'}>
            {lastEventTimestamp ? new Date(lastEventTimestamp).toLocaleTimeString() : 'Awaiting activity'}
          </span>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-[11px] tabular-nums text-[#888888] font-mono">
          {clockStr}
        </div>
      </div>

      {/* Zone 3: Theme Toggle, Connection Status & Alerts Pill */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Uber Theme Toggle Switch */}
        <button
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#121212] hover:bg-[#1e1e1e] text-[#ffffff] border border-[#2a2a2a] transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>Light Mode</span>
            </>
          )}
        </button>

        {/* Backend Ping */}
        <button
          onClick={onCheckBackend}
          title="Verify Python Daemon on localhost:8000"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#121212] hover:bg-[#1e1e1e] text-[#cccccc] hover:text-[#ffffff] border border-[#2a2a2a] transition-all cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-3 h-3 ${isCheckingBackend ? 'animate-spin text-[#00d2ff]' : 'text-[#888888]'}`} />
          <span className={backendOnline ? 'text-[#00e575]' : 'text-[#aaaaaa]'}>
            {backendOnline ? 'Daemon Online' : 'Check Daemon'}
          </span>
        </button>

        {/* Observer toggle */}
        <button
          onClick={onToggleMonitoring}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            isMonitoring
              ? 'bg-[#ffffff] text-[#000000] hover:bg-[#e0e0e0] shadow-sm'
              : 'bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a] hover:bg-[#222222]'
          }`}
        >
          {isMonitoring ? (
            <Square className="w-2.5 h-2.5 text-[#000000] fill-[#000000]" />
          ) : (
            <Play className="w-2.5 h-2.5 text-[#888888]" />
          )}
          <span>{isMonitoring ? 'Radar Active' : 'Radar Paused'}</span>
        </button>

        {/* Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          className={`relative p-2 rounded-full border transition-all cursor-pointer ${
            activeAlertsCount > 0
              ? 'bg-[#ff334b]/20 border-[#ff334b]/50 text-[#ff334b] hover:bg-[#ff334b]/30'
              : 'bg-[#121212] border-[#2a2a2a] hover:bg-[#1c1c1c] text-[#888888]'
          }`}
          title="View Incidents Queue"
        >
          <Bell className="w-3.5 h-3.5" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#ff334b] text-[#ffffff] text-[9px] font-extrabold rounded-full">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
