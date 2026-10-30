import React, { useState } from 'react';
import { AlertOctagon, Terminal, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';

export const BackendOfflineBanner: React.FC = () => {
  const { backendConnected, refreshAll, isRefreshing } = useSentryGrid();
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (backendConnected) return null;

  const runCommand = `.\\.venv\\Scripts\\python.exe -m uvicorn sentrygrid.api:app --host 127.0.0.1 --port 8001`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(runCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-4 lg:mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-slate-900/90 border border-rose-500/40 backdrop-blur-md text-rose-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>BACKEND SERVICE OFFLINE</span>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                127.0.0.1:8001
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-0.5">
              The SentryGrid Python FastAPI server is currently unreachable. Start it in your terminal to see live telemetry and inject scenarios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Launch Command</span>
            {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => refreshAll()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-[0_0_12px_rgba(244,63,94,0.3)] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Reconnect</span>
          </button>
        </div>
      </div>

      {detailsOpen && (
        <div className="mt-4 pt-3 border-t border-rose-500/20">
          <div className="text-xs text-slate-300 mb-1.5 font-semibold">
            In your backend terminal directory (`sentrygrid-backend`), execute:
          </div>
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
            <code className="overflow-x-auto whitespace-nowrap">{runCommand}</code>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Copy command"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
