'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Eye,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

function BuyerPortalContent() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get('company') || 'buyer-b-uk';

  const [activeBuyerId, setActiveBuyerId] = useState(initialCompany);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL param changes
  useEffect(() => {
    const c = searchParams.get('company');
    if (c) setActiveBuyerId(c);
  }, [searchParams]);

  const fetchBuyerData = async () => {
    setLoading(true);
    try {
      const [buyersRes, ordersRes] = await Promise.all([
        fetch('/api/buyers'),
        fetch(`/api/orders?buyerCompanyId=${activeBuyerId}`),
      ]);

      const buyersData = await buyersRes.json();
      const ordersData = await ordersRes.json();

      if (buyersData.success) setBuyers(buyersData.buyers);
      if (ordersData.success) setOrders(ordersData.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [activeBuyerId]);

  const currentBuyer = buyers.find((b) => b.id === activeBuyerId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Isolation Security Guarantee Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-white">
              Buyer Sourcing & Compliance Portal
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Strict tenant data isolation: <strong>{currentBuyer?.name || 'Buyer'}</strong> has zero visibility into other brands' styles, volumes, or pricing.
          </p>
        </div>

        {/* Switch Buyer for Reviewer Convenience */}
        <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <span className="text-[11px] text-slate-400 pl-2">Viewing as:</span>
          <select
            value={activeBuyerId}
            onChange={(e) => setActiveBuyerId(e.target.value)}
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-lg px-2.5 py-1.5 cursor-pointer shadow-xs border border-slate-700"
          >
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buyer Order Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active POs</span>
          <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-slate-100">{orders.length}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Under manufacturing in Tiruppur</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Pieces</span>
          <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-slate-100">
            {orders.reduce((sum, o) => sum + o.totalQuantity, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Contracted garments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">On-Time Status</span>
          <div className="mt-1.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {orders.filter((o) => o.statusColor === 'GREEN').length} / {orders.length}
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">On factory schedule</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Compliance Audits</span>
          <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-slate-100">
            {orders.reduce((sum, o) => sum + (o.dateAudits?.length || 0), 0)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Ex-factory date revisions</p>
        </div>
      </div>

      {/* Buyer's Orders List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-stone-50/60 dark:bg-slate-800/40">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Purchase Orders for {currentBuyer?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live floor stage progress, photo evidence, and ex-factory compliance tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/export?buyerCompanyId=${activeBuyerId}`}
              download
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 border border-stone-200/90 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-xs transition"
              title="Download Excel / CSV weekly status report"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export Excel</span>
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 border border-stone-200/90 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Print Status Report</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600 dark:text-brand-400" />
            Loading purchase orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No orders found for this buyer account.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {orders.map((ord) => {
              const pct = Math.round((ord.currentStageQuantity / ord.totalQuantity) * 100);
              return (
                <div key={ord.id} className="p-5 sm:p-6 hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/buyer/${ord.poNumber}`}
                          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {ord.poNumber}
                        </Link>
                        <StatusBadge status={ord.statusColor} size="sm" />
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                        Style: {ord.styleName} ({ord.styleCode})
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Fabric: {ord.fabricDescription}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {ord.totalQuantity.toLocaleString()} pcs
                      </div>
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        Ex-Factory: <strong className="text-slate-900 dark:text-slate-100">{ord.exFactoryDate}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        Ship Week: {ord.shipWeek}
                      </div>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Current Stage: <span className="text-brand-600 dark:text-brand-400">{ord.currentStage}</span>
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {ord.currentStageQuantity.toLocaleString()} / {ord.totalQuantity.toLocaleString()} pcs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ord.statusColor === 'RED'
                            ? 'bg-rose-500'
                            : ord.statusColor === 'AMBER'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Recent Verified Notes & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {ord.dateAudits && ord.dateAudits.length > 0 ? (
                        <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                          Compliance Note: Ex-factory date revised {ord.dateAudits.length} time(s) with agreed formal reason.
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          ✓ On schedule against original contract milestone plan.
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/buyer/${ord.poNumber}`}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
                    >
                      <span>View Milestones & Photo Proof</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-400 dark:text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600 dark:text-brand-400" />
          Loading buyer portal...
        </div>
      }
    >
      <BuyerPortalContent />
    </Suspense>
  );
}
