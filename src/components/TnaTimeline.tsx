import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Milestone {
  id: string;
  sequenceOrder: number;
  stageName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  targetQty: number;
  completedQty: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | string;
}

interface TnaTimelineProps {
  milestones: Milestone[];
  currentStage?: string;
}

export const TnaTimeline: React.FC<TnaTimelineProps> = ({ milestones, currentStage }) => {
  if (!milestones || milestones.length === 0) {
    return <div className="text-xs text-slate-400 dark:text-slate-500 py-2">No TNA milestones configured.</div>;
  }

  return (
    <div className="space-y-3">
      {/* Horizontal Overview Bar */}
      <div className="w-full bg-stone-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
        {milestones.map((m) => {
          const isDone = m.status === 'COMPLETED';
          const isCurrent = m.status === 'IN_PROGRESS' || (currentStage && m.stageName.toLowerCase().includes(currentStage.toLowerCase()));
          const isDelayed = m.status === 'DELAYED';

          let bg = 'bg-stone-300 dark:bg-slate-700';
          if (isDone) bg = 'bg-emerald-500';
          else if (isDelayed) bg = 'bg-rose-500';
          else if (isCurrent) bg = 'bg-brand-500 animate-pulse';

          return (
            <div
              key={m.id}
              className={`h-full border-r border-white/60 dark:border-slate-900/60 ${bg} transition-all`}
              style={{ width: `${100 / milestones.length}%` }}
              title={`${m.stageName}: ${m.status}`}
            />
          );
        })}
      </div>

      {/* Milestone Cards / Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
        {milestones.map((m) => {
          const isDone = m.status === 'COMPLETED';
          const isCurrent = m.status === 'IN_PROGRESS' || (currentStage && m.stageName.toLowerCase().includes(currentStage.toLowerCase()));
          const isDelayed = m.status === 'DELAYED';

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200'
                  : isDelayed
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 text-slate-800 dark:text-slate-200 shadow-xs'
                  : isCurrent
                  ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 ring-2 ring-brand-500/20 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'bg-white dark:bg-slate-800/70 border-stone-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                  {m.sequenceOrder}. {m.stageName}
                </span>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                {isCurrent && <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin-slow flex-shrink-0" />}
                {isDelayed && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Target: {m.targetQty.toLocaleString()}</span>
                <span className={`font-semibold ${isDone ? 'text-emerald-700 dark:text-emerald-400' : isCurrent ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  Done: {m.completedQty.toLocaleString()}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-stone-200/90 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    isDone ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500' : 'bg-brand-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round(((m.completedQty || 0) / (m.targetQty || 1)) * 100))}%`,
                  }}
                />
              </div>

              <div className="mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between font-mono">
                <span>Start: {m.plannedStartDate}</span>
                <span>Due: {m.plannedEndDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
