import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Activity,
  Disc,
  Repeat,
  WifiOff,
  AlertTriangle,
  Clock,
  Timer,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';

export const ThreatCenterView: React.FC = () => {
  const { alerts } = useSentryGrid();
  const [activeTab, setActiveTab] = useState<'all' | 'attacks' | 'faults'>('all');

  const attackAlerts = alerts.filter((a) => a.state === 'ATTACK');
  const faultAlerts = alerts.filter((a) => a.state === 'FAULT');

  const formatTime = (ts: number) => {
    if (!ts) return '--:--:--';
    return new Date(ts * 1000).toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0e1728]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Threat Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono">Cyber-Physical Disambiguation</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <span>Cyberattack & Equipment Fault Threat Center</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              SentryGrid cross-references thermodynamic coupling against wire-level frame anomalies to definitively distinguish malicious cyberattacks from mechanical degradation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-center">
              <div className="text-[10px] font-mono uppercase">Cyberattacks</div>
              <div className="text-xl font-bold font-mono">{attackAlerts.length} logged</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-center">
              <div className="text-[10px] font-mono uppercase">Equipment Faults</div>
              <div className="text-xl font-bold font-mono">{faultAlerts.length} logged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Matrix: 3 Attacks vs 3 Faults */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CYBERATTACKS (Red theme) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b0c16]/80 to-[#0e0811]/90 border border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.1)]">
          <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Cyberattack Vectors (OT Network Layer)
                </h3>
                <p className="text-xs text-rose-300/80">Tampering that manipulates wire telemetry without physical basis</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              3 Classes
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Spoofing */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="font-bold text-white text-xs">Sensor Spoofing</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Critical
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Adversary transmits false temperature or vibration readings. Physics residual (<code className="text-rose-400">temp_resid</code>) spikes because physical variables (motor current, heat transfer) stay calm.
              </p>
            </div>

            {/* 2. Replay */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-pink-400" />
                  <span className="font-bold text-white text-xs">Replay Attack</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Critical
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Captured historical sensor frames re-injected on the bus. Detected via repeated identical readings (<code className="text-rose-400">dup_ratio</code>) and stale timestamp skew (<code className="text-rose-400">ts_skew_ms</code>).
              </p>
            </div>

            {/* 3. DoS */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-xs">Denial of Service (DoS)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Critical
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Network frame flooding causing packet rate (<code className="text-rose-400">pkt_rate</code>) to exceed threshold, packet loss (<code className="text-rose-400">loss</code>) &gt;40%, and extreme arrival jitter (<code className="text-rose-400">interval_std</code>).
              </p>
            </div>
          </div>
        </div>

        {/* EQUIPMENT FAULTS (Amber theme) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1c1308]/80 to-[#100b05]/90 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Physical Equipment Faults (Mechanical Layer)
                </h3>
                <p className="text-xs text-amber-300/80">Physical mechanical degradation where all coupled sensors move together</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              3 Classes
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Overheating */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-white text-xs">Overheating Fault</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  High Severity
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Thermodynamic dissipation breakdown. Gradual thermal trend (<code className="text-amber-400">temp_slope</code>) coupled with matching physical temperature and motor current draw. Wire packets remain normal.
              </p>
            </div>

            {/* 2. Imbalance */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">Rotor Imbalance Fault</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Medium Severity
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Mass eccentricity on rotating spindle. Produces strong 1X harmonic low-frequency vibration (<code className="text-amber-400">band_lo</code>) and elevates overall RMS vibration.
              </p>
            </div>

            {/* 3. Bearing Wear */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-white text-xs">Bearing Wear Fault</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  High Severity
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Raceway micro-pitting generates transient impacts in high-frequency spectrum (<code className="text-amber-400">band_hi</code>). Share of high-frequency vibration (<code className="text-amber-400">hi_ratio</code>) escalates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Threat Activity Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Active & Historic Incident Feed</span>
          </h3>

          <div className="flex items-center gap-2">
            {(['all', 'attacks', 'faults'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {alerts
            .filter((a) => {
              if (activeTab === 'attacks') return a.state === 'ATTACK';
              if (activeTab === 'faults') return a.state === 'FAULT';
              return true;
            })
            .slice(0, 10)
            .map((alert) => {
              const isAttack = alert.state === 'ATTACK';
              const isResolved = alert.resolved_ts !== null;

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAttack
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-lg border ${
                        isAttack
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {isAttack ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {alert.kind.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {alert.machine_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{alert.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {alert.latency_s && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Timer className="w-3 h-3 text-cyan-400" />
                        {alert.latency_s.toFixed(2)}s latency
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {((alert.confidence || 0) * 100).toFixed(0)}%
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        isResolved
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {isResolved ? 'Resolved' : 'Active'}
                    </span>

                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTime(alert.ts)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
