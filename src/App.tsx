/**
 * SENTINEL-X: AI Ransomware Behaviour Analysis & Detection Lab
 * Root Application Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { BehaviourLabView } from './components/views/BehaviourLabView';
import { LiveMonitoringView } from './components/views/LiveMonitoringView';
import { DetectionEngineView } from './components/views/DetectionEngineView';
import { InvestigationTimelineView } from './components/views/InvestigationTimelineView';
import { ModelEvaluationView } from './components/views/ModelEvaluationView';
import { EventArchiveView } from './components/views/EventArchiveView';
import { LabConfigurationView } from './components/views/LabConfigurationView';
import { AlertsDrawer } from './components/modals/AlertsDrawer';
import { EventDetailModal } from './components/modals/EventDetailModal';

import { sandboxEngine } from './services/sandboxEngine';
import { apiClient } from './services/apiClient';
import {
  AuditEvent,
  FeatureVector,
  AlertItem,
  SandboxFile,
  RiskAnalysisSummary,
  ScenarioType
} from './types/sentinel';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [features, setFeatures] = useState<FeatureVector[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [sandboxFiles, setSandboxFiles] = useState<SandboxFile[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisSummary | null>(sandboxEngine.getLatestRiskAnalysis());
  
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<ScenarioType | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(false);
  
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  // Uber Theme Mode ('light' default per user request, toggleable)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sentinel_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sentinel_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Sync state from engine
  const refreshEngineState = useCallback(() => {
    setEvents(sandboxEngine.getEvents());
    setFeatures(sandboxEngine.getFeatures());
    setAlerts(sandboxEngine.getAlerts());
    setSandboxFiles(sandboxEngine.getSandboxFiles());
    setRiskAnalysis(sandboxEngine.getLatestRiskAnalysis());
    setActiveScenario(sandboxEngine.getActiveScenario());
  }, []);

  // Check Python backend daemon
  const checkBackendStatus = useCallback(async () => {
    setIsCheckingBackend(true);
    const res = await apiClient.checkHealth();
    setBackendOnline(res.online);
    setIsCheckingBackend(false);
  }, []);

  useEffect(() => {
    refreshEngineState();
    checkBackendStatus();

    // Subscribe to real-time simulation progress
    sandboxEngine.setProgressCallback(({ isRunning, currentScenario }) => {
      setActiveScenario(currentScenario);
      refreshEngineState();
    });

    // Periodic telemetry refresh
    const interval = setInterval(refreshEngineState, 1500);
    return () => clearInterval(interval);
  }, [refreshEngineState, checkBackendStatus]);

  // Handlers
  const handleToggleMonitoring = () => {
    if (isMonitoring && sandboxEngine.isSimulationActive()) {
      sandboxEngine.stopSimulation();
    }
    setIsMonitoring(!isMonitoring);
  };

  const handleStartSimulation = (scenario: ScenarioType, duration: number, limit: number) => {
    setIsMonitoring(true);
    sandboxEngine.startSimulation(scenario, duration, limit);
    refreshEngineState();
  };

  const handleStopSimulation = () => {
    sandboxEngine.stopSimulation();
    refreshEngineState();
  };

  const handleResetSandbox = () => {
    sandboxEngine.resetSandbox();
    refreshEngineState();
  };

  const handleResetDatabase = () => {
    sandboxEngine.resetSandbox();
    refreshEngineState();
  };

  const handleAcknowledgeAlert = (id: string) => {
    sandboxEngine.acknowledgeAlert(id);
    refreshEngineState();
  };

  const handleAcknowledgeAll = () => {
    sandboxEngine.acknowledgeAllAlerts();
    refreshEngineState();
  };

  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="flex h-screen bg-[#000000] text-[#f6f6f6] font-sans overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMonitoring={isMonitoring}
        activeScenario={activeScenario}
        backendOnline={backendOnline}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#000000]">
        {/* Compact Top Bar */}
        <TopBar
          currentTab={currentTab}
          isMonitoring={isMonitoring}
          onToggleMonitoring={handleToggleMonitoring}
          activeAlertsCount={activeAlertsCount}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          backendOnline={backendOnline}
          onCheckBackend={checkBackendStatus}
          isCheckingBackend={isCheckingBackend}
          lastEventTimestamp={events[0]?.timestamp || null}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onGlobalSearch={(term) => {
            if (term.trim() && currentTab !== 'investigation-timeline') {
              setCurrentTab('investigation-timeline');
            }
          }}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#000000]">
          <div className="max-w-[1500px] mx-auto">
            {currentTab === 'overview' && (
              <OverviewView
                events={events}
                alerts={alerts}
                riskAnalysis={riskAnalysis}
                isMonitoring={isMonitoring}
                activeScenario={activeScenario}
                backendOnline={backendOnline}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onNavigateToTab={setCurrentTab}
                onSelectEvent={setSelectedEvent}
              />
            )}

            {currentTab === 'behaviour-lab' && (
              <BehaviourLabView
                isRunning={sandboxEngine.isSimulationActive()}
                activeScenario={activeScenario}
                events={events}
                sandboxFiles={sandboxFiles}
                onStartSimulation={handleStartSimulation}
                onStopSimulation={handleStopSimulation}
                onResetSandbox={handleResetSandbox}
              />
            )}

            {currentTab === 'live-monitoring' && (
              <LiveMonitoringView
                events={events}
                features={features}
                isMonitoring={isMonitoring}
                onSelectEvent={setSelectedEvent}
              />
            )}

            {currentTab === 'detection-engine' && (
              <DetectionEngineView />
            )}

            {currentTab === 'investigation-timeline' && (
              <InvestigationTimelineView
                events={events}
                onSelectEvent={setSelectedEvent}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'model-evaluation' && (
              <ModelEvaluationView />
            )}

            {currentTab === 'event-archive' && (
              <EventArchiveView
                events={events}
                features={features}
                alerts={alerts}
                onResetDatabase={handleResetDatabase}
              />
            )}

            {currentTab === 'lab-configuration' && (
              <LabConfigurationView
                backendOnline={backendOnline}
                onRefreshBackend={checkBackendStatus}
              />
            )}
          </div>
        </main>
      </div>

      {/* Slide-over Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAll}
      />

      {/* Forensic Event Telemetry Inspector Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
