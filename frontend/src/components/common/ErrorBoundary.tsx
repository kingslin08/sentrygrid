import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SentryGrid Uncaught UI Error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0c121e] border border-rose-500/40 shadow-[0_0_40px_rgba(244,63,94,0.15)] text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide">
              Interface Telemetry Exception
            </h2>
            <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed">
              A frontend rendering anomaly occurred while parsing telemetry or component state.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset & Reinitialize Console</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
