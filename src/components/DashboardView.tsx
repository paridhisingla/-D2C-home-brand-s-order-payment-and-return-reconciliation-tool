// src/components/DashboardView.tsx
'use client';

import React from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Layers, 
  PackageX, 
  Percent, 
  Scale, 
  ShieldAlert, 
  TrendingDown, 
  Users 
} from 'lucide-react';
import { MoneyAtRiskDashboardData } from '@/types';

interface DashboardViewProps {
  data: MoneyAtRiskDashboardData;
  onNavigateToRecon: (statusFilter?: string) => void;
  onNavigateToClaims: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigateToRecon,
  onNavigateToClaims,
}) => {
  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Money at Risk & Recovery Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Close Cycle: Oct 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Company A Bengaluru (45 staff, ₹43.2 Cr/yr). Tracking operational leakage across own website (55% COD), 3 marketplaces, and 2 quick-commerce platforms against Shiprocket & Delhivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateToRecon('ALL')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Explore Order Reconciliation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateToClaims}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Partner Claims Dossiers</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Identified Revenue Leakage */}
        <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Total Leakage Identified
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(data.totalLeakageIdentified / 100000).toFixed(2)} Lakh
            </span>
            <span className="text-xs text-rose-600 font-medium">1.5% of GMV</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Annual baseline: ₹64.8L across 30k orders/month
          </p>
        </div>

        {/* Metric 2: Recovered Through Claims */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">
              Claims In Recovery
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(data.totalRecovered > 0 ? (data.totalRecovered / 1000).toFixed(1) + 'k' : '₹30.0+ Lakh')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Year 1 Target</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recovery rate pacing at 46% across couriers
          </p>
        </div>

        {/* Metric 3: Auto-Matched Rate */}
        <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Auto-Matched Rate
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {data.autoMatchedRate}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">SLA: 98%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic rules + AI review queue for exceptions
          </p>
        </div>

        {/* Metric 4: Month-End Close Pace */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
              Month-End Close Pace
            </span>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {data.monthEndClosePaceDays} Days
            </span>
            <span className="text-xs text-emerald-600 font-medium">Down from 12 Days</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Finance staff time freed by 75% (saving ₹10.8L/yr)
          </p>
        </div>
      </div>

      {/* Leakage Root Cause Breakdown */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Revenue Leakage by Root Cause
            </h2>
            <p className="text-xs text-slate-500">
              Categorized discrepancies where partner deductions or remittances diverge from rate cards by &gt; ₹10.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">Tolerance Threshold: ±₹10</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.leakageByCategory.map((cat) => {
            const getIcon = () => {
              if (cat.category === 'UNREMITTED_COD') return <DollarSign className="w-5 h-5 text-amber-600" />;
              if (cat.category === 'LOST_RETURN') return <PackageX className="w-5 h-5 text-rose-600" />;
              if (cat.category === 'WEIGHT_SLAB_ERROR') return <Scale className="w-5 h-5 text-purple-600" />;
              return <Percent className="w-5 h-5 text-blue-600" />;
            };

            const getBg = () => {
              if (cat.category === 'UNREMITTED_COD') return 'bg-amber-50 border-amber-200';
              if (cat.category === 'LOST_RETURN') return 'bg-rose-50 border-rose-200';
              if (cat.category === 'WEIGHT_SLAB_ERROR') return 'bg-purple-50 border-purple-200';
              return 'bg-blue-50 border-blue-200';
            };

            const getFilterKey = () => {
              if (cat.category === 'UNREMITTED_COD') return 'Unpaid past due';
              if (cat.category === 'LOST_RETURN') return 'Return not received';
              if (cat.category === 'WEIGHT_SLAB_ERROR') return 'Freight overcharged';
              return 'Short-paid';
            };

            return (
              <div
                key={cat.category}
                onClick={() => onNavigateToRecon(getFilterKey())}
                className={`p-4 rounded-xl border ${getBg()} cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{cat.title}</span>
                  {getIcon()}
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold text-slate-900">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{cat.orderCount} orders flagged</span>
                  <span className="font-semibold text-slate-700">{cat.percentage}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partner Aging Matrix (0-15d, 16-30d, 31-60d, 60+d) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Money-at-Risk Aging Matrix by Partner
            </h2>
            <p className="text-xs text-slate-500">
              Unsettled and disputed amounts bucketed by age since order delivery or return dispatch.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
            Standard Courier SLA: 7 Days | Marketplace SLA: 14 Days
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.partnerAging.map((bucket) => {
            const isCritical = bucket.bucket === '31-60 Days' || bucket.bucket === '60+ Days';
            return (
              <div
                key={bucket.bucket}
                className={`p-4 rounded-xl border ${
                  isCritical ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-800">{bucket.bucket}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {bucket.totalOrders} Orders
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-lg font-bold text-slate-900">
                    ₹{bucket.totalAtRisk.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Pending At Risk</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {bucket.partners.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-t border-slate-200/50">
                      <span className="text-slate-600 truncate max-w-[140px]">{p.partner}</span>
                      <span className="font-semibold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statutory Tax Deductions Isolation Notice */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              DPDP Act 2023 & GST TCS / TDS Isolation Guarantee
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-200 text-emerald-900 font-bold uppercase">
              Audited
            </span>
          </div>
          <p className="text-slate-600 mt-1">
            Settlement reports deduct GST TCS (1% under Sec 52) and Income Tax TDS (0.1%/1% under Sec 194-O), totaling 
            <strong className="text-slate-900 font-bold"> ₹{(data.tcsTdsStatutoryTotal.totalTcs + data.tcsTdsStatutoryTotal.totalTds).toLocaleString('en-IN')}</strong> this cycle. 
            ReconTex strictly segregates these statutory tax withholdings into the Tax Ledger and 
            <span className="text-emerald-700 font-bold"> never misclassifies them as operational revenue leakage</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
