import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  badge?: string;
  trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  badge,
  trend,
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.06)]',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-400/30',
      valueColor: 'text-white',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.06)]',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30',
      valueColor: 'text-emerald-300',
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-500/50',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-400/30',
      valueColor: 'text-amber-300',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-500/60',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.12)]',
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-400/40',
      valueColor: 'text-rose-300',
    },
    slate: {
      border: 'border-slate-800 hover:border-slate-700',
      glow: '',
      iconBg: 'bg-slate-800 text-slate-400 border-slate-700',
      valueColor: 'text-slate-200',
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101c30]/90 to-[#0b1424]/90 backdrop-blur-md border ${variantStyles.border} ${variantStyles.glow} p-5 transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            {title}
          </span>
          <div className={`mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight font-mono-numbers ${variantStyles.valueColor}`}>
            {value}
          </div>
        </div>

        <div
          className={`flex items-center justify-center w-11 h-11 rounded-xl border ${variantStyles.iconBg} transition-transform group-hover:scale-105`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px] truncate max-w-[200px]">{subtitle}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
            {badge}
          </span>
        )}
        {trend && (
          <span className="text-cyan-400 font-mono text-[10px]">{trend}</span>
        )}
      </div>

      {/* Subtle bottom edge accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity ${
        variant === 'rose' ? 'bg-rose-500' :
        variant === 'amber' ? 'bg-amber-500' :
        variant === 'emerald' ? 'bg-emerald-500' : 'bg-cyan-500'
      }`} />
    </div>
  );
};
