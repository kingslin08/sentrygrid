import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import {
  Flame,
  Activity,
  Zap,
  Radio,
  WifiOff,
  Download,
  Table as TableIcon,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';
import { MACHINE_METADATA } from '../../constants/machines';
import type { HistoryReading } from '../../types/sentrygrid';

// Custom dark cyber tooltip for charts
const CustomChartTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as HistoryReading;
    return (
      <div className="p-3 rounded-xl bg-[#09121f]/95 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md text-xs font-mono">
        <div className="text-slate-400 font-sans font-bold flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-1.5">
          <span>Simulation Tick #{label}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${
              data.state === 'ATTACK'
                ? 'bg-rose-500/20 text-rose-300'
                : data.state === 'FAULT'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {data.state || 'NORMAL'}
          </span>
        </div>

        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-6 py-0.5">
            <span style={{ color: entry.color }} className="font-semibold font-sans text-slate-300">
              {entry.name}:
            </span>
            <span className="font-bold text-white">
              {Number(entry.value).toFixed(2)} {unit}
            </span>
          </div>
        ))}

        {data.kind && data.kind !== 'normal' && (
          <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-amber-400 font-sans">
            Detection: {data.kind.replace('_', ' ')}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const SensorAnalyticsView: React.FC = () => {
  const { machines, selectedMachineId, setSelectedMachineId, history } = useSentryGrid();
  const [tickWindow, setTickWindow] = useState<number>(60);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [activeTabMetric, setActiveTabMetric] = useState<'all' | 'thermal' | 'vibration' | 'electrical' | 'network'>('all');

  const rawHistory = history[selectedMachineId] || [];
  const meta = MACHINE_METADATA[selectedMachineId] || {
    id: selectedMachineId,
    name: selectedMachineId,
    rated_temp: 70,
    rated_vib: 1.0,
    rated_cur: 10,
    type: 'Industrial Asset',
  };

  // Slice to selected tick window
  const chartData = rawHistory.slice(-tickWindow).map((d) => ({
    ...d,
    // Calculate derived packet loss for chart
    derived_loss: d.kind === 'attack_dos' ? 65.0 : Math.max(0, (d.interval_ms - 1000) / 30),
  }));

  const exportCsv = () => {
    if (!chartData.length) return;
    const headers = 'tick,temp,vib_rms,current,pkt_rate,interval_ms,state,kind,confidence\n';
    const rows = chartData
      .map(
        (r) =>
          `${r.tick},${r.temp},${r.vib_rms},${r.current},${r.pkt_rate},${r.interval_ms},${r.state},${r.kind},${r.confidence}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentrygrid_${selectedMachineId}_telemetry.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Header & Machine Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#0e1726]/90 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Live Sensor Intelligence & Waveforms</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous cross-layer telemetry stream comparing physical thermodynamics against OT network packet flow
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Machine Selector Buttons */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            {machines.map((m) => (
              <button
                key={m.machine_id}
                onClick={() => setSelectedMachineId(m.machine_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMachineId === m.machine_id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Window Range Selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
            {[30, 60, 120].map((ticks) => (
              <button
                key={ticks}
                onClick={() => setTickWindow(ticks)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  tickWindow === ticks
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ticks}t
              </button>
            ))}
          </div>

          {/* CSV Export */}
          <button
            onClick={exportCsv}
            disabled={chartData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-40"
            title="Download CSV telemetry stream"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Toggle Table */}
          <button
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              showTable
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect Table</span>
          </button>
        </div>
      </div>

      {/* Chart Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All 5 Waveforms' },
          { id: 'thermal', label: '1. Temperature' },
          { id: 'vibration', label: '2. Vibration RMS' },
          { id: 'electrical', label: '3. Motor Current' },
          { id: 'network', label: '4. Network Rate & Loss' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabMetric(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTabMetric === tab.id
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400">
          <Activity className="w-8 h-8 text-cyan-500 mx-auto animate-pulse mb-3" />
          <p className="font-semibold text-slate-300">Awaiting Sensor Telemetry History</p>
          <p className="text-xs text-slate-500 mt-1">
            Receiving telemetry readings from backend simulator. Please ensure the backend is running.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Temperature (°C) */}
          {(activeTabMetric === 'all' || activeTabMetric === 'thermal') && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1726]/90 to-[#09101d]/90 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Temperature Telemetry</h4>
                    <p className="text-[11px] text-slate-400">Physical thermal dynamics vs rated limit ({meta.rated_temp}°C)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-orange-400">
                    {chartData[chartData.length - 1]?.temp.toFixed(1)} °C
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="°C" />} />
                    <ReferenceLine
                      y={meta.rated_temp}
                      label={{ value: `Rated Max ${meta.rated_temp}°C`, fill: '#ef4444', fontSize: 10 }}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      name="Temperature"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#tempGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Vibration RMS */}
          {(activeTabMetric === 'all' || activeTabMetric === 'vibration') && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1726]/90 to-[#09101d]/90 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Vibration RMS Waveform</h4>
                    <p className="text-[11px] text-slate-400">Mechanical velocity & bearing acceleration ({meta.rated_vib} RMS rated)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {chartData[chartData.length - 1]?.vib_rms.toFixed(3)} RMS
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="RMS" />} />
                    <ReferenceLine
                      y={meta.rated_vib}
                      label={{ value: `Rated Limit ${meta.rated_vib}`, fill: '#f59e0b', fontSize: 10 }}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey="vib_rms"
                      name="Vibration RMS"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#vibGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Motor Electrical Current (A) */}
          {(activeTabMetric === 'all' || activeTabMetric === 'electrical') && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1726]/90 to-[#09101d]/90 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Electrical Motor Current</h4>
                    <p className="text-[11px] text-slate-400">Direct physical drive power consumption ({meta.rated_cur} A rated)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-yellow-400">
                    {chartData[chartData.length - 1]?.current.toFixed(2)} A
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="curGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="A" />} />
                    <Area
                      type="monotone"
                      dataKey="current"
                      name="Current"
                      stroke="#eab308"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#curGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 4: Network Packet Rate */}
          {(activeTabMetric === 'all' || activeTabMetric === 'network') && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1726]/90 to-[#09101d]/90 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Network Packet Rate</h4>
                    <p className="text-[11px] text-slate-400">Ingress sensor frame frequency (Baseline ~1.0 pkt/s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {chartData[chartData.length - 1]?.pkt_rate.toFixed(2)} pkts/s
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="pkt/s" />} />
                    <ReferenceLine y={1.0} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Normal 1.0', fill: '#3b82f6', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="pkt_rate"
                      name="Packet Rate"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 5: Packet Loss & Transmission Latency Jitter */}
          {(activeTabMetric === 'all' || activeTabMetric === 'network') && (
            <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-[#0e1726]/90 to-[#09101d]/90 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Packet Loss & Interval Jitter</h4>
                    <p className="text-[11px] text-slate-400">
                      Transmission delay deviations (interval_ms) & dropped frames indicating potential Denial of Service (DoS)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {chartData[chartData.length - 1]?.interval_ms.toFixed(0)} ms latency
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#f43f5e" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="ms / %" />} />
                    <ReferenceLine yAxisId="left" y={1000} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: '1000ms baseline', fill: '#38bdf8', fontSize: 10 }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="interval_ms"
                      name="Packet Interval (ms)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="derived_loss"
                      name="Packet Loss (%)"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw Sensor Readings Table */}
      {showTable && (
        <div className="mt-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-cyan-400" />
              <span>Stored Sensor Readings Audit Trail (Last {chartData.length} records)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Asset: {selectedMachineId}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Tick</th>
                  <th className="py-2.5 px-3">Temp (°C)</th>
                  <th className="py-2.5 px-3">Vibration (RMS)</th>
                  <th className="py-2.5 px-3">Current (A)</th>
                  <th className="py-2.5 px-3">Packet Rate</th>
                  <th className="py-2.5 px-3">Interval (ms)</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Truth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {chartData.slice(-25).reverse().map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-cyan-400 font-bold">#{r.tick}</td>
                    <td className="py-2 px-3">{r.temp.toFixed(2)}</td>
                    <td className="py-2 px-3">{r.vib_rms.toFixed(3)}</td>
                    <td className="py-2 px-3">{r.current.toFixed(2)}</td>
                    <td className="py-2 px-3">{r.pkt_rate.toFixed(2)}</td>
                    <td className="py-2 px-3">{r.interval_ms.toFixed(1)}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.state === 'ATTACK'
                            ? 'bg-rose-500/20 text-rose-300'
                            : r.state === 'FAULT'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {r.state}
                      </span>
                    </td>
                    <td className="py-2 px-3">{((r.confidence || 0) * 100).toFixed(0)}%</td>
                    <td className="py-2 px-3 text-slate-400">{r.truth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
