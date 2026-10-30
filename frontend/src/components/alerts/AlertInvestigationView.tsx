import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  Sliders,
  Timer,
  Sparkles,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';

export const AlertInvestigationView: React.FC = () => {
  const { alerts } = useSentryGrid();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'ATTACK' | 'FAULT' | 'ACTIVE'>('ALL');
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  const filteredAlerts = alerts.filter((alert) => {
    // Search matching
    const matchesSearch =
      alert.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.text.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter type matching
    if (filterType === 'ATTACK') return alert.state === 'ATTACK';
    if (filterType === 'FAULT') return alert.state === 'FAULT';
    if (filterType === 'ACTIVE') return !alert.resolved_ts;

    return true;
  });

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((a) => !a.resolved_ts).length;
  const attackAlerts = alerts.filter((a) => a.state === 'ATTACK').length;
  const faultAlerts = alerts.filter((a) => a.state === 'FAULT').length;

  const formatTimestamp = (ts: number) => {
    if (!ts) return '--:--:--';
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics Strip */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0e1728]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Audit Trail
              </span>
              <span className="text-xs text-slate-400 font-mono">SQLite Persistent Store</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1 flex items-center gap-2">
              <Bell className="w-6 h-6 text-rose-400" />
              <span>Security Event Investigation & Forensics</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Complete chronological ledger of cyber-physical anomalies, detection latency benchmarks, and granular Explainable AI proof.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Logged</div>
              <div className="text-lg font-bold font-mono text-white">{totalAlerts}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-rose-400 uppercase">Active</div>
              <div className="text-lg font-bold font-mono text-rose-300">{activeAlerts}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-cyan-400 uppercase">Attacks / Faults</div>
              <div className="text-lg font-bold font-mono text-cyan-300">
                {attackAlerts} / {faultAlerts}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by asset ID, kind, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Incidents' },
            { id: 'ACTIVE', label: 'Active Alerts' },
            { id: 'ATTACK', label: 'Attacks Only' },
            { id: 'FAULT', label: 'Faults Only' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table & Event Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-slate-300">No Security Incidents Found</p>
          <p className="text-xs text-slate-500 mt-1">
            Either no alerts have occurred matching your filter, or all simulated assets are in normal operating state.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isAttack = alert.state === 'ATTACK';
            const isResolved = alert.resolved_ts !== null;
            const isExpanded = expandedAlertId === alert.id;
            const confidencePct = ((alert.confidence || 0) * 100).toFixed(1);

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-cyan-500/40 bg-slate-900/95 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                    : isAttack && !isResolved
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/30 to-slate-900/80 hover:border-rose-500/60'
                    : !isResolved
                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/80 hover:border-amber-500/60'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* Collapsed Header Row */}
                <div
                  onClick={() => toggleExpand(alert.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        isAttack
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {isAttack ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{alert.id}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {alert.kind.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {alert.machine_id}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase border ${
                            isAttack
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isAttack ? 'CRITICAL CYBERATTACK' : 'EQUIPMENT FAULT'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate mt-1 font-sans">
                        {alert.text}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Right Badges */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Latency */}
                    {alert.latency_s !== null && (
                      <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                        <Timer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{alert.latency_s.toFixed(2)}s lag</span>
                      </div>
                    )}

                    {/* Confidence */}
                    <div className="text-xs font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {confidencePct}%
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full uppercase border flex items-center gap-1.5 ${
                        isResolved
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isResolved ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      <span>{isResolved ? 'Resolved' : 'Active'}</span>
                    </span>

                    {/* Timestamp */}
                    <span className="text-xs font-mono text-slate-400">
                      {formatTimestamp(alert.ts)}
                    </span>

                    {/* Chevron */}
                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Forensic Evidence Drawer */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-slate-950/70 rounded-b-2xl space-y-4">
                    {/* Full Explanation */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase font-mono mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Diagnostic Forensic Statement</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {alert.text}
                      </p>
                    </div>

                    {/* Granular Feature Evidence */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Contributing Feature Attributions (SHAP / Residuals)</span>
                      </div>

                      {alert.evidence && alert.evidence.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {alert.evidence.map((ev, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-xs font-bold text-white">{ev.label}</div>
                                  <div className="text-[10px] font-mono text-slate-500">
                                    {ev.feature}
                                  </div>
                                </div>
                                <span
                                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                                    Math.abs(ev.z) > 10
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                  }`}
                                >
                                  {ev.z > 0 ? `+${ev.z.toFixed(1)}σ` : `${ev.z.toFixed(1)}σ`}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-300 mt-2 font-sans leading-snug">
                                {ev.sentence}
                              </p>

                              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span>Recorded Value: {ev.value.toFixed(3)}</span>
                                <span>Impact: {(ev.impact || 0).toFixed(4)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No granular feature weights were archived for this legacy event.
                        </p>
                      )}
                    </div>

                    {/* Incident Metadata Footer */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <div>Triggered at: {new Date(alert.ts * 1000).toLocaleString()}</div>
                      {alert.resolved_ts && (
                        <div>
                          Resolved at: {new Date(alert.resolved_ts * 1000).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
