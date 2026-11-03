'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  FileText,
  Printer,
  Edit3,
  ExternalLink,
  RefreshCw,
  Camera,
  CheckSquare,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { RunRateBreakdown } from '@/components/RunRateBreakdown';
import { TnaTimeline } from '@/components/TnaTimeline';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Date Change Modal State
  const [showDateModal, setShowDateModal] = useState(false);
  const [newExDate, setNewExDate] = useState('');
  const [formalReason, setFormalReason] = useState('');
  const [isSubmittingDate, setIsSubmittingDate] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setNewExDate(data.order.exFactoryDate);
      }
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleDateChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formalReason.trim()) {
      alert('Formal reason required for buyer compliance audit');
      return;
    }

    setIsSubmittingDate(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newExFactoryDate: newExDate,
          formalReason: formalReason.trim(),
          changedByName: 'Karthik Subramanian (Merchandiser)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowDateModal(false);
        setFormalReason('');
        await fetchOrder();
        alert('Ex-factory date updated and recorded in compliance audit log!');
      } else {
        alert(data.error || 'Failed to update date');
      }
    } catch (err) {
      alert('Error updating date');
    } finally {
      setIsSubmittingDate(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400 dark:text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600 dark:text-brand-400" />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Order not found</h2>
        <Link href="/orders" className="text-xs text-brand-600 dark:text-brand-400 font-bold underline">
          Return to Order Board
        </Link>
      </div>
    );
  }

  const completionPct = Math.min(
    100,
    Math.round(((order.currentStageQuantity || 0) / (order.totalQuantity || 1)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2.5 rounded-xl border border-stone-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{order.poNumber}</h1>
              <StatusBadge status={order.statusColor} size="md" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {order.buyerName} • Style: {order.styleName} ({order.styleCode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Date Action */}
          <button
            onClick={() => setShowDateModal(true)}
            className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Revise Ex-Factory Date</span>
          </button>

          {/* Quick link to buyer portal view */}
          <Link
            href={`/buyer/${order.poNumber}`}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200/90 dark:border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buyer View</span>
          </Link>

          {/* Print / Export Report */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200/90 dark:border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* Primary Run-Rate Calculation Math Breakdown */}
      <RunRateBreakdown runRateDetails={order.runRateDetails} orderValueInr={order.orderValueInr} />

      {/* Specifications & Commercials Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Commercial Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Buyer:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{order.buyerName} ({order.buyerCountry})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Assigned Unit:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{order.unitName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Order Quantity:</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{order.totalQuantity.toLocaleString()} pcs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Commercial Value:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">₹{(order.orderValueInr / 100000).toFixed(2)} Lakh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ship Week:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order.shipWeek}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Production & Velocity Status
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Stage:</span>
              <span className="font-bold text-brand-700 dark:text-brand-400">{order.currentStage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Stage Output Done:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {order.currentStageQuantity.toLocaleString()} / {order.totalQuantity.toLocaleString()} pcs ({completionPct}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ex-Factory Date:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{order.exFactoryDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Working Days Left:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{order.runRateDetails?.daysRemaining} days (excl. Sun)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Pace Deficit:</span>
              <span className={`font-bold ${order.runRateDeficit > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {order.runRateDeficit > 0 ? `-${order.runRateDeficit} pcs/day` : 'Pace healthy'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Fabric & Garment Tech Specs
          </h3>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Fabric:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{order.fabricDescription}</span>
            </div>
            <div className="pt-2 border-t border-stone-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1.5 font-bold">Size Breakdown:</span>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                {order.sizeBreakdown?.map((sb: any, idx: number) => (
                  <div key={idx} className="bg-stone-50 dark:bg-slate-800/70 p-1.5 rounded-xl border border-stone-200/90 dark:border-slate-700 text-[11px]">
                    <span className="block text-slate-400 dark:text-slate-500 font-bold">{sb.size}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{sb.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time-and-Action (TNA) Milestone Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Time-and-Action (TNA) Milestones Progress
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Current Stage: <strong className="text-brand-600 dark:text-brand-400">{order.currentStage}</strong>
          </span>
        </div>
        <TnaTimeline milestones={order.milestones} currentStage={order.currentStage} />
      </div>

      {/* Date Change Compliance Audit History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Buyer Compliance Audit: Ex-Factory Date Revisions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mandatory history demanded by UK & EU buyer compliance audits
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-stone-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-stone-200/60 dark:border-slate-700">
            {order.dateAudits?.length || 0} revisions recorded
          </span>
        </div>

        {order.dateAudits && order.dateAudits.length > 0 ? (
          <div className="space-y-2.5">
            {order.dateAudits.map((audit: any) => (
              <div
                key={audit.id}
                className="p-4 rounded-xl border border-stone-200/90 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    Target shifted: <span className="font-mono text-rose-600 dark:text-rose-400">{audit.oldDate}</span> →{' '}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{audit.newDate}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">({audit.daysDiff > 0 ? `+${audit.daysDiff} days extension` : `${audit.daysDiff} days`})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Formal Reason:</span> {audit.reason}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Logged by: <span className="font-semibold text-slate-700 dark:text-slate-300">{audit.changedBy}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center border border-dashed border-stone-200 dark:border-slate-800 rounded-xl">
            No date changes recorded. Order remains on its original contract ex-factory date ({order.originalExFactoryDate || order.exFactoryDate}).
          </div>
        )}
      </div>

      {/* Floor Daily Logs with AI Translation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Supervisor Floor Production Logs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily counts, photo evidence, and AI Tamil translation review
            </p>
          </div>
          <Link
            href="/supervisor"
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-bold flex items-center gap-1"
          >
            + Add Floor Update
          </Link>
        </div>

        {order.productionLogs && order.productionLogs.length > 0 ? (
          <div className="space-y-3">
            {order.productionLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-stone-300 dark:hover:border-slate-700 transition text-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{log.stage}</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{log.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-stone-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-stone-200/60 dark:border-slate-700">
                      +{log.quantityProduced.toLocaleString()} pcs
                    </span>
                    {log.rejectedQuantity > 0 && (
                      <span className="font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
                        {log.rejectedQuantity} defects
                      </span>
                    )}
                    {log.merchandiserConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Needs Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Side-by-side Tamil Floor Note & AI Translation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-stone-200/80 dark:border-slate-700">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Original Floor Note (Tamil):
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">
                      {log.originalTamilNote || 'No text issue reported'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>AI English Translation & Categorization:</span>
                      <span className="font-mono text-brand-700 dark:text-brand-400 font-bold">
                        {Math.round((log.aiConfidence || 0.9) * 100)}% confidence
                      </span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200">
                      {log.aiEnglishTranslation || 'Standard production pace'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="font-bold text-brand-800 dark:text-brand-300 bg-brand-100/70 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-md text-[10px] border border-brand-200/60 dark:border-brand-800">
                        Category: {log.merchandiserOverrideCategory || log.aiReasonCategory || 'Standard'}
                      </span>
                      {log.merchandiserOverrideCategory && (
                        <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                          (Overridden by Merchandiser)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {log.merchandiserComments && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60">
                    <span className="font-bold text-blue-900 dark:text-blue-300">Merchandiser Action:</span>{' '}
                    {log.merchandiserComments}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center border border-dashed border-stone-200 dark:border-slate-800 rounded-xl">
            No production logs recorded yet for this order.
          </div>
        )}
      </div>

      {/* Date Change Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200/90 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Revise Ex-Factory Target Date
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Every date alteration is permanently stamped into the compliance audit log.
              </p>
            </div>

            <form onSubmit={handleDateChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Target Date
                </label>
                <input
                  type="text"
                  disabled
                  value={order.exFactoryDate}
                  className="w-full text-xs p-2.5 bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl font-mono text-slate-500 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Agreed Ex-Factory Date *
                </label>
                <input
                  type="date"
                  required
                  value={newExDate}
                  onChange={(e) => setNewExDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Formal Reason for Extension (Buyer Compliance Required) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Yarn lot delivered 4 days late from Arulpuram spinning mill due to unseasonal rain. Formal waiver requested."
                  value={formalReason}
                  onChange={(e) => setFormalReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDate}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition"
                >
                  {isSubmittingDate ? 'Saving...' : 'Commit Revision & Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
