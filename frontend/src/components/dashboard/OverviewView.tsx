import React from 'react';
import {
  Activity,
  Flame,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Zap,
  BrainCircuit,
  Bell,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';
import { KpiCard } from '../common/KpiCard';
import { MachineCard } from '../machines/MachineCard';
import type { ActiveTab } from '../../types/sentrygrid';

interface OverviewViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const {
    machines,
    alerts,
    selectedMachineId,
    setSelectedMachineId,
    lastUpdated,
    tickCount,
  } = useSentryGrid();

  const totalMachines = machines.length;
  const attackMachines = machines.filter((m) => m.state === 'ATTACK');
  const faultMachines = machines.filter((m) => m.state === 'FAULT');
  const healthyMachines = machines.filter((m) => m.state === 'NORMAL' || m.state === 'WARMUP');
  const activeAlerts = alerts.filter((a) => !a.resolved_ts);

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour12: false })
    : '--:--:--';

  const activeMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];

  return (
    <div className="space-y-6">
      {/* Hero SOC Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c182a]/95 via-[#0e1d35]/90 to-[#091322]/95 border border-cyan-500/25 p-6 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.08)]">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold font-mono uppercase tracking-wider">
                Industrial OT Security Operations Center
              </span>
              <span className="text-slate-500 font-mono text-xs">|</span>
              <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Updated: {formattedTime} (T+{tickCount})
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-display">
              Industrial Security Command Center
            </h1>

            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time cross-layer detection separating physical electro-mechanical faults from sensor spoofing, replay attacks, and denial-of-service intrusions.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Launch Scenario Injector</span>
            </button>

            <button
              onClick={() => onNavigate('explainable-ai')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all"
            >
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Explainable AI (XAI)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Key Performance Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Monitored Fleet"
          value={totalMachines}
          subtitle="Simulated Industrial Assets"
          icon={Cpu}
          variant="cyan"
          badge="3 Nodes"
        />

        <KpiCard
          title="Healthy Assets"
          value={healthyMachines.length}
          subtitle="Nominal Physics Residuals"
          icon={CheckCircle2}
          variant="emerald"
          badge={`${healthyMachines.length}/${totalMachines} Normal`}
        />

        <KpiCard
          title="Detected Faults"
          value={faultMachines.length}
          subtitle="Physical Equipment Failures"
          icon={Flame}
          variant={faultMachines.length > 0 ? 'amber' : 'slate'}
          badge={faultMachines.length > 0 ? 'Mechanical Alert' : '0 Alerts'}
        />

        <KpiCard
          title="Cyberattacks"
          value={attackMachines.length}
          subtitle="Network / Wire Tampering"
          icon={ShieldAlert}
          variant={attackMachines.length > 0 ? 'rose' : 'slate'}
          badge={attackMachines.length > 0 ? 'CRITICAL ATTACK' : 'Zero Threats'}
        />

        <KpiCard
          title="Active Alerts"
          value={activeAlerts.length}
          subtitle="Requiring SOC Response"
          icon={Bell}
          variant={activeAlerts.length > 0 ? 'rose' : 'slate'}
          badge={activeAlerts.length > 0 ? 'Pending' : 'Clear'}
        />
      </div>

      {/* Three Industrial Machine Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Simulated Machine Fleet Live Status</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pump 02, Motor 07, Valve 03 — Multi-parameter telemetry and real-time AI classification
            </p>
          </div>

          <button
            onClick={() => onNavigate('machines')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View Detailed Fleet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {machines.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse h-72 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-800 rounded w-28"></div>
                  <div className="h-4 bg-slate-800 rounded w-16"></div>
                </div>
                <div className="space-y-3 my-4">
                  <div className="h-3 bg-slate-800/60 rounded w-full"></div>
                  <div className="h-3 bg-slate-800/60 rounded w-4/5"></div>
                  <div className="h-3 bg-slate-800/60 rounded w-3/4"></div>
                </div>
                <div className="h-9 bg-slate-800/40 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {machines.map((machine) => (
              <MachineCard
                key={machine.machine_id}
                machine={machine}
                onSelect={() => {
                  setSelectedMachineId(machine.machine_id);
                  onNavigate('analytics');
                }}
                onInjectClick={() => {
                  setSelectedMachineId(machine.machine_id);
                  onNavigate('simulator');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live Threat Strip & Explainable AI Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Incidents & Threat Feed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Recent Threat & Incident Feed
                </h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Full Ledger ({alerts.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-300">All Industrial Assets Normal</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inject a test scenario from the Simulator to demonstrate detection.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 4).map((alert) => {
                  const isAttack = alert.state === 'ATTACK';
                  const isResolved = alert.resolved_ts !== null;

                  return (
                    <div
                      key={alert.id}
                      onClick={() => onNavigate('alerts')}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                        isAttack && !isResolved
                          ? 'bg-rose-950/25 border-rose-500/40 hover:border-rose-500'
                          : !isResolved
                          ? 'bg-amber-950/25 border-amber-500/40 hover:border-amber-500'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`p-1.5 rounded-lg border shrink-0 ${
                            isAttack
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          }`}
                        >
                          {isAttack ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {alert.kind.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {alert.machine_id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {alert.text}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase border ${
                            isResolved
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                          }`}
                        >
                          {isResolved ? 'Resolved' : 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>FastAPI debouncer: 3 ticks raise / 6 ticks clear</span>
            <span className="text-cyan-400 font-mono">SQLite Persistent Log</span>
          </div>
        </div>

        {/* Right: Explainable AI Spotlight */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c182c]/90 to-[#07111e]/90 border border-cyan-500/20 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Explainable AI Operational Spotlight
                </h3>
              </div>
              <button
                onClick={() => onNavigate('explainable-ai')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Deep Dive</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeMachine ? (
              <>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-mono">Active Target Asset:</span>
                    <span className="font-bold text-white font-mono">{activeMachine.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">AI Classification:</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] uppercase border ${
                        activeMachine.state === 'ATTACK'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : activeMachine.state === 'FAULT'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {activeMachine.label}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Model Explanation Statement</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                    "{activeMachine.text || 'All signals are moving together within the learnt baseline.'}"
                  </p>
                </div>

                {/* Quick Evidence Chips */}
                {activeMachine.evidence && activeMachine.evidence.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5">
                      Top Contributing Features (SHAP / Residuals)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {activeMachine.evidence.slice(0, 2).map((ev, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px]"
                        >
                          <div className="font-bold text-slate-200 truncate">{ev.label}</div>
                          <div className="text-cyan-400 font-mono text-[10px]">
                            {ev.z > 0 ? `+${ev.z.toFixed(1)}σ` : `${ev.z.toFixed(1)}σ`} · Impact:{' '}
                            {(ev.impact || 0).toFixed(3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
                <BrainCircuit className="w-8 h-8 text-cyan-500/40 mx-auto mb-2 animate-pulse" />
                <div className="text-xs font-semibold text-slate-300">Awaiting Asset Telemetry</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Connecting to SentryGrid telemetry pipeline...
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Model: Random Forest (7-Class)</span>
            <span className="text-cyan-400 font-mono">
              Confidence: {activeMachine ? `${((activeMachine.confidence || 0) * 100).toFixed(0)}%` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
