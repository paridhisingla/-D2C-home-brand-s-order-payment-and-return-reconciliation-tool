import React, { useState } from 'react';
import { AlertTriangle, Calculator, Clock, DollarSign, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface RunRateBreakdownProps {
  runRateDetails: any;
  orderValueInr?: number;
}

export const RunRateBreakdown: React.FC<RunRateBreakdownProps> = ({
  runRateDetails,
  orderValueInr = 2100000,
}) => {
  const [showMathDetails, setShowMathDetails] = useState(false);

  if (!runRateDetails) return null;

  const {
    piecesRemaining,
    daysRemaining,
    piecesNeededPerDay,
    piecesMadePerDay,
    runRateDeficit,
    projectedDelayDays,
    statusColor,
    financialRisk,
    formulaBreakdown,
  } = runRateDetails;

  const isLagging = runRateDeficit > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className={`px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
        statusColor === 'RED'
          ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
          : statusColor === 'AMBER'
          ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
          : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            statusColor === 'RED'
              ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
              : statusColor === 'AMBER'
              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
          }`}>
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">
                Run-Rate Projection & Delay Warning Engine
              </h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                statusColor === 'RED'
                  ? 'bg-rose-600 text-white'
                  : statusColor === 'AMBER'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {statusColor === 'RED' ? 'CRITICAL DEFICIT' : statusColor === 'AMBER' ? 'PACE WARNING' : 'HEALTHY PACE'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Live mathematical evaluation calibrated to Tiruppur 6-day factory schedule (Mon-Sat, Sun off)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMathDetails(!showMathDetails)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-stone-200/90 dark:border-slate-700 shadow-2xs transition"
        >
          <span>{showMathDetails ? 'Hide Formula Maths' : 'Show Arithmetic Formula'}</span>
          {showMathDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pieces Needed */}
        <div className="bg-stone-50/80 dark:bg-slate-800/60 rounded-xl p-4 border border-stone-200/90 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Required Pace</div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{piecesNeededPerDay.toLocaleString()}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pcs/day</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            To finish {piecesRemaining.toLocaleString()} pcs in {daysRemaining} days
          </p>
        </div>

        {/* Pieces Made */}
        <div className={`rounded-xl p-4 border ${
          isLagging
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
        }`}>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actual Output</div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${isLagging ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
              {piecesMadePerDay.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pcs/day</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rolling floor supervisor log average
          </p>
        </div>

        {/* Shortfall / Surplus */}
        <div className={`rounded-xl p-4 border ${
          runRateDeficit > 0
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
        }`}>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {runRateDeficit > 0 ? 'Daily Shortfall' : 'Daily Surplus'}
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${runRateDeficit > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {runRateDeficit > 0 ? `-${runRateDeficit.toLocaleString()}` : `+${Math.abs(runRateDeficit).toLocaleString()}`}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pcs/day</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {runRateDeficit > 0 ? 'Accumulating backlog each shift' : 'Ahead of buyer delivery schedule'}
          </p>
        </div>

        {/* Projected Delay */}
        <div className={`rounded-xl p-4 border ${
          projectedDelayDays >= 4
            ? 'bg-rose-100/70 dark:bg-rose-950/50 border-rose-300 dark:border-rose-900/70'
            : projectedDelayDays > 0
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
        }`}>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projected Delay</div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${
              projectedDelayDays >= 4
                ? 'text-rose-700 dark:text-rose-400'
                : projectedDelayDays > 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {projectedDelayDays}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">working days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {projectedDelayDays > 0 ? `Est. delivery: ${runRateDetails.projectedCompletionDate}` : 'On schedule'}
          </p>
        </div>
      </div>

      {/* Financial Risk Alert Banner */}
      {financialRisk && financialRisk.totalAtRisk > 0 && (
        <div className="mx-5 mb-5 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <div className="font-bold text-rose-900 dark:text-rose-200">
                Financial Exposure: ₹{(financialRisk.totalAtRisk / 100000).toFixed(2)} Lakh at Risk
              </div>
              <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                {financialRisk.riskSummary}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-rose-800 dark:text-rose-200">
                {financialRisk.potentialAirFreightPenalty > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold bg-rose-100/90 dark:bg-rose-900/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                    ✈️ Sea-to-Air Freight: ₹3,50,000
                  </span>
                )}
                {financialRisk.potentialDiscountPenalty > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold bg-amber-100/90 dark:bg-amber-900/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                    📉 5% Late Discount: ₹{(financialRisk.potentialDiscountPenalty / 100000).toFixed(2)} Lakh
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Arithmetic Breakdown (Toggleable) */}
      {showMathDetails && formulaBreakdown && (
        <div className="px-5 pb-5 pt-3 border-t border-stone-200/80 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/50">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Transparent Arithmetic Walkthrough
          </h4>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-950 p-4 rounded-xl border border-stone-200/90 dark:border-slate-800">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Step 1 (Remaining Volume):</span>{' '}
              <span className="font-semibold">{formulaBreakdown.remainingPcsStep}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Step 2 (Calendar Window):</span>{' '}
              <span className="font-semibold">{formulaBreakdown.workingDaysStep}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Step 3 (Required Velocity):</span>{' '}
              <span className="font-semibold">{formulaBreakdown.requiredRateStep}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Step 4 (Observed Velocity):</span>{' '}
              <span className="font-semibold">{formulaBreakdown.actualRateStep}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Step 5 (Deficit Balance):</span>{' '}
              <span className={`font-bold ${runRateDeficit > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formulaBreakdown.deficitStep}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Step 6 (Projected Completion):</span>{' '}
              <span className="font-semibold">{formulaBreakdown.projectedCompletionStep}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
