import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Scale,
  Activity,
  Zap,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';
import type { FeatureEvidence } from '../../types/sentrygrid';

export const ExplainableAiView: React.FC = () => {
  const { machines, alerts, selectedMachineId, setSelectedMachineId } = useSentryGrid();
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const activeMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];

  const chosenAlert = selectedAlertId ? alerts.find((a) => a.id === selectedAlertId) : null;

  const currentKind = chosenAlert ? chosenAlert.kind : activeMachine?.kind || 'normal';
  const currentState = chosenAlert ? chosenAlert.state : activeMachine?.state || 'NORMAL';
  const currentConfidence = chosenAlert ? chosenAlert.confidence : activeMachine?.confidence || 0.95;
  const currentText = chosenAlert ? chosenAlert.text : activeMachine?.text || 'All signals are moving together within the learnt baseline.';
  const currentEvidence: FeatureEvidence[] = chosenAlert ? chosenAlert.evidence : activeMachine?.evidence || [];
  const currentMachineName = chosenAlert ? chosenAlert.machine_id : activeMachine?.name || 'Asset';

  const isAttack = currentState === 'ATTACK';
  const isFault = currentState === 'FAULT';

  const maxImpact = Math.max(...currentEvidence.map((e) => Math.abs(e.impact || 0)), 0.1);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0c182c]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Core Differentiator
              </span>
              <span className="text-xs text-slate-400 font-mono">SHAP & Residual Attribution</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
              <span>Explainable AI Diagnostic Evidence</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Deconstructs the random forest decision boundary into physical conservation residuals and wire packet timing evidence. Verifiable proof, not a black-box score.
            </p>
          </div>

          {/* Machine & Alert Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {machines.map((m) => (
                <button
                  key={m.machine_id}
                  onClick={() => {
                    setSelectedMachineId(m.machine_id);
                    setSelectedAlertId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedMachineId === m.machine_id && !selectedAlertId
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {alerts.length > 0 && (
              <select
                value={selectedAlertId || ''}
                onChange={(e) => setSelectedAlertId(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="">Live State Telemetry</option>
                {alerts.slice(0, 15).map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} {a.machine_id} · {a.kind} ({((a.confidence || 0) * 100).toFixed(0)}%)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Top Classification & Confidence Spotlight */}
      <div
        className={`p-6 rounded-2xl border backdrop-blur-md ${
          isAttack
            ? 'bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/90 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
            : isFault
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/90 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            : 'bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-900/90 border-emerald-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Target Asset:</span>
              <span className="font-bold text-white">{currentMachineName}</span>
              {chosenAlert && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  Alert #{chosenAlert.id} (Archived)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl lg:text-3xl font-extrabold text-white font-display">
                {currentKind.replace('_', ' ').toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border ${
                  isAttack
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : isFault
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {currentState}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Detection Confidence</div>
              <div className="text-2xl font-black font-mono-numbers text-cyan-300">
                {(currentConfidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="w-16 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isAttack ? 'bg-rose-500' : isFault ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, currentConfidence * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Human Readable Explanation Quote */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1.5 uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Model Generated Natural Language Summary</span>
          </div>
          <p className="text-sm lg:text-base text-slate-200 font-sans italic leading-relaxed">
            "{currentText}"
          </p>
        </div>
      </div>

      {/* Feature Contributions & Evidence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Feature Impact Bars */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Feature Impact & Deviation Contribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Normalized Weight</span>
          </div>

          {currentEvidence.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-300">No Abnormal Feature Deviations</p>
              <p className="text-xs text-slate-500 mt-1">
                Machine telemetry conforms with learned baseline physics and normal network transmission intervals.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentEvidence.map((item, idx) => {
                const impactWidth = Math.min(100, Math.max(8, (Math.abs(item.impact) / maxImpact) * 100));

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{item.label}</span>
                          <span className="text-[10px] font-mono text-cyan-400">({item.feature})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {item.sentence}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            Math.abs(item.z) > 10
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {item.z > 0 ? `+${item.z.toFixed(1)}σ` : `${item.z.toFixed(1)}σ`}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Val: {item.value.toFixed(3)}
                        </div>
                      </div>
                    </div>

                    {/* Impact Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAttack
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                            : isFault
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${impactWidth}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                      <span>Baseline: 0.0σ</span>
                      <span>Impact Weight: {(item.impact || 0).toFixed(4)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Physical vs Cyber Discrepancy Principle */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c182c]/90 to-[#07111e]/90 border border-cyan-500/20 backdrop-blur-md">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>How SentryGrid Tells Fault from Attack</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  Physical Fault Dynamics
                </span>
                <p className="text-slate-400 text-[11px]">
                  Physical laws couple thermodynamics with motor power. When an impeller overheats, current rises and vibration shifts synchronously. Signals move together.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Cyberattack Dynamics
                </span>
                <p className="text-slate-400 text-[11px]">
                  Cyber threats touch only the network wire. Sensor spoofing injects hot temperatures while motor current stays calm, violating thermodynamic conservation laws.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Wire Telemetry Indicators
                </span>
                <p className="text-slate-400 text-[11px]">
                  Replay and DoS attacks exhibit duplicate payloads (<code className="text-cyan-300">dup_ratio</code>), high packet loss, or arrival jitter (<code className="text-cyan-300">interval_std</code>).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
