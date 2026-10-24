import React from 'react';
import {
  Activity,
  Terminal,
  Cpu,
  Clock,
  BarChart3,
  Archive,
  Sliders,
  Shield,
  FolderLock,
  Sun,
  Moon
} from 'lucide-react';

export type NavTab = 
  | 'overview'
  | 'behaviour-lab'
  | 'live-monitoring'
  | 'detection-engine'
  | 'investigation-timeline'
  | 'model-evaluation'
  | 'event-archive'
  | 'lab-configuration';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMonitoring: boolean;
  activeScenario: string | null;
  backendOnline: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMonitoring,
  activeScenario,
  backendOnline,
  theme,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Activity & Dispatch', icon: Shield, code: '01' },
    { id: 'behaviour-lab' as NavTab, label: 'Threat Rides', icon: Terminal, code: '02' },
    { id: 'live-monitoring' as NavTab, label: 'Live Radar', icon: Activity, code: '03' },
    { id: 'detection-engine' as NavTab, label: 'Risk Fare Engine', icon: Cpu, code: '04' },
    { id: 'investigation-timeline' as NavTab, label: 'Incident Logs', icon: Clock, code: '05' },
    { id: 'model-evaluation' as NavTab, label: 'Model Analytics', icon: BarChart3, code: '06' },
    { id: 'event-archive' as NavTab, label: 'Trip Archive', icon: Archive, code: '07' },
    { id: 'lab-configuration' as NavTab, label: 'Lab Dispatcher', icon: Sliders, code: '08' },
  ];

  return (
    <aside className="w-64 bg-[#000000] border-r border-[#1e1e1e] flex flex-col justify-between shrink-0 select-none z-20">
      {/* Brand & Wordmark */}
      <div>
        <div className="h-16 px-5 border-b border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Geometric Shield / Dispatch Logo */}
            <div className="w-8 h-8 rounded-lg bg-[#ffffff] text-[#000000] flex items-center justify-center font-black tracking-tighter text-sm shadow-md">
              SX
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-[#ffffff] flex items-center gap-1.5">
                <span>SENTINEL-X</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#181818] text-[#00d2ff] font-bold border border-[#2b2b2b]">
                  LAB
                </span>
              </div>
              <div className="text-[10px] text-[#777777] font-medium tracking-tight">
                AI Ransomware Analysis
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Stations */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#555555] uppercase tracking-wider">
            STATIONS &amp; LOGS
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[#181818] text-[#ffffff] font-bold shadow-sm border border-[#2b2b2b]'
                    : 'text-[#8e8e8e] hover:text-[#ffffff] hover:bg-[#111111]'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive ? 'bg-[#ffffff] text-[#000000]' : 'text-[#888888] group-hover:text-[#ffffff]'}`}>
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <span className="flex-1 truncate text-xs tracking-tight">{item.label}</span>
                <span className={`text-[10px] font-mono tabular-nums ${isActive ? 'text-[#00d2ff] font-semibold' : 'text-[#444444]'}`}>
                  {item.code}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lab Dispatch Status Footer */}
      <div className="p-4 border-t border-[#1a1a1a] bg-[#070707] text-[11px] space-y-2.5">
        <div className="flex items-center justify-between text-[#888888]">
          <span className="flex items-center gap-1.5 font-medium">
            <FolderLock className="w-3.5 h-3.5 text-[#00d2ff]" />
            Confinement:
          </span>
          <span className="text-[#ffffff] font-mono text-[10px] bg-[#141414] px-1.5 py-0.5 rounded border border-[#242424]">
            ./sandbox_data
          </span>
        </div>

        <div className="flex items-center justify-between text-[#888888]">
          <span className="font-medium">Threat Radar:</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-[#00e575] animate-radar-pulse' : 'bg-[#666666]'}`}></span>
            <span className={`text-[10px] font-bold ${isMonitoring ? 'text-[#00e575]' : 'text-[#777777]'}`}>
              {isMonitoring ? (activeScenario ? 'EN ROUTE' : 'ACTIVE') : 'STANDBY'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[#888888]">
          <span className="font-medium">Daemon Status:</span>
          <span className={`text-[10px] font-bold ${backendOnline ? 'text-[#00e575]' : 'text-[#00d2ff]'}`}>
            {backendOnline ? 'PORT 8000 LIVE' : 'CLIENT ENGINE'}
          </span>
        </div>

        {/* Quick Theme Switcher Pill in Sidebar */}
        {onToggleTheme && (
          <div className="pt-2 border-t border-[#181818] flex items-center justify-between">
            <span className="text-[#777777] font-medium text-[10px]">Theme Mode:</span>
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] text-[10px] font-bold text-[#ffffff] transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-3 h-3 text-[#ff9900]" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-[#00d2ff]" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="pt-1 text-[10px] text-[#555555] flex justify-between items-center font-medium">
          <span>SENTINEL-X DISPATCH</span>
          <span className="font-mono">v1.2-PROD</span>
        </div>
      </div>
    </aside>
  );
};
