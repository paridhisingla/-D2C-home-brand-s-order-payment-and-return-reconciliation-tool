import React from 'react';

interface StatusBadgeProps {
  status: 'GREEN' | 'AMBER' | 'RED' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  const upper = (status || 'GREEN').toUpperCase();

  const config = {
    GREEN: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'On Track',
      tamilLabel: 'சரியான நிலை',
    },
    AMBER: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500 animate-pulse',
      label: 'Delay Warning',
      tamilLabel: 'தாமத எச்சரிக்கை',
    },
    RED: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-600 animate-ping',
      label: 'Critical Delay',
      tamilLabel: 'அபாய நிலை',
    },
  }[upper] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: upper,
    tamilLabel: upper,
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} shadow-sm transition-all`}
    >
      <span className={`rounded-full ${config.dot} ${dotSizes} flex-shrink-0`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
