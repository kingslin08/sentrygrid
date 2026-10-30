import React, { useState } from 'react';
import { SentryGridProvider } from './context/SentryGridContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { BackendOfflineBanner } from './components/common/BackendOfflineBanner';
import { OverviewView } from './components/dashboard/OverviewView';
import { MachinesView } from './components/machines/MachinesView';
import { SensorAnalyticsView } from './components/analytics/SensorAnalyticsView';
import { ThreatCenterView } from './components/threats/ThreatCenterView';
import { ExplainableAiView } from './components/explain/ExplainableAiView';
import { ScenarioControlView } from './components/simulator/ScenarioControlView';
import { AlertInvestigationView } from './components/alerts/AlertInvestigationView';
import { ModelEvaluationView } from './components/evaluation/ModelEvaluationView';
import { SystemInfoView } from './components/system/SystemInfoView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import type { ActiveTab } from './types/sentrygrid';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewView onNavigate={setCurrentTab} />;
      case 'machines':
        return (
          <MachinesView
            onNavigateToSimulator={() => setCurrentTab('simulator')}
            onNavigateToExplain={() => setCurrentTab('explainable-ai')}
          />
        );
      case 'analytics':
        return <SensorAnalyticsView />;
      case 'threats':
        return <ThreatCenterView />;
      case 'explainable-ai':
        return <ExplainableAiView />;
      case 'simulator':
        return <ScenarioControlView />;
      case 'alerts':
        return <AlertInvestigationView />;
      case 'evaluation':
        return <ModelEvaluationView />;
      case 'system':
        return <SystemInfoView />;
      default:
        return <OverviewView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070c16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

      {/* Backend Offline Warning Banner */}
      <BackendOfflineBanner />

      {/* Main Body with Sidebar + View */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            {renderActiveView()}
          </ErrorBoundary>

          {/* Professional Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
            <div>
              <span className="text-slate-400 font-bold">SENTRYGRID</span> · AI-Powered Industrial IoT Cybersecurity & Fault Detection
            </div>
            <div className="flex items-center gap-4">
              <span>FastAPI</span>
              <span>·</span>
              <span>Scikit-Learn (SHAP)</span>
              <span>·</span>
              <span>React 19 + Vite</span>
              <span>·</span>
              <span>Simulation Mode</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Animated Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SentryGridProvider>
      <MainContent />
    </SentryGridProvider>
  );
}
