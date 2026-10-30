import React from 'react';
import {
  Shield,
  RefreshCw,
  Volume2,
  VolumeX,
  AlertTriangle,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useSentryGrid } from '../../context/SentryGridContext';

interface HeaderProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ mobileNavOpen, setMobileNavOpen }) => {
  const {
    backendConnected,
    wsConnected,
    isRefreshing,
    lastUpdated,
    tickCount,
    refreshAll,
    audioAlertsEnabled,
    setAudioAlertsEnabled,
  } = useSentryGrid();

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour12: false })
    : '--:--:--';

  return (
    <header className="sticky top-0 z-40 bg-[#080e18]/90 backdrop-blur-md border-b border-cyan-500/15 px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-lg transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${backendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                SENTRY<span className="text-cyan-400">GRID</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                v2.4 SOC
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Industrial IoT Cyber-Physical Threat Intelligence & Fault Diagnostic System
            </p>
          </div>
        </div>

        {/* Global Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulation Mode Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>SIMULATION MODE</span>
          </div>

          {/* Backend Connection Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              backendConnected
                ? wsConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse'
            }`}
            title={
              backendConnected
                ? wsConnected
                  ? 'Connected via live WebSocket stream & REST API'
                  : 'Connected via HTTP Polling'
                : 'FastAPI backend unreachable at 127.0.0.1:8000'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected
                  ? wsConnected
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            <span className="hidden md:inline">
              {backendConnected
                ? wsConnected
                  ? 'SYSTEM ONLINE (WS)'
                  : 'SYSTEM ONLINE (REST)'
                : 'BACKEND OFFLINE'}
            </span>
          </div>

          {/* Telemetry Clock & Ticks */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/50 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedTime}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">T+{tickCount}</span>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
            className={`p-2 rounded-lg border transition-colors ${
              audioAlertsEnabled
                ? 'bg-slate-800/80 border-cyan-500/30 text-cyan-400 hover:bg-slate-700/80'
                : 'bg-slate-900/60 border-slate-700/40 text-slate-500 hover:text-slate-300'
            }`}
            title={audioAlertsEnabled ? 'Sound alert enabled on attacks' : 'Sound alerts muted'}
            aria-label="Toggle alert audio"
          >
            {audioAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Refresh Action */}
          <button
            onClick={() => refreshAll()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/30 text-cyan-200 text-xs font-medium transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-95 disabled:opacity-50"
            title="Force immediate poll of FastAPI backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
