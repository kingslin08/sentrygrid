import React from 'react';
import {
  Layers,
  Cpu,
  Radio,
  BrainCircuit,
  Database,
  Code2,
  AlertTriangle,
} from 'lucide-react';

export const SystemInfoView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0e1728]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            System Architecture
          </span>
          <span className="text-xs text-slate-400 font-mono">Digital Twin & Edge AI Pipeline</span>
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1 flex items-center gap-2">
          <Layers className="w-6 h-6 text-cyan-400" />
          <span>SentryGrid Core Architecture & Pipeline Specifications</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
          End-to-end cyber-physical intelligence: from high-frequency vibration and thermodynamic physics residuals to unsupervised anomaly filtering, supervised multi-class attribution, and forensic explainability.
        </p>
      </div>

      {/* Mandatory Simulation Mode Disclosure */}
      <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Simulation-Based Working Prototype Disclosure
            </h4>
            <p className="text-xs text-amber-200/90 mt-1 leading-relaxed font-sans">
              <strong>Honesty on Stage:</strong> SentryGrid is currently operating as a high-fidelity software-in-the-loop simulation digital twin. Sensor values, vibration FFT waveforms, and injected scenarios are generated mathematically by the Python physics simulation engine. No physical ESP32 or Raspberry Pi hardware is connected in this prototype stage.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Flowchart / Visual Architecture Diagram */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-6">
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <span>End-to-End Pipeline Data Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Block 1: Physical Simulator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
                <span>STAGE 1</span>
                <Cpu className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs mb-1">Plant Simulator</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                Simulates coupled thermodynamics, 256Hz vibration dynamics, and network bus latency for 3 machines.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 p-1.5 rounded border border-cyan-500/20">
              Output: tick readings (20s window)
            </div>
          </div>

          {/* Block 2: Physics Residuals Engine */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-blue-400 mb-2">
                <span>STAGE 2</span>
                <Radio className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs mb-1">Feature Engineering</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                Extracts cross-signal residuals (<code className="text-cyan-300">temp_resid</code>), FFT harmonic bands (<code className="text-cyan-300">band_lo, band_hi</code>), and packet jitter (<code className="text-cyan-300">interval_std</code>).
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-blue-300 bg-blue-950/40 p-1.5 rounded border border-blue-500/20">
              Output: 26 engineered features
            </div>
          </div>

          {/* Block 3: Two-Stage AI Classifier */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-2">
                <span>STAGE 3</span>
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs mb-1">Two-Stage Model</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                <strong>Stage A:</strong> Isolation Forest filters anomalies.<br />
                <strong>Stage B:</strong> Random Forest classifies into 7 states + SHAP / Baseline deviation impact.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-purple-300 bg-purple-950/40 p-1.5 rounded border border-purple-500/20">
              Output: class + confidence + XAI
            </div>
          </div>

          {/* Block 4: Storage & SOC Dashboard */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
                <span>STAGE 4</span>
                <Database className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs mb-1">Audit Trail & UI</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                Debounces predictions (3 ticks to raise, 6 to clear). Stores alerts in SQLite. Streams live updates via WebSocket to React SOC.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
              Output: Real-time SOC interface
            </div>
          </div>
        </div>
      </div>

      {/* API Reference & Verification Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>FastAPI Backend Endpoints Specification</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/health</td>
                <td className="py-2.5 px-3">Liveness probe and system verification</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/machines</td>
                <td className="py-2.5 px-3">Live snapshots of Pump 02, Motor 07, Valve 03</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/machines/{'{id}'}/history?n=120</td>
                <td className="py-2.5 px-3">Historical sensor telemetry records for waveform charting</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/alerts?limit=50</td>
                <td className="py-2.5 px-3">Incident audit trail with latency and SHAP evidence</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/scenarios</td>
                <td className="py-2.5 px-3">List of supported physical fault and cyberattack kinds</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/inject</td>
                <td className="py-2.5 px-3">Inject test scenario into target machine</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/clear/{'{id}'}</td>
                <td className="py-2.5 px-3">Clear active anomaly from machine</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/api/metrics</td>
                <td className="py-2.5 px-3">Saved model evaluation metrics and confusion matrix</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 text-purple-400 font-bold">WS</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">/ws</td>
                <td className="py-2.5 px-3">Real-time WebSocket event broadcast (status, alert, resolved)</td>
                <td className="py-2.5 px-3"><span className="text-emerald-400">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
