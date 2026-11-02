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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
        Loading buyer PO details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">PO not found</h2>
        <Link href="/buyer" className="text-xs text-brand-600 font-semibold underline">
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
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{order.poNumber}</h1>
              <StatusBadge status={order.statusColor} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Style: <strong className="text-slate-800">{order.styleName}</strong> ({order.styleCode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/export?buyerCompanyId=${order.buyerId}`}
            download
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg shadow-xs transition"
          >
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* PO Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Order Quantity</span>
          <span className="text-lg font-bold text-slate-900">{order.totalQuantity.toLocaleString()} pcs</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Completed Output</span>
          <span className="text-lg font-bold text-brand-600">
            {order.currentStageQuantity.toLocaleString()} pcs ({completionPct}%)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Ex-Factory Date</span>
          <span className="text-lg font-bold font-mono text-slate-900">{order.exFactoryDate}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Ship Target Week</span>
          <span className="text-lg font-bold font-mono text-slate-900">{order.shipWeek}</span>
        </div>
      </div>

      {/* TNA Milestones Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Time-and-Action (TNA) Manufacturing Timeline
        </h2>
        <TnaTimeline milestones={order.milestones} currentStage={order.currentStage} />
      </div>

      {/* Verified Floor Notes & Photo Evidence */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verified Factory Floor Updates & Photo Evidence
          </h2>
          <p className="text-xs text-slate-500">
            Photos and notes validated by our merchandising team prior to publication
          </p>
        </div>

        {verifiedLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">{log.stage}</span>
                  <span className="font-mono text-slate-500">{log.date}</span>
                </div>

                <div className="flex items-baseline justify-between text-slate-700">
                  <span>Batch Output:</span>
                  <span className="font-bold text-slate-900">+{log.quantityProduced.toLocaleString()} pcs</span>
                </div>

                {log.aiEnglishTranslation && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                    <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">
                      Status Note:
                    </span>
                    {log.aiEnglishTranslation}
                  </div>
                )}

                {log.merchandiserComments && (
                  <div className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded border border-blue-100">
                    <strong>Merchandiser Verified:</strong> {log.merchandiserComments}
                  </div>
                )}

                {/* Supervisor Floor Photo Evidence */}
                {log.photoUrl && (
                  <div className="pt-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-brand-600" />
                      Floor Photo Evidence
                    </span>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 h-40 bg-slate-100">
                      <img
                        src={log.photoUrl}
                        alt="Floor verification"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-lg">
            No published status disruptions. Production progressing normally on schedule.
          </div>
        )}
      </div>

      {/* Date Change Compliance Audit History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-600" />
              Compliance History: Ex-Factory Target Date Revisions
            </h2>
            <p className="text-xs text-slate-500">
              Contractual history required for UK & EU sourcing compliance
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {order.dateAudits?.length || 0} revisions
          </span>
        </div>

        {order.dateAudits && order.dateAudits.length > 0 ? (
          <div className="space-y-2.5">
            {order.dateAudits.map((audit: any) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>
                    Revised from <span className="font-mono text-rose-600">{audit.oldDate}</span> to{' '}
                    <span className="font-mono text-emerald-600">{audit.newDate}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-700">
                  <strong>Formal Reason:</strong> {audit.reason}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
            No date revisions. Order is manufacturing on its initial contract date ({order.originalExFactoryDate || order.exFactoryDate}).
          </div>
        )}
      </div>
    </div>
  );
}
