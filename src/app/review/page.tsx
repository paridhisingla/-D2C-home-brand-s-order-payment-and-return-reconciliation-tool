'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Send,
  Eye,
} from 'lucide-react';
import { PRODUCTION_REASON_CATEGORIES } from '@/lib/aiClassifier';

export default function AiReviewQueuePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPending, setFilterPending] = useState(true);

  // Editable overrides per log item
  const [activeOverrides, setActiveOverrides] = useState<Record<string, { category: string; comments: string }>>({});
  const [confirmingLogId, setConfirmingLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleOverrideChange = (logId: string, field: 'category' | 'comments', value: string) => {
    setActiveOverrides((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        [field]: value,
      },
    }));
  };

  const handleConfirmLog = async (log: any) => {
    setConfirmingLogId(log.id);
    const override = activeOverrides[log.id] || {};

    try {
      const res = await fetch(`/api/logs/${log.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed: true,
          overrideCategory: override.category || log.aiReasonCategory,
          comments: override.comments || log.merchandiserComments || 'Verified by merchandiser.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh local list
        await fetchLogs();
      }
    } catch (err) {
      alert('Failed to confirm review');
    } finally {
      setConfirmingLogId(null);
    }
  };

  const displayedLogs = filterPending
    ? logs.filter((l) => !l.merchandiserConfirmed)
    : logs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Merchandiser AI Review Queue</h1>
            <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> "When AI is Wrong" Protocol
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validate supervisor Tamil floor notes and AI categorization. Buyers only receive warnings after merchandiser confirmation.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPending(true)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              filterPending
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Needs Confirmation ({logs.filter((l) => !l.merchandiserConfirmed).length})
          </button>
          <button
            onClick={() => setFilterPending(false)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              !filterPending
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* Main Review Cards List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
          Loading floor logs...
        </div>
      ) : displayedLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">All floor logs verified!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No pending Tamil floor notes require confirmation right now. As unit supervisors submit entries from the floor, they will appear here.
          </p>
          <Link
            href="/supervisor"
            className="inline-block text-xs font-semibold text-brand-600 underline pt-2"
          >
            Submit a test Tamil note from Floor Mobile →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedLogs.map((log) => {
            const isPending = !log.merchandiserConfirmed;
            const conf = Math.round((log.aiConfidence || 0.9) * 100);
            const isLowConf = conf < 75;
            const currentOverride = activeOverrides[log.id] || {
              category: log.merchandiserOverrideCategory || log.aiReasonCategory,
              comments: log.merchandiserComments || '',
            };

            return (
              <div
                key={log.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                  isPending
                    ? 'border-amber-200 ring-2 ring-amber-500/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/orders/${log.orderId}`}
                      className="font-bold text-sm text-slate-900 hover:text-brand-600 flex items-center gap-1.5"
                    >
                      <span>{log.orderPoNumber || log.poNumber}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <span className="text-xs text-slate-500">
                      {log.orderStyleName || 'Knitwear Style'} • Stage: <strong>{log.stage}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">{log.date}</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      +{log.quantityProduced.toLocaleString()} pcs
                    </span>
                    {log.rejectedQuantity > 0 && (
                      <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {log.rejectedQuantity} defects
                      </span>
                    )}
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Pending Buyer Quarantine
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed for Buyer
                      </span>
                    )}
                  </div>
                </div>

                {/* Side-by-side Note and AI Translation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Tamil Floor Note */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Supervisor Original Note (Tamil / Tanglish):
                    </div>
                    <div className="text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                      {log.originalTamilNote || '(No text note provided - numeric log)'}
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Logged from floor unit • Untampered raw floor transcript
                    </div>
                  </div>

                  {/* Right: AI English Translation & Classification */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLowConf ? 'bg-amber-50/50 border-amber-200' : 'bg-brand-50/40 border-brand-200'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-brand-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-600" />
                        AI English Translation:
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono ${
                        isLowConf ? 'bg-amber-200 text-amber-900' : 'bg-brand-200 text-brand-900'
                      }`}>
                        {conf}% AI Confidence
                      </span>
                    </div>

                    <div className="text-sm text-slate-900 font-medium leading-relaxed">
                      {log.aiEnglishTranslation}
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-500">Predicted Category:</span>
                      <span className="font-bold text-brand-800 bg-white px-2 py-0.5 rounded border border-brand-200">
                        {log.aiReasonCategory}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Merchandiser Override & Confirmation Controls */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4">
                  {/* Category Override Select */}
                  <div className="w-full md:w-1/3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Merchandiser Verified Category:
                    </label>
                    <select
                      value={currentOverride.category}
                      onChange={(e) => handleOverrideChange(log.id, 'category', e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                    >
                      {PRODUCTION_REASON_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Merchandiser Action Note */}
                  <div className="w-full md:w-1/2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Merchandiser Resolution / Action Comments:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Technician replaced looper; 2 lines restarted"
                      value={currentOverride.comments}
                      onChange={(e) => handleOverrideChange(log.id, 'comments', e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Confirm & Publish Button */}
                  <div className="w-full md:w-auto md:self-end">
                    <button
                      onClick={() => handleConfirmLog(log)}
                      disabled={confirmingLogId === log.id}
                      className="w-full md:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {confirmingLogId === log.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{isPending ? 'Confirm & Publish to Buyer' : 'Update Verified Note'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
