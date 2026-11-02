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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">Order not found</h2>
        <Link href="/orders" className="text-xs text-brand-600 font-semibold underline">
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
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{order.poNumber}</h1>
              <StatusBadge status={order.statusColor} size="md" />
            </div>
            <p className="text-xs text-slate-500">
              {order.buyerName} • Style: {order.styleName} ({order.styleCode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Date Action */}
          <button
            onClick={() => setShowDateModal(true)}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Revise Ex-Factory Date</span>
          </button>

          {/* Quick link to buyer portal view */}
          <Link
            href={`/buyer/${order.poNumber}`}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buyer View</span>
          </Link>

          {/* Print / Export Report */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition"
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Commercial Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Buyer:</span>
              <span className="font-semibold text-slate-900">{order.buyerName} ({order.buyerCountry})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Unit:</span>
              <span className="font-semibold text-slate-900">{order.unitName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Quantity:</span>
              <span className="font-bold text-slate-900">{order.totalQuantity.toLocaleString()} pcs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Commercial Value:</span>
              <span className="font-semibold text-slate-900">₹{(order.orderValueInr / 100000).toFixed(2)} Lakh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ship Week:</span>
              <span className="font-mono text-slate-800">{order.shipWeek}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Production & Velocity Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Stage:</span>
              <span className="font-bold text-brand-700">{order.currentStage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stage Output Done:</span>
              <span className="font-bold text-slate-900">
                {order.currentStageQuantity.toLocaleString()} / {order.totalQuantity.toLocaleString()} pcs ({completionPct}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ex-Factory Date:</span>
              <span className="font-mono font-bold text-slate-900">{order.exFactoryDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Working Days Left:</span>
              <span className="font-semibold text-slate-900">{order.runRateDetails?.daysRemaining} days (excl. Sun)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pace Deficit:</span>
              <span className={`font-bold ${order.runRateDeficit > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {order.runRateDeficit > 0 ? `-${order.runRateDeficit} pcs/day` : 'Pace healthy'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fabric & Garment Tech Specs
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block">Fabric:</span>
              <span className="font-medium text-slate-800">{order.fabricDescription}</span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block mb-1">Size Breakdown:</span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                {order.sizeBreakdown?.map((sb: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-1 rounded border border-slate-200 text-[11px]">
                    <span className="block text-slate-400 font-semibold">{sb.size}</span>
                    <span className="font-bold text-slate-800">{sb.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time-and-Action (TNA) Milestone Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Time-and-Action (TNA) Milestones Progress
          </h2>
          <span className="text-xs text-slate-500">
            Current Stage: <strong className="text-brand-600">{order.currentStage}</strong>
          </span>
        </div>
        <TnaTimeline milestones={order.milestones} currentStage={order.currentStage} />
      </div>

      {/* Date Change Compliance Audit History */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-600" />
              Buyer Compliance Audit: Ex-Factory Date Revisions
            </h2>
            <p className="text-xs text-slate-500">
              Mandatory history demanded by UK & EU buyer compliance audits
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {order.dateAudits?.length || 0} revisions recorded
          </span>
        </div>

        {order.dateAudits && order.dateAudits.length > 0 ? (
          <div className="space-y-2.5">
            {order.dateAudits.map((audit: any) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">
                    Target shifted: <span className="font-mono text-rose-600">{audit.oldDate}</span> →{' '}
                    <span className="font-mono text-emerald-600 font-bold">{audit.newDate}</span>{' '}
                    <span className="text-slate-500">({audit.daysDiff > 0 ? `+${audit.daysDiff} days extension` : `${audit.daysDiff} days`})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-800">Formal Reason:</span> {audit.reason}
                </div>
                <div className="text-[11px] text-slate-500">
                  Logged by: <span className="font-medium text-slate-700">{audit.changedBy}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
            No date changes recorded. Order remains on its original contract ex-factory date ({order.originalExFactoryDate || order.exFactoryDate}).
          </div>
        )}
      </div>

      {/* Floor Daily Logs with AI Translation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Supervisor Floor Production Logs
            </h2>
            <p className="text-xs text-slate-500">
              Daily counts, photo evidence, and AI Tamil translation review
            </p>
          </div>
          <Link
            href="/supervisor"
            className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
          >
            + Add Floor Update
          </Link>
        </div>

        {order.productionLogs && order.productionLogs.length > 0 ? (
          <div className="space-y-3">
            {order.productionLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition text-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.stage}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-500">{log.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      +{log.quantityProduced.toLocaleString()} pcs
                    </span>
                    {log.rejectedQuantity > 0 && (
                      <span className="font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {log.rejectedQuantity} defects
                      </span>
                    )}
                    {log.merchandiserConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" /> Needs Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Side-by-side Tamil Floor Note & AI Translation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Original Floor Note (Tamil):
                    </div>
                    <div className="text-slate-800 font-medium">
                      {log.originalTamilNote || 'No text issue reported'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>AI English Translation & Categorization:</span>
                      <span className="font-mono text-brand-700">
                        {Math.round((log.aiConfidence || 0.9) * 100)}% confidence
                      </span>
                    </div>
                    <div className="text-slate-800">
                      {log.aiEnglishTranslation || 'Standard production pace'}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-semibold text-brand-800 bg-brand-100/70 px-2 py-0.5 rounded text-[10px]">
                        Category: {log.merchandiserOverrideCategory || log.aiReasonCategory || 'Standard'}
                      </span>
                      {log.merchandiserOverrideCategory && (
                        <span className="text-[10px] text-purple-700 font-medium">
                          (Overridden by Merchandiser)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {log.merchandiserComments && (
                  <div className="text-[11px] text-slate-600 bg-blue-50/60 p-2 rounded border border-blue-100">
                    <span className="font-semibold text-blue-900">Merchandiser Action:</span>{' '}
                    {log.merchandiserComments}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
            No production logs recorded yet for this order.
          </div>
        )}
      </div>

      {/* Date Change Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Revise Ex-Factory Target Date
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Every date alteration is permanently stamped into the compliance audit log.
              </p>
            </div>

            <form onSubmit={handleDateChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Target Date
                </label>
                <input
                  type="text"
                  disabled
                  value={order.exFactoryDate}
                  className="w-full text-xs p-2.5 bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Agreed Ex-Factory Date *
                </label>
                <input
                  type="date"
                  required
                  value={newExDate}
                  onChange={(e) => setNewExDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Formal Reason for Extension (Buyer Compliance Required) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Yarn lot delivered 4 days late from Arulpuram spinning mill due to unseasonal rain. Formal waiver requested."
                  value={formalReason}
                  onChange={(e) => setFormalReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDate}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
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
