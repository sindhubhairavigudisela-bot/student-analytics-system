import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle: string;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'danger' | 'success';
  trendText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  status = 'normal',
  trendText,
}) => {
  const borderColors = {
    normal: 'border-slate-800 hover:border-slate-700',
    warning: 'border-amber-900/50 hover:border-amber-700/60',
    danger: 'border-rose-900/60 hover:border-rose-700/70',
    success: 'border-emerald-900/50 hover:border-emerald-700/60',
  }[status];

  const glowEffects = {
    normal: 'group-hover:shadow-indigo-950/20',
    warning: 'group-hover:shadow-amber-950/20',
    danger: 'group-hover:shadow-rose-950/30',
    success: 'group-hover:shadow-emerald-950/20',
  }[status];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm border transition-all duration-200 ${borderColors} ${glowEffects}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            {value === null || value === undefined ? (
              <span className="text-xl font-medium text-slate-500">Insufficient Data</span>
            ) : (
              <>
                <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
                {unit && <span className="text-lg font-semibold text-slate-400">{unit}</span>}
              </>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-slate-800/80 p-2.5 text-indigo-400 shadow-inner group-hover:scale-105 transition-transform duration-200">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
        <p className="text-xs text-slate-400 truncate pr-2" title={subtitle}>
          {subtitle}
        </p>
        {trendText && (
          <span className="text-xs font-medium text-indigo-400 shrink-0">
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
