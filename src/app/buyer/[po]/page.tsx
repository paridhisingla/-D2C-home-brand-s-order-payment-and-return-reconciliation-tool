'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  RefreshCw,
  Camera,
  History,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { TnaTimeline } from '@/components/TnaTimeline';

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.po}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.order);
      })
      .finally(() => setLoading(false));
  }, [params.po]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400 dark:text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600 dark:text-brand-400" />
        Loading buyer PO details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">PO not found</h2>
        <Link href="/buyer" className="text-xs text-brand-600 dark:text-brand-400 font-bold underline">
          Return to Buyer Portal
        </Link>
      </div>
    );
  }

  // Filter only merchandiser-confirmed logs for buyer visibility
  const verifiedLogs = (order.productionLogs || []).filter((l: any) => l.merchandiserConfirmed);
  const completionPct = Math.min(
    100,
    Math.round(((order.currentStageQuantity || 0) / (order.totalQuantity || 1)) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/buyer"
            className="p-2.5 rounded-xl border border-stone-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{order.poNumber}</h1>
              <StatusBadge status={order.statusColor} size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Style: <strong className="text-slate-800 dark:text-slate-200">{order.styleName}</strong> ({order.styleCode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/export?buyerCompanyId=${order.buyerId}`}
            download
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 border border-stone-200/90 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 border border-stone-200/90 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* PO Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Order Quantity</span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1 block">{order.totalQuantity.toLocaleString()} pcs</span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Completed Output</span>
          <span className="text-xl font-black text-brand-600 dark:text-brand-400 mt-1 block">
            {order.currentStageQuantity.toLocaleString()} pcs ({completionPct}%)
          </span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Ex-Factory Date</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1 block">{order.exFactoryDate}</span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Ship Target Week</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1 block">{order.shipWeek}</span>
        </div>
      </div>

      {/* TNA Milestones Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Time-and-Action (TNA) Manufacturing Timeline
        </h2>
        <TnaTimeline milestones={order.milestones} currentStage={order.currentStage} />
      </div>

      {/* Verified Floor Notes & Photo Evidence */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Verified Factory Floor Updates & Photo Evidence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Photos and notes validated by our merchandising team prior to publication
          </p>
        </div>

        {verifiedLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-stone-200 dark:border-slate-800 rounded-xl">
            No published daily updates yet. Merchandiser team confirms each log before it displays in your portal.
          </div>
        ) : (
          <div className="space-y-4">
            {verifiedLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-5 rounded-xl border border-stone-200/90 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/40 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 dark:border-slate-700/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{log.stage} Stage</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{log.date}</span>
                  </div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified by Merchandiser
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Status Update:</span>{' '}
                      {log.merchandiserComments || log.aiEnglishTranslation}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Reason Category: <strong className="text-slate-800 dark:text-slate-200">{log.merchandiserOverrideCategory || log.aiReasonCategory || 'Standard Output'}</strong>
                    </div>
                  </div>

                  {log.photoUrl && (
                    <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-slate-700 h-32 bg-stone-100 dark:bg-slate-800 shadow-2xs">
                      <img
                        src={log.photoUrl}
                        alt="Factory floor photo proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Audit History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Compliance Date Revision Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official immutable record of agreed delivery schedule changes
          </p>
        </div>

        {order.dateAudits && order.dateAudits.length > 0 ? (
          <div className="space-y-3">
            {order.dateAudits.map((a: any) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-stone-200/90 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 dark:text-slate-100">
                    Revised from <span className="font-mono text-rose-600 dark:text-rose-400">{a.oldDate}</span> to{' '}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{a.newDate}</span>
                  </span>
                  <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px]">
                    {new Date(a.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Formal Reason:</span> {a.reason}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-stone-200 dark:border-slate-800 rounded-xl">
            Order remains on original contract schedule. Zero date adjustments.
          </div>
        )}
      </div>
    </div>
  );
}
