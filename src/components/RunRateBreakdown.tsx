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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Header bar */}
      <div className={`px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
        statusColor === 'RED'
          ? 'bg-rose-50/70 border-rose-200'
          : statusColor === 'AMBER'
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            statusColor === 'RED'
              ? 'bg-rose-100 text-rose-700'
              : statusColor === 'AMBER'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                Run-Rate Projection & Delay Warning Engine
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                statusColor === 'RED'
                  ? 'bg-rose-600 text-white'
                  : statusColor === 'AMBER'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {statusColor === 'RED' ? 'CRITICAL DEFICIT' : statusColor === 'AMBER' ? 'PACE WARNING' : 'HEALTHY PACE'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Live mathematical evaluation calibrated to Tiruppur 6-day factory schedule (Mon-Sat, Sun off)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMathDetails(!showMathDetails)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs hover:bg-slate-50 transition"
        >
          <span>{showMathDetails ? 'Hide Formula Maths' : 'Show Arithmetic Formula'}</span>
          {showMathDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pieces Needed */}
        <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/80">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Required Pace</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{piecesNeededPerDay.toLocaleString()}</span>
            <span className="text-xs text-slate-500">pcs/day</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            To finish {piecesRemaining.toLocaleString()} pcs in {daysRemaining} days
          </p>
        </div>

        {/* Pieces Made */}
        <div className={`rounded-lg p-3.5 border ${
          isLagging ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Actual Output</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${isLagging ? 'text-amber-800' : 'text-emerald-800'}`}>
              {piecesMadePerDay.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">pcs/day</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rolling floor supervisor log average
          </p>
        </div>

        {/* Shortfall / Surplus */}
        <div className={`rounded-lg p-3.5 border ${
          runRateDeficit > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {runRateDeficit > 0 ? 'Daily Shortfall' : 'Daily Surplus'}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${runRateDeficit > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {runRateDeficit > 0 ? `-${runRateDeficit.toLocaleString()}` : `+${Math.abs(runRateDeficit).toLocaleString()}`}
            </span>
            <span className="text-xs text-slate-500">pcs/day</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {runRateDeficit > 0 ? 'Accumulating backlog each shift' : 'Ahead of buyer delivery schedule'}
          </p>
        </div>

        {/* Projected Delay */}
        <div className={`rounded-lg p-3.5 border ${
          projectedDelayDays >= 4 ? 'bg-rose-100/60 border-rose-300' : projectedDelayDays > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Projected Delay</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${
              projectedDelayDays >= 4 ? 'text-rose-700' : projectedDelayDays > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {projectedDelayDays}
            </span>
            <span className="text-xs text-slate-500">working days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {projectedDelayDays > 0 ? `Estimated completion: ${runRateDetails.projectedCompletionDate}` : 'On schedule'}
          </p>
        </div>
      </div>

      {/* Financial Risk Alert Banner */}
      {financialRisk && financialRisk.totalAtRisk > 0 && (
        <div className="mx-5 mb-5 p-4 rounded-lg bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <div className="font-semibold text-rose-900">
                Financial Exposure: ₹{(financialRisk.totalAtRisk / 100000).toFixed(2)} Lakh at Risk
              </div>
              <p className="text-rose-700 mt-0.5">
                {financialRisk.riskSummary}
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-rose-800">
                {financialRisk.potentialAirFreightPenalty > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium bg-rose-100/80 px-2 py-0.5 rounded">
                    ✈️ Sea-to-Air Freight: ₹3,50,000
                  </span>
                )}
                {financialRisk.potentialDiscountPenalty > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium bg-amber-100/80 px-2 py-0.5 rounded">
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
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-brand-600" />
            Transparent Arithmetic Walkthrough
          </h4>
          <div className="space-y-2 text-xs text-slate-700 font-mono bg-white p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400">Step 1 (Remaining Volume):</span>{' '}
              <span className="font-medium">{formulaBreakdown.remainingPcsStep}</span>
            </div>
            <div>
              <span className="text-slate-400">Step 2 (Calendar Window):</span>{' '}
              <span className="font-medium">{formulaBreakdown.workingDaysStep}</span>
            </div>
            <div>
              <span className="text-slate-400">Step 3 (Required Velocity):</span>{' '}
              <span className="font-medium">{formulaBreakdown.requiredRateStep}</span>
            </div>
            <div>
              <span className="text-slate-400">Step 4 (Observed Velocity):</span>{' '}
              <span className="font-medium">{formulaBreakdown.actualRateStep}</span>
            </div>
            <div>
              <span className="text-slate-400">Step 5 (Deficit Balance):</span>{' '}
              <span className={`font-semibold ${runRateDeficit > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formulaBreakdown.deficitStep}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Step 6 (Projected Completion):</span>{' '}
              <span className="font-medium">{formulaBreakdown.projectedCompletionStep}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
