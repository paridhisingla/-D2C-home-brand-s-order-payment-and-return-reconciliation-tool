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
    return <div className="text-xs text-slate-400 py-2">No TNA milestones configured.</div>;
  }

  return (
    <div className="space-y-3">
      {/* Horizontal Overview Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
        {milestones.map((m) => {
          const isDone = m.status === 'COMPLETED';
          const isCurrent = m.status === 'IN_PROGRESS' || (currentStage && m.stageName.toLowerCase().includes(currentStage.toLowerCase()));
          const isDelayed = m.status === 'DELAYED';

          let bg = 'bg-slate-200';
          if (isDone) bg = 'bg-emerald-500';
          else if (isDelayed) bg = 'bg-rose-500';
          else if (isCurrent) bg = 'bg-brand-500 animate-pulse';

          return (
            <div
              key={m.id}
              className={`h-full border-r border-white/50 ${bg} transition-all`}
              style={{ width: `${100 / milestones.length}%` }}
              title={`${m.stageName}: ${m.status}`}
            />
          );
        })}
      </div>

      {/* Milestone Cards / Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
        {milestones.map((m) => {
          const isDone = m.status === 'COMPLETED';
          const isCurrent = m.status === 'IN_PROGRESS' || (currentStage && m.stageName.toLowerCase().includes(currentStage.toLowerCase()));
          const isDelayed = m.status === 'DELAYED';

          return (
            <div
              key={m.id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                  : isDelayed
                  ? 'bg-rose-50/60 border-rose-300 text-slate-800 shadow-xs'
                  : isCurrent
                  ? 'bg-brand-50/60 border-brand-300 ring-2 ring-brand-500/20 text-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-semibold text-slate-900 truncate">
                  {m.sequenceOrder}. {m.stageName}
                </span>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                {isCurrent && <Clock className="w-4 h-4 text-brand-600 animate-spin-slow flex-shrink-0" />}
                {isDelayed && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Target: {m.targetQty.toLocaleString()}</span>
                <span className={`font-medium ${isDone ? 'text-emerald-700' : isCurrent ? 'text-brand-700' : 'text-slate-500'}`}>
                  Done: {m.completedQty.toLocaleString()}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full ${
                    isDone ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500' : 'bg-brand-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round(((m.completedQty || 0) / (m.targetQty || 1)) * 100))}%`,
                  }}
                />
              </div>

              <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
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
