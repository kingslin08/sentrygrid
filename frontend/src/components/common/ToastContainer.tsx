import React from 'react';
import { useSentryGrid } from '../../context/SentryGridContext';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSentryGrid();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'alert':
      case 'error':
        return 'border-rose-500/40 bg-[#160d16]/95 shadow-[0_0_20px_rgba(244,63,94,0.25)]';
      case 'warning':
        return 'border-amber-500/40 bg-[#19150d]/95 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      case 'success':
        return 'border-emerald-500/40 bg-[#0d1814]/95 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      default:
        return 'border-cyan-500/40 bg-[#0c1626]/95 shadow-[0_0_20px_rgba(6,182,212,0.2)]';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${getBorderColor(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                {toast.title}
              </h5>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
