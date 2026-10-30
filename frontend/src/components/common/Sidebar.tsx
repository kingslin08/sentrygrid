import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  LineChart,
  ShieldAlert,
  BrainCircuit,
  Zap,
  Bell,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';
import type { ActiveTab } from '../../types/sentrygrid';

interface SidebarProps {
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  mobileNavOpen,
  setMobileNavOpen,
}) => {
  const { machines, alerts } = useSentryGrid();

  const activeAlertCount = alerts.filter((a) => !a.resolved_ts).length;
  const attackCount = machines.filter((m) => m.state === 'ATTACK').length;
  const faultCount = machines.filter((m) => m.state === 'FAULT').length;

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'SOC Command Center',
      sublabel: 'Plant-wide overview',
      icon: LayoutDashboard,
    },
    {
      id: 'machines' as ActiveTab,
      label: 'Machine Telemetry',
      sublabel: 'Pump, Motor, Valve status',
      icon: Cpu,
      badge: attackCount + faultCount > 0 ? `${attackCount + faultCount} alert` : undefined,
      badgeColor: attackCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Sensor Analytics',
      sublabel: 'Time-series waveform charts',
      icon: LineChart,
    },
    {
      id: 'threats' as ActiveTab,
      label: 'Cyber & Fault Center',
      sublabel: 'Cross-layer threat analysis',
      icon: ShieldAlert,
    },
    {
      id: 'explainable-ai' as ActiveTab,
      label: 'Explainable AI (XAI)',
      sublabel: 'SHAP & feature attribution',
      icon: BrainCircuit,
      pill: 'CORE',
    },
    {
      id: 'simulator' as ActiveTab,
      label: 'Scenario Testbed',
      sublabel: 'Fault & attack injector',
      icon: Zap,
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Alert Forensics',
      sublabel: 'Incident audit trail',
      icon: Bell,
      badge: activeAlertCount > 0 ? `${activeAlertCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
    },
    {
      id: 'evaluation' as ActiveTab,
      label: 'Model Analytics',
      sublabel: 'Confusion matrix & metrics',
      icon: BarChart3,
    },
    {
      id: 'system' as ActiveTab,
      label: 'System Architecture',
      sublabel: 'Digital twin & data flow',
      icon: Layers,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setCurrentTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-30 h-screen lg:h-[calc(100vh-61px)] w-72 bg-[#09111e] border-r border-cyan-500/15 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Machine Fleet Quick Status Indicator */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Simulated Fleet</span>
              <span className="text-cyan-400 font-mono">3 Assets</span>
            </div>
            <div className="space-y-1.5">
              {machines.map((m) => {
                const isAttack = m.state === 'ATTACK';
                const isFault = m.state === 'FAULT';
                const isWarmup = m.state === 'WARMUP';

                return (
                  <div
                    key={m.machine_id}
                    className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAttack
                            ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping'
                            : isFault
                            ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                            : isWarmup
                            ? 'bg-sky-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-medium text-slate-200">{m.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border font-mono ${
                        isAttack
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : isFault
                          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                          : isWarmup
                          ? 'bg-sky-950/80 border-sky-500/40 text-sky-300'
                          : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {m.state}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-1">
              Command Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.sublabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.pill && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {item.pill}
                      </span>
                    )}
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Gateway Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>FastAPI IoT Core</span>
            </span>
            <span className="text-slate-500">:8001</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Stage 1: IsoForest · Stage 2: RandForest
          </div>
        </div>
      </aside>
    </>
  );
};
