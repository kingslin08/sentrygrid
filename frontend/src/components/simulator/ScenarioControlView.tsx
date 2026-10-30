import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  ShieldAlert,
  Flame,
  Activity,
  Disc,
  Repeat,
  WifiOff,
  Play,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';
import { SCENARIO_DETAILS } from '../../constants/scenarios';
import { MACHINE_METADATA } from '../../constants/machines';

export const ScenarioControlView: React.FC = () => {
  const {
    machines,
    scenarios,
    injectScenario,
    clearScenario,
    selectedMachineId,
    setSelectedMachineId,
  } = useSentryGrid();

  const [selectedKind, setSelectedKind] = useState<string>('attack_spoofing');
  const [magnitude, setMagnitude] = useState<number>(1.0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];
  const activeDetail = SCENARIO_DETAILS[selectedKind];
  const isTargetAbnormal = activeMachine?.state === 'FAULT' || activeMachine?.state === 'ATTACK';

  const handleInject = async () => {
    if (!selectedMachineId || !selectedKind) return;
    setIsSubmitting(true);
    await injectScenario(selectedMachineId, selectedKind, magnitude);
    setIsSubmitting(false);
  };

  const handleClear = async () => {
    if (!selectedMachineId) return;
    setIsSubmitting(true);
    await clearScenario(selectedMachineId);
    setIsSubmitting(false);
  };

  const getScenarioIcon = (kind: string) => {
    switch (kind) {
      case 'fault_overheating':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'fault_imbalance':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'fault_bearing':
        return <Disc className="w-5 h-5 text-yellow-400" />;
      case 'attack_spoofing':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'attack_replay':
        return <Repeat className="w-5 h-5 text-pink-400" />;
      case 'attack_dos':
        return <WifiOff className="w-5 h-5 text-purple-400" />;
      default:
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  // Group scenarios into Faults and Attacks
  const faultScenarios = scenarios.filter((s) => s.kind.startsWith('fault'));
  const attackScenarios = scenarios.filter((s) => s.kind.startsWith('attack'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0e1728]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Interactive Testbed
              </span>
              <span className="text-xs text-slate-400 font-mono">Simulated Fault & Attack Injection</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>Scenario Simulation & Stress Testing Console</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Inject synthetic operational faults or cyberattacks directly into the plant simulator to test detection latency, cross-layer physics residual decoupling, and Explainable AI.
            </p>
          </div>

          {/* Quick Active Machine Status Pill */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-mono">Current Target Status</div>
              <div className="text-white font-bold">{activeMachine?.name}</div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                activeMachine?.state === 'ATTACK'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : activeMachine?.state === 'FAULT'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {activeMachine?.state || 'NORMAL'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Target Machine */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                1
              </span>
              <span>Select Target Machine</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {machines.map((m) => {
                const meta = MACHINE_METADATA[m.machine_id];
                const isSelected = selectedMachineId === m.machine_id;

                return (
                  <button
                    key={m.machine_id}
                    onClick={() => setSelectedMachineId(m.machine_id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                        {m.machine_id}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.state === 'ATTACK'
                            ? 'bg-rose-500 animate-ping'
                            : m.state === 'FAULT'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                    <div className="text-sm font-bold text-white">{m.name}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {meta?.type || 'Machine'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Scenario */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                2
              </span>
              <span>Choose Incident Scenario to Inject</span>
            </label>

            {/* Cyberattacks */}
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cyberattack Scenarios (Wire Layer Manipulations)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {attackScenarios.map((sc) => {
                  const isSelected = selectedKind === sc.kind;
                  const detail = SCENARIO_DETAILS[sc.kind];

                  return (
                    <button
                      key={sc.kind}
                      onClick={() => setSelectedKind(sc.kind)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getScenarioIcon(sc.kind)}
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase font-mono">
                          ATTACK
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{sc.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                        {detail?.description || sc.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment Faults */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5 font-mono">
                <Flame className="w-3.5 h-3.5" />
                <span>Physical Equipment Faults (Mechanical & Thermodynamic)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {faultScenarios.map((sc) => {
                  const isSelected = selectedKind === sc.kind;
                  const detail = SCENARIO_DETAILS[sc.kind];

                  return (
                    <button
                      key={sc.kind}
                      onClick={() => setSelectedKind(sc.kind)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getScenarioIcon(sc.kind)}
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-mono">
                          FAULT
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{sc.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                        {detail?.description || sc.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Magnitude & Action Buttons */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                3
              </span>
              <span>Configure Magnitude & Execute</span>
            </label>

            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-mono">
                <span>Anomaly Intensity:</span>
                <span className="font-bold text-cyan-400 text-sm">{magnitude.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.5x (Subtle Drifting)</span>
                <span>1.0x (Standard Stress)</span>
                <span>2.0x (Severe Catastrophic)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleInject}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>INJECT TEST SCENARIO</span>
              </button>

              <button
                onClick={handleClear}
                disabled={isSubmitting || !isTargetAbnormal}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors active:scale-95 disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET / CLEAR SCENARIO</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scenario Forensics Preview & Judge Pitch Guide */}
        <div className="space-y-6">
          {/* Scenario Details Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c182c]/90 to-[#07111e]/90 border border-cyan-500/20 backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2">
              Scenario Forensics
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-white font-display mb-2">
              {getScenarioIcon(selectedKind)}
              <span>{activeDetail?.name || selectedKind}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-slate-300 text-[11px] block mb-1">
                  Physical Mechanism
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {activeDetail?.mechanism}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-slate-300 text-[11px] block mb-1">
                  Feature Signature
                </span>
                <p className="text-cyan-300/90 text-[11px] font-mono leading-relaxed">
                  {activeDetail?.signature}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-slate-300 text-[11px] block mb-1">
                  Recommended Mitigation
                </span>
                <p className="text-emerald-300/90 text-[11px] leading-relaxed">
                  {activeDetail?.mitigation}
                </p>
              </div>
            </div>
          </div>

          {/* Hackathon Stage Presentation Cheat-Sheet */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <Play className="w-3.5 h-3.5" />
              <span>Live Hackathon Demo Script</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
              Follow these exact steps during your presentation to impress the judges:
            </p>
            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-sans">
              <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <strong className="text-white">Inject Sensor Spoofing</strong> on Valve 03 (magnitude 1.2x).
              </li>
              <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
                Show that <strong className="text-white">temperature spikes</strong>, but motor current is unchanged.
              </li>
              <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
                Open <strong className="text-cyan-300">Explainable AI</strong> tab to prove thermodynamic residual decoupled!
              </li>
              <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
                Click <strong className="text-emerald-400">Clear Scenario</strong> to demonstrate automatic alert resolution.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
