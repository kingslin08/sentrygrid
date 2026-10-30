import React from 'react';
import {
  Activity,
  AlertTriangle,
  Flame,
  Radio,
  ShieldAlert,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import type { MachineSnapshot } from '../../types/sentrygrid';
import { MACHINE_METADATA } from '../../constants/machines';
import { useSentryGrid } from '../../context/SentryGridContext';

interface MachineCardProps {
  machine: MachineSnapshot;
  onSelect?: () => void;
  onInjectClick?: (machineId: string) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onSelect,
  onInjectClick,
}) => {
  const { clearScenario } = useSentryGrid();
  const meta = MACHINE_METADATA[machine.machine_id] || {
    id: machine.machine_id,
    name: machine.name,
    type: 'Industrial Asset',
    location: 'Facility Zone',
    rated_temp: 70,
    rated_vib: 1.0,
    rated_cur: 10,
    period: 90,
    phase: 0,
    description: '',
  };

  const reading = machine.reading || {
    tick: 0,
    t: 0,
    temp: 0,
    vib_rms: 0,
    current: 0,
    interval_ms: 1000,
    pkt_rate: 1.0,
    loss: 0,
    ts_skew_ms: 0,
  };

  const isAttack = machine.state === 'ATTACK';
  const isFault = machine.state === 'FAULT';
  const isWarmup = machine.state === 'WARMUP';
  const isAbnormal = isAttack || isFault;

  const confidencePct = ((machine.confidence || 0) * 100).toFixed(1);

  // Status-specific card styling
  const cardBorder = isAttack
    ? 'border-rose-500/60 bg-gradient-to-br from-[#200c14]/90 to-[#0e070c]/90 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
    : isFault
    ? 'border-amber-500/50 bg-gradient-to-br from-[#221609]/90 to-[#0e0a05]/90 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
    : isWarmup
    ? 'border-sky-500/30 bg-gradient-to-br from-[#0a1828]/90 to-[#070e18]/90 shadow-[0_0_20px_rgba(56,189,248,0.1)]'
    : 'border-cyan-500/20 bg-gradient-to-br from-[#0c182a]/85 to-[#07101c]/90 shadow-[0_0_20px_rgba(6,182,212,0.06)]';

  const badgeStyles = isAttack
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
    : isFault
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    : isWarmup
    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';

  const packetLoss = reading.loss !== undefined ? (reading.loss * 100).toFixed(1) : '0.0';

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border ${cardBorder} p-5 backdrop-blur-md transition-all duration-300 hover:scale-[1.01] cursor-pointer group flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
                {machine.machine_id}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {meta.location}
              </span>
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white font-display mt-0.5 group-hover:text-cyan-300 transition-colors">
              {machine.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{meta.type}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider border ${badgeStyles}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAttack
                    ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e] animate-ping'
                    : isFault
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : isWarmup
                    ? 'bg-sky-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span>{machine.state}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <span>CONFIDENCE:</span>
              <span className={`font-bold ${isAbnormal ? 'text-white' : 'text-cyan-400'}`}>
                {confidencePct}%
              </span>
            </div>
          </div>
        </div>

        {isAbnormal && (
          <div
            className={`mt-3 p-2.5 rounded-xl border text-xs ${
              isAttack
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-[10px]">
              {isAttack ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{machine.label}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {/* Temperature */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Temperature</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                /{meta.rated_temp}°C
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-xl font-extrabold font-mono-numbers ${
                  reading.temp > meta.rated_temp * 0.95
                    ? 'text-rose-400'
                    : reading.temp > meta.rated_temp * 0.8
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {reading.temp.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  reading.temp > meta.rated_temp * 0.95
                    ? 'bg-rose-500'
                    : reading.temp > meta.rated_temp * 0.8
                    ? 'bg-amber-500'
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (reading.temp / meta.rated_temp) * 100)}%` }}
              />
            </div>
          </div>

          {/* Vibration RMS */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vibration RMS</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                /{meta.rated_vib.toFixed(1)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-xl font-extrabold font-mono-numbers ${
                  reading.vib_rms > meta.rated_vib * 0.95
                    ? 'text-rose-400'
                    : reading.vib_rms > meta.rated_vib * 0.8
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {reading.vib_rms.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  reading.vib_rms > meta.rated_vib * 0.95
                    ? 'bg-rose-500'
                    : reading.vib_rms > meta.rated_vib * 0.8
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (reading.vib_rms / meta.rated_vib) * 100)}%` }}
              />
            </div>
          </div>

          {/* Electrical Current */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Motor Current</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                /{meta.rated_cur.toFixed(1)}A
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono-numbers text-slate-100">
                {reading.current.toFixed(2)} <span className="text-xs font-normal text-slate-400">A</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.min(100, (reading.current / meta.rated_cur) * 100)}%` }}
              />
            </div>
          </div>

          {/* Network Packet Loss & Rate */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>Packet Loss</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {reading.pkt_rate.toFixed(1)} pkt/s
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-xl font-extrabold font-mono-numbers ${
                  Number(packetLoss) > 5 ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {packetLoss} <span className="text-xs font-normal text-slate-400">%</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  Number(packetLoss) > 5 ? 'bg-rose-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, Number(packetLoss)))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>AI Detection Explanation</span>
            </span>
            <span className="text-slate-500 font-mono">T+{reading.tick}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
            {machine.text || 'Collecting continuous baseline sensor telemetries.'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-0.5 transform duration-150"
        >
          <span>Sensor Telemetry</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {isAbnormal ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearScenario(machine.machine_id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors active:scale-95"
              title="Clear active anomaly on this machine"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInjectClick?.(machine.machine_id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors active:scale-95"
              title="Inject a test anomaly into this machine"
            >
              <Zap className="w-3 h-3" />
              <span>Test Inject</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
