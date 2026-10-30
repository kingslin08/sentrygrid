import React from 'react';
import {
  Cpu,
  Flame,
  Activity,
  Zap,
  Radio,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';
import { MACHINE_METADATA } from '../../constants/machines';
import { MachineCard } from './MachineCard';

interface MachinesViewProps {
  onNavigateToSimulator?: () => void;
  onNavigateToExplain?: () => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  onNavigateToSimulator,
  onNavigateToExplain,
}) => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    clearScenario,
  } = useSentryGrid();

  const activeMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];
  const meta = MACHINE_METADATA[selectedMachineId] || {
    id: selectedMachineId,
    name: selectedMachineId,
    type: 'Asset',
    location: 'Sector',
    rated_temp: 60,
    rated_vib: 1.0,
    rated_cur: 5.0,
    period: 90,
    phase: 0,
    description: '',
  };

  const reading = activeMachine?.reading || {
    tick: 0,
    t: 0,
    temp: 0,
    vib_rms: 0,
    current: 0,
    interval_ms: 1000,
    pkt_rate: 1.0,
    loss: 0,
    ts_skew_ms: 0,
    phys_temp: 0,
  };

  const isAttack = activeMachine?.state === 'ATTACK';
  const isFault = activeMachine?.state === 'FAULT';
  const isAbnormal = isAttack || isFault;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0e1728]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Asset Telemetry
              </span>
              <span className="text-xs text-slate-400 font-mono">Simulated Industrial OT Fleet</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <span>Industrial Machine Fleet Monitoring</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Continuous monitoring of Pump 02, Motor 07, and Valve 03 digital twins with real-time operational thresholds.
            </p>
          </div>

          {/* Machine Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            {machines.map((m) => (
              <button
                key={m.machine_id}
                onClick={() => setSelectedMachineId(m.machine_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMachineId === m.machine_id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Machine Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {machines.map((m) => (
          <MachineCard
            key={m.machine_id}
            machine={m}
            onSelect={() => setSelectedMachineId(m.machine_id)}
            onInjectClick={() => {
              setSelectedMachineId(m.machine_id);
              onNavigateToSimulator?.();
            }}
          />
        ))}
      </div>

      {/* Selected Asset Deep Telemetry Dossier */}
      {activeMachine && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.06)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
                <span>Asset Telemetry Dossier:</span>
                <span className="text-white font-bold">{meta.id}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{meta.location}</span>
              </div>
              <h3 className="text-xl font-bold text-white font-display mt-1">
                {activeMachine.name} — {meta.type}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{meta.description}</p>
            </div>

            <div className="flex items-center gap-3">
              {isAbnormal ? (
                <button
                  onClick={() => clearScenario(activeMachine.machine_id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Anomaly On {activeMachine.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateToSimulator?.()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Open Anomaly Injector</span>
                </button>
              )}
            </div>
          </div>

          {/* Telemetry Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Temp vs Rated */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Sensed Temperature</span>
                </span>
                <span className="font-mono text-[10px]">Max {meta.rated_temp}°C</span>
              </div>
              <div className="text-3xl font-black font-mono-numbers text-white">
                {reading.temp.toFixed(1)} <span className="text-sm font-normal text-slate-400">°C</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
                <span>Physical: {reading.phys_temp ? reading.phys_temp.toFixed(1) : reading.temp.toFixed(1)}°C</span>
                <span className={reading.temp > meta.rated_temp ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {((reading.temp / meta.rated_temp) * 100).toFixed(0)}% Load
                </span>
              </div>
            </div>

            {/* 2. Vibration RMS */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Vibration RMS</span>
                </span>
                <span className="font-mono text-[10px]">Rated {meta.rated_vib.toFixed(1)}</span>
              </div>
              <div className="text-3xl font-black font-mono-numbers text-white">
                {reading.vib_rms.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
                <span>256Hz Sampling</span>
                <span className={reading.vib_rms > meta.rated_vib ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {((reading.vib_rms / meta.rated_vib) * 100).toFixed(0)}% Rated
                </span>
              </div>
            </div>

            {/* 3. Motor Current */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Drive Current</span>
                </span>
                <span className="font-mono text-[10px]">Rated {meta.rated_cur.toFixed(1)}A</span>
              </div>
              <div className="text-3xl font-black font-mono-numbers text-white">
                {reading.current.toFixed(2)} <span className="text-sm font-normal text-slate-400">A</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
                <span>Duty Cycle Coupling</span>
                <span className={reading.current > meta.rated_cur ? 'text-rose-400 font-bold' : 'text-blue-400'}>
                  {((reading.current / meta.rated_cur) * 100).toFixed(0)}% Rated
                </span>
              </div>
            </div>

            {/* 4. Network Packet Timing */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Packet Timing</span>
                </span>
                <span className="font-mono text-[10px]">Normal ~1000ms</span>
              </div>
              <div className="text-3xl font-black font-mono-numbers text-white">
                {reading.interval_ms.toFixed(0)} <span className="text-sm font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
                <span>Rate: {reading.pkt_rate.toFixed(1)}/s</span>
                <span>Loss: {(reading.loss || 0) * 100}%</span>
              </div>
            </div>
          </div>

          {/* AI Evidence Insight */}
          <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">
                  Explainable AI Operational Verdict
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {activeMachine.text || 'Nominal operation across physical and cyber layers.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToExplain?.()}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 shrink-0"
            >
              <span>Inspect Full XAI Evidence</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
