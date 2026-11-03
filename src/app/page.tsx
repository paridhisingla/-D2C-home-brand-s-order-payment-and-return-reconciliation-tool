import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Eye,
  Calculator,
  Languages,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';
import { getOrders } from '@/lib/db';
import { StatusBadge } from '@/components/StatusBadge';
import { Logo } from '@/components/Logo';

export default async function HomePage() {
  const orders = await getOrders({});

  // Macro metrics calculated from orders
  const totalOrders = orders.length;
  const redOrders = orders.filter((o) => o.statusColor === 'RED').length;
  const amberOrders = orders.filter((o) => o.statusColor === 'AMBER').length;
  const greenOrders = orders.filter((o) => o.statusColor === 'GREEN').length;
  const totalAtRisk = orders.reduce((sum, o) => sum + (o.totalAtRisk || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Client Context Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Company A • Tiruppur Knitwear Exporter
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Stop ₹1.08 Crore Annual Late Delivery Losses with Real-Time Run-Rate Warnings
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminating Excel-chasing and phone tag between 12 merchandisers and 3 factories.
            Supervisors enter daily floor counts in Tamil on budget smartphones with offline sync.
            Algorithms flag delay warnings <strong>2 weeks early</strong>—not 2 days before sea-to-air freight penalties hit.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700/80">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">500</div>
              <div className="text-xs text-slate-400">Orders/Year (₹21L avg)</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-rose-400">8% → 5%</div>
              <div className="text-xs text-slate-400">Late Shipment Target</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300">₹1.08 Cr</div>
              <div className="text-xs text-slate-400">Current Yearly Loss</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">50%</div>
              <div className="text-xs text-slate-400">Merchandiser Time Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Choose Persona / Role Starting Points */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Explore by User Persona</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Test the end-to-end flows built specifically for each stakeholder in the brief
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Persona 1: Merchandiser */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xl font-bold border border-brand-200/60 dark:border-brand-800">
                👔
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Merchandiser</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Full control: Order Board with Green/Amber/Red status, run-rate math breakdown, order setup wizard, and date change audit compliance.
                </p>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Order Board with Buyer/Unit filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Run-rate deficit calculation engine
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Setup new PO with TNA template
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 dark:border-slate-800 flex gap-2">
              <Link
                href="/orders"
                className="flex-1 text-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-xs"
              >
                Launch Order Board →
              </Link>
              <Link
                href="/orders/new"
                className="bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition border border-stone-200 dark:border-slate-700"
              >
                New PO
              </Link>
            </div>
          </div>

          {/* Persona 2: Unit Supervisor (Mobile/Tamil) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-200/60 dark:border-amber-800">
                📱
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Unit Supervisor (Floor)</h3>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    தமிழ் Interface
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Engineered for 2-3 GB RAM Android phones on patchy networks. Daily quantities, photo proof, voice note & offline queue.
                </p>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Daily quantity & defect entries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Tamil voice recorder & presets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Local offline queue with sync badge
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 dark:border-slate-800">
              <Link
                href="/supervisor"
                className="w-full block text-center bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-xs"
              >
                Open Floor Mobile Update →
              </Link>
            </div>
          </div>

          {/* Persona 3: Sourcing Buyer Portal */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xl font-bold border border-indigo-200/60 dark:border-indigo-800">
                🇬🇧
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Buyer Portal (Read-Only)</h3>
                  <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                    Strict Isolation
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforces zero data leak between buyers. UK and EU buyers view their own milestones, photos, and compliance date audit trail.
                </p>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  TNA timeline & photo evidence
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Verified merchandiser notes only
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  Date change audit compliance history
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 dark:border-slate-800 flex gap-2">
              <Link
                href="/buyer?company=buyer-b-uk"
                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-xs"
              >
                Company B (UK)
              </Link>
              <Link
                href="/buyer?company=buyer-c-de"
                className="flex-1 text-center bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-xs"
              >
                Company C (DE)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sample Data Quick Glance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Seeded Client Sample Data</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live status evaluated from floor logs and run-rate delay projection engine
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
          >
            View Full Order Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-stone-200/90 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5 font-bold">PO Number</th>
                <th className="py-3 px-3.5 font-bold">Buyer</th>
                <th className="py-3 px-3.5 font-bold">Style</th>
                <th className="py-3 px-3.5 font-bold text-right">Order Qty</th>
                <th className="py-3 px-3.5 font-bold">Stage & Progress</th>
                <th className="py-3 px-3.5 font-bold">Ex-Factory</th>
                <th className="py-3 px-3.5 font-bold">Pace vs Needed</th>
                <th className="py-3 px-3.5 font-bold text-center">Status</th>
                <th className="py-3 px-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
              {orders.map((ord) => {
                const pct = Math.round((ord.currentStageQuantity / ord.totalQuantity) * 100);
                return (
                  <tr key={ord.id} className="hover:bg-stone-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-slate-100">
                      <Link href={`/orders/${ord.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                        {ord.poNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 font-medium">{ord.buyerName}</td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{ord.styleName}</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                      {ord.totalQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {ord.currentStage}: {ord.currentStageQuantity.toLocaleString()} ({pct}%)
                      </div>
                      <div className="w-24 bg-stone-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-brand-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-slate-300">{ord.exFactoryDate}</td>
                    <td className="py-3 px-3.5">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {ord.piecesMadePerDay} / {ord.piecesNeededPerDay} pcs/day
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {ord.projectedDelayDays > 0 ? `${ord.projectedDelayDays}d delay` : 'On track'}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={ord.statusColor} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <Link
                        href={`/orders/${ord.id}`}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-bold"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Deep-Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <span>The Hard Part: Run-Rate Delay Math Engine</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Unlike static spreadsheets that only show whether an order is late on the ship date, our engine computes daily required run-rates:
            <code className="block mt-2 p-2.5 bg-stone-100 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-stone-200 dark:border-slate-700">
              Required Velocity = (Total Qty - Current Stage Qty) / Working Days Left
            </code>
            Excludes Sundays (Tiruppur standard workweek) and alerts merchandisers up to 2 weeks before dispatch to prevent ₹3.5L sea-to-air shift penalties.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <Languages className="w-4 h-4" />
            <span>AI Translation with &ldquo;When AI is Wrong&rdquo; Protocol</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Supervisors talk or type in native Tamil (or Tanglish). Our AI parses floor terminology into standardized textile disruption reasons. When confidence is low or AI makes a mistake:
            the original note sits alongside the translation, merchandisers can change the category, and warnings reach buyers <strong>only after merchandiser confirmation</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
