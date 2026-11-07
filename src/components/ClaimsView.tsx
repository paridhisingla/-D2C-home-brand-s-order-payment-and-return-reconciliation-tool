// src/components/ClaimsView.tsx
'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Download, 
  FileCheck, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Printer, 
  Search, 
  ShieldAlert, 
  X 
} from 'lucide-react';
import { ClaimRecord, LeakageCategory } from '@/types';

interface ClaimsViewProps {
  claims: ClaimRecord[];
  onUpdateClaimStatus: (claimId: string, status: ClaimRecord['status'], settlementUtr?: string) => void;
}

export const ClaimsView: React.FC<ClaimsViewProps> = ({
  claims,
  onUpdateClaimStatus,
}) => {
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectingClaim, setInspectingClaim] = useState<ClaimRecord | null>(null);
  const [showUtrModal, setShowUtrModal] = useState<ClaimRecord | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');

  const filteredClaims = claims.filter(c => {
    if (partnerFilter !== 'ALL' && !c.partner.toLowerCase().includes(partnerFilter.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const totalDisputed = claims.reduce((acc, c) => acc + c.disputedAmount, 0);
  const totalRecovered = claims.filter(c => c.status === 'Recovered').reduce((acc, c) => acc + c.disputedAmount, 0);

  const exportAllClaimsCsv = () => {
    const headers = [
      'Claim ID',
      'Partner',
      'Order ID',
      'AWB Number',
      'Discrepancy Category',
      'Disputed Amount (₹)',
      'Status',
      'Filed Date',
      'Settlement UTR',
      'Evidence Math',
    ];

    const rows = filteredClaims.map(c => [
      c.claimNumber,
      c.partner,
      c.orderId,
      c.awbNumber,
      c.discrepancyType,
      c.disputedAmount,
      c.status,
      new Date(c.createdAt).toLocaleDateString(),
      c.settlementUtr || 'N/A',
      `"${c.evidenceDossier.discrepancyMath.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Partner_Claims_Dossier_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Partner Claims & Revenue Recovery Dossiers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Evidence-Backed Dispute Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Audit-ready dispute packs with certified weight proofs, rate-card fee breakdowns, and tracking timestamps for Amazon, Flipkart, Myntra, Blinkit, Shiprocket, and Delhivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportAllClaimsCsv}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Claims CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Claims Filed
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {claims.length} Cases
          </span>
          <span className="text-xs text-slate-500">Across 6 sales and logistics partners</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
            Total Disputed Value
          </span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">
            ₹{totalDisputed.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500">Pending recovery from aggregators</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
            Recovered Cash
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            ₹{totalRecovered > 0 ? totalRecovered.toLocaleString('en-IN') : 'Pacing to ₹30L+ Target'}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Credited back via bank settlement</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Partners</option>
            <option value="Shiprocket">Shiprocket</option>
            <option value="Delhivery">Delhivery</option>
            <option value="Marketplace 1">Marketplace 1 (Amazon)</option>
            <option value="Marketplace 2">Marketplace 2 (Flipkart)</option>
            <option value="Marketplace 3">Marketplace 3 (Myntra)</option>
            <option value="Quick-Commerce 2">Quick-Commerce 2 (Zepto)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Recovered">Recovered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{filteredClaims.length}</strong> claims
        </span>
      </div>

      {/* Claims List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3">Claim ID</th>
                <th className="py-3 px-3">Partner</th>
                <th className="py-3 px-3">Order ID & AWB</th>
                <th className="py-3 px-3">Discrepancy Category</th>
                <th className="py-3 px-3 text-right">Disputed Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Settlement UTR</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.map((claim) => {
                const getStatusStyle = (s: string) => {
                  if (s === 'Recovered') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (s === 'Submitted') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                  if (s === 'Under Review') return 'bg-amber-100 text-amber-800 border-amber-200';
                  if (s === 'Rejected') return 'bg-rose-100 text-rose-800 border-rose-200';
                  return 'bg-slate-100 text-slate-700 border-slate-200';
                };

                return (
                  <tr
                    key={claim.id}
                    onClick={() => setInspectingClaim(claim)}
                    className="hover:bg-slate-50 cursor-pointer font-mono text-[11px]"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900">{claim.claimNumber}</td>
                    <td className="py-3 px-3 font-sans text-slate-800 font-medium">{claim.partner}</td>
                    <td className="py-3 px-3">
                      <span className="text-slate-900 font-bold block">{claim.orderId}</span>
                      <span className="text-slate-400 block text-[10px]">{claim.awbNumber}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {claim.discrepancyType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-700 text-sm">
                      ₹{claim.disputedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {claim.settlementUtr || '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-sans" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInspectingClaim(claim)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          Evidence Pack
                        </button>
                        {claim.status !== 'Recovered' && (
                          <button
                            onClick={() => setShowUtrModal(claim)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                          >
                            Mark Recovered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Evidence Dossier Inspector */}
      {inspectingClaim && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 font-mono">
                    {inspectingClaim.claimNumber}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                    {inspectingClaim.partner}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formal Dispute Dossier & Certified Evidence Pack
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDossier}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  title="Print dispute pack"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectingClaim(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal Dispute Letter Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-700">Dispute Filed By:</span>
                <span className="font-bold text-slate-900">Company A, Bengaluru (Finance Accounts)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-700">Addressed To:</span>
                <span className="font-bold text-slate-900">{inspectingClaim.partner} Dispute Resolution Desk</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Subject:</span>
                <span className="text-rose-700 font-bold">
                  Discrepancy Claim of ₹{inspectingClaim.disputedAmount} for Order {inspectingClaim.orderId}
                </span>
              </div>
            </div>

            {/* Evidence Calculation Math */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Itemized Accounting Proof
              </h3>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 font-mono">
                <div className="text-slate-900 font-bold font-sans">
                  {inspectingClaim.evidenceDossier.discrepancyMath}
                </div>
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-slate-600">
                  <div>Order Value: ₹{inspectingClaim.evidenceDossier.orderValue}</div>
                  <div>Expected Payout: ₹{inspectingClaim.evidenceDossier.expectedPayout}</div>
                  <div>Actual Credited: ₹{inspectingClaim.evidenceDossier.actualPayout}</div>
                  <div className="text-rose-700 font-bold">
                    Net Disputed: ₹{inspectingClaim.disputedAmount}
                  </div>
                </div>
              </div>
            </div>

            {/* Certified Logistics & Weight Audit */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Weight Certificate & Physical Logistics Evidence
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Consignment AWB:</span>
                  <span className="font-mono font-bold text-slate-900">{inspectingClaim.awbNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Catalog Master Weight:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {inspectingClaim.evidenceDossier.weightCertifiedKg} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Courier Invoiced Weight:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {inspectingClaim.evidenceDossier.weightBilledKg} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tracking Delivery Milestone:</span>
                  <span className="font-mono text-slate-900">
                    {inspectingClaim.evidenceDossier.deliveryTimestamp}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Notes */}
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
              <span className="font-bold block">Internal Audit Note:</span>
              <p>{inspectingClaim.evidenceDossier.notes}</p>
            </div>

            {/* Update Status Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Change Status:</span>
                <select
                  value={inspectingClaim.status}
                  onChange={(e) => {
                    onUpdateClaimStatus(inspectingClaim.id, e.target.value as any);
                    setInspectingClaim({ ...inspectingClaim, status: e.target.value as any });
                  }}
                  className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingClaim(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                {inspectingClaim.status !== 'Recovered' && (
                  <button
                    onClick={() => {
                      setShowUtrModal(inspectingClaim);
                      setInspectingClaim(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Mark Recovered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settlement UTR Modal when marking Recovered */}
      {showUtrModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Mark Claim as Recovered
              </h3>
              <button onClick={() => setShowUtrModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter the bank credit settlement UTR / transaction reference received from {showUtrModal.partner} for ₹{showUtrModal.disputedAmount}.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Bank Settlement UTR / Credit Reference
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-HDFC-2026110299"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUtrModal(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateClaimStatus(showUtrModal.id, 'Recovered', utrInput.trim() || undefined);
                  setShowUtrModal(null);
                  setUtrInput('');
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Confirm Recovery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
