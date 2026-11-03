import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { getOrders, getUnits } from '@/lib/db';
import { StatusBadge } from '@/components/StatusBadge';

export default async function ExecutiveDashboardPage() {
  const [orders, units] = await Promise.all([getOrders({}), getUnits()]);

  const totalOrders = orders.length;
  const redOrders = orders.filter((o) => o.statusColor === 'RED');
  const amberOrders = orders.filter((o) => o.statusColor === 'AMBER');
  const greenOrders = orders.filter((o) => o.statusColor === 'GREEN');

  const totalAtRisk = orders.reduce((sum, o) => sum + (o.totalAtRisk || 0), 0);
  const airFreightRisk = orders.reduce(
    (sum, o) => sum + (o.airFreightRiskAmount || 0),
    0
  );
  const discountRisk = orders.reduce(
    (sum, o) => sum + (o.delayDiscountRiskAmount || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Executive & MD Briefing
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Company A • Tiruppur Operational Loss Prevention
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Real-time financial exposure tracking across 3 own manufacturing units and 2 subcontract vendors.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Live Financial At-Risk</div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              ₹{(totalAtRisk / 100000).toFixed(2)} Lakh
            </div>
            <div className="text-[11px] text-amber-300 font-medium mt-1">
              Target ROI: Save ₹1.08 Cr Annual Late Shipment Leakage
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Pillars of Client ₹1.08 Cr Loss */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Sea-to-Air Freight Shift
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60">
              ₹52.5L / year
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">15 Orders / Year</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            When delay exceeds 4 days, sea shipping misses UK/EU store launch windows, forcing air freight at ₹3.5 lakh extra per PO.
          </p>
          <div className="pt-2 text-xs font-bold text-rose-700 dark:text-rose-400">
            Current Live Air Risk: ₹{(airFreightRisk / 100000).toFixed(2)} Lakh
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. 5% Buyer Late Discounts
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
              ₹26.25L / year
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">25 Orders / Year</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Buyers enforce 5% penalty deductions on late shipments: 25 orders × ₹1.05 lakh average discount.
          </p>
          <div className="pt-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            Current Live Discount Risk: ₹{(discountRisk / 100000).toFixed(2)} Lakh
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              3. Status-Chasing Waste
            </span>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
              ₹28.8L / year
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">7,200 Hours / Year</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            12 merchandisers spend 2 hours/day on phone calls to floor supervisors tracking counts into Excel sheets.
          </p>
          <div className="pt-2 text-xs font-bold text-brand-700 dark:text-brand-400">
            Target: 50% Time Recovered (3,600 hrs saved)
          </div>
        </div>
      </div>

      {/* Factory Unit Pace & Output Health */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Factory Units & Subcontract Network Status
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Output velocity across 3 own units and specialized Tiruppur printing/washing vendors
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => {
            const unitOrders = orders.filter((o) => o.unitId === unit.id);
            const unitRed = unitOrders.filter((o) => o.statusColor === 'RED').length;
            const unitAmber = unitOrders.filter((o) => o.statusColor === 'AMBER').length;

            return (
              <div
                key={unit.id}
                className="p-4 rounded-xl border border-stone-200/90 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/60 text-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{unit.name}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[11px]">{unit.location}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    unit.type === 'OWN_FACTORY'
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  }`}>
                    {unit.type === 'OWN_FACTORY' ? 'Own Unit' : 'Subcontract'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Daily Piece Capacity:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{unit.dailyCapacityPieces.toLocaleString()} pcs/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Allocated POs:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{unitOrders.length} orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Delay Warning Orders:</span>
                    <span className={`font-bold ${unitRed > 0 ? 'text-rose-600 dark:text-rose-400' : unitAmber > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {unitRed > 0 ? `${unitRed} Critical RED` : unitAmber > 0 ? `${unitAmber} Amber` : 'All On Track'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Orders Demanding MD Intervention */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Critical Red Attention Orders (2 Weeks Ahead)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Orders requiring immediate unit reallocation or supervisor intervention to prevent air freight
            </p>
          </div>
          <Link
            href="/orders?statusColor=RED"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
          >
            <span>View all in Order Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {redOrders.length > 0 ? (
          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {redOrders.map((ord) => (
              <div key={ord.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Link href={`/orders/${ord.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                      {ord.poNumber}
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{ord.buyerName}</span>
                    <StatusBadge status="RED" size="sm" />
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {ord.styleName} • Required: {ord.piecesNeededPerDay} pcs/day, Output: {ord.piecesMadePerDay} pcs/day
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-rose-700 dark:text-rose-400">
                    +{ord.projectedDelayDays} Days Projected Delay
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Target Ex-Factory: <strong className="text-slate-800 dark:text-slate-200">{ord.exFactoryDate}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
            No critical delay orders currently detected.
          </div>
        )}
      </div>
    </div>
  );
}
