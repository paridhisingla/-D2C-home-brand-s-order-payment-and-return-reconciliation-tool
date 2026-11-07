// src/components/AIReviewQueueView.tsx
'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  Cpu, 
  Filter, 
  HelpCircle, 
  Link as LinkIcon, 
  Search, 
  ShieldAlert, 
  X, 
  XCircle 
} from 'lucide-react';
import { AIReviewItem } from '@/types';

interface AIReviewQueueViewProps {
  items: AIReviewItem[];
  onResolveItem: (itemId: string, action: 'ACCEPT' | 'REJECT' | 'MANUAL_LINK', manualOrderId?: string, note?: string) => void;
}

export const AIReviewQueueView: React.FC<AIReviewQueueViewProps> = ({
  items,
  onResolveItem,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [manualLinkItemId, setManualLinkItemId] = useState<string | null>(null);
  const [manualOrderIdInput, setManualOrderIdInput] = useState<string>('');
  const [auditNoteInput, setAuditNoteInput] = useState<string>('');

  const filteredItems = items.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const handleManualLinkSubmit = (itemId: string) => {
    if (!manualOrderIdInput.trim()) return;
    onResolveItem(itemId, 'MANUAL_LINK', manualOrderIdInput.trim(), auditNoteInput.trim() || undefined);
    setManualLinkItemId(null);
    setManualOrderIdInput('');
    setAuditNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Brief Rule Disclaimer */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Match Review Queue (Missing Order IDs)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-600" /> Human-in-the-Loop
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            When bank remittance or courier statements omit standard Order IDs, AI correlates AWB numbers, payment amounts, and transaction timing to propose candidate matches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="PENDING">Pending Verification ({items.filter(i => i.status === 'PENDING').length})</option>
            <option value="ACCEPTED">Accepted Matches</option>
            <option value="REJECTED">Rejected Matches</option>
            <option value="MANUALLY_LINKED">Manually Linked</option>
            <option value="ALL">All Items ({items.length})</option>
          </select>
        </div>
      </div>

      {/* Mandatory Safety Rule Box */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-purple-950 text-sm">
            Core Brief Protocol: Zero Automatic Settlement Closure
          </h2>
          <p className="text-purple-800 mt-0.5">
            &ldquo;Suggested matches go to a review queue and are <strong>never closed automatically</strong>.&rdquo; 
            Every reconciliation match with a missing order ID requires formal approval or override from a finance executive before updating the ledger.
          </p>
        </div>
      </div>

      {/* Queue Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm text-slate-400 text-xs">
            No items in queue with status &quot;{filterStatus}&quot;.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPending = item.status === 'PENDING';
            const suggested = item.suggestedOrder;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Item Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {item.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 font-medium text-slate-700">
                      Partner: {item.partner}
                    </span>
                    <span className="text-xs text-slate-400">
                      Tx Date: {new Date(item.transactionDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.confidenceScore >= 90
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : (item.confidenceScore >= 75 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700')
                    }`}>
                      {item.confidenceScore}% Match Confidence
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'PENDING'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : (item.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison: Orphaned Remittance vs AI Candidate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Raw Bank Remittance Record */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Incoming Bank / Aggregator Record (Missing Order ID)
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Raw Ref / UTR:</span>
                        <span className="font-mono font-medium text-slate-900">{item.rawPaymentRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">AWB Number:</span>
                        <span className="font-mono font-medium text-slate-900">{item.rawAwb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Credited Amount:</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{item.rawAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Suggested Order Candidate */}
                  <div className="p-3.5 rounded-lg bg-indigo-50/40 border border-indigo-200 text-xs space-y-2">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                      AI Suggested Order Candidate
                    </span>
                    {suggested ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Candidate Order ID:</span>
                          <span className="font-mono font-bold text-indigo-900">{suggested.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Expected Net Payout:</span>
                          <span className="font-mono font-medium text-slate-900">
                            ₹{suggested.expectedReceived.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Channel & SKU:</span>
                          <span className="text-slate-800 font-medium truncate max-w-[180px]">
                            {suggested.channel} • {suggested.sku}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500">
                        Suggested Order: <strong className="text-indigo-900">{item.suggestedOrderId}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Match Signals */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="font-semibold text-slate-700 block">Correlated Match Signals:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {item.matchReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>

                {/* Audit Trail Note if already resolved */}
                {item.reviewedBy && (
                  <div className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded">
                    Audit: {item.auditNote} • Reviewed by <strong>{item.reviewedBy}</strong> on{' '}
                    {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : 'N/A'}
                  </div>
                )}

                {/* Executive Actions */}
                {isPending && (
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => onResolveItem(item.id, 'REJECT', undefined, 'Manually rejected by finance staff')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Reject AI Suggestion</span>
                    </button>

                    <button
                      onClick={() => setManualLinkItemId(item.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <LinkIcon className="w-4 h-4 text-indigo-500" />
                      <span>Manual Search & Link</span>
                    </button>

                    <button
                      onClick={() => onResolveItem(item.id, 'ACCEPT', undefined, 'Approved suggested AI match')}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept & Reconcile Match</span>
                    </button>
                  </div>
                )}

                {/* Manual Link Input Form */}
                {manualLinkItemId === item.id && (
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">Manual Order ID Override</span>
                      <button onClick={() => setManualLinkItemId(null)}>
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">Target Order ID</label>
                        <input
                          type="text"
                          placeholder="e.g. ORD-W-204118"
                          value={manualOrderIdInput}
                          onChange={(e) => setManualOrderIdInput(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">Audit Explanation</label>
                        <input
                          type="text"
                          placeholder="e.g. Verified with customer delivery slip"
                          value={auditNoteInput}
                          onChange={(e) => setAuditNoteInput(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setManualLinkItemId(null)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleManualLinkSubmit(item.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold"
                      >
                        Commit Manual Match
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
