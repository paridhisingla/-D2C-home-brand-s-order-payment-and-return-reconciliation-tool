import React from 'react';

interface StatusBadgeProps {
  status: 'GREEN' | 'AMBER' | 'RED' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  lang?: 'en' | 'ta';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  lang = 'en',
}) => {
  const upper = (status || 'GREEN').toUpperCase();

  const config = {
    GREEN: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      pulse: false,
      label: 'On Track',
      tamilLabel: 'சரியான நிலை',
    },
    AMBER: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      pulse: true,
      label: 'Delay Warning',
      tamilLabel: 'தாமத எச்சரிக்கை',
    },
    RED: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/80 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80',
      dot: 'bg-rose-600',
      ping: 'bg-rose-400',
      pulse: true,
      label: 'Critical Delay',
      tamilLabel: 'அபாய நிலை',
    },
  }[upper] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
    ping: 'bg-slate-300',
    pulse: false,
    label: upper,
    tamilLabel: upper,
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} shadow-2xs transition-all backdrop-blur-xs select-none`}
    >
      <span className={`relative flex ${dotSizes} flex-shrink-0`}>
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSizes} ${config.dot}`} />
      </span>
      {showLabel && <span>{lang === 'ta' ? config.tamilLabel : config.label}</span>}
    </span>
  );
};
