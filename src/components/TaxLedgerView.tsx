// src/components/TaxLedgerView.tsx
'use client';

import React from 'react';
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  Download, 
  HelpCircle, 
  Receipt, 
  Scale, 
  ShieldCheck, 
  TrendingUp 
} from 'lucide-react';
import { TaxLedgerRecord } from '@/types';

interface TaxLedgerViewProps {
  records: TaxLedgerRecord[];
}

export const TaxLedgerView: React.FC<TaxLedgerViewProps> = ({ records }) => {
  const totalGross = records.reduce((acc, r) => acc + r.grossSales, 0);
  const totalTcs = records.reduce((acc, r) => acc + r.gstTcsDeducted, 0);
  const totalTds = records.reduce((acc, r) => acc + r.incomeTaxTdsDeducted, 0);

  const exportTaxLedgerCsv = () => {
    const headers = [
      'Partner Platform',
      'Channel Type',
      'Month',
      'Gross Sales (₹)',
      'Taxable Value (₹)',
      'GST TCS (1% Sec 52) (₹)',
      'Income Tax TDS (Sec 194-O) (₹)',
      'GSTR-8 Portal Status',
      'Govt Variance (₹)',
    ];

    const rows = records.map(r => [
      r.partner,
      r.channelType,
      r.month,
      r.grossSales,
      r.taxableValue,
      r.gstTcsDeducted,
      r.incomeTaxTdsDeducted,
      r.portalStatus,
      r.differenceWithGovt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TCS_TDS_Tax_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Screen Title */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Partner-Wise TCS & TDS Statutory Tax Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              DPDP & Tax Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Under Section 52 of the CGST Act (1% TCS) and Section 194-O of the Income Tax Act (0.1%/1% TDS), e-commerce operators deduct statutory taxes. ReconTex reconciles these directly against GSTR-8 returns and Form 26AS, strictly segregated from operational revenue leakage.
          </p>
        </div>

        <button
          onClick={exportTaxLedgerCsv}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export Tax Ledger CSV</span>
        </button>
      </div>

      {/* Mandatory Statutory Separation Callout */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-emerald-950 text-sm">
            Statutory Accounting Boundary: Tax Withholdings ≠ Operational Leakage
          </h2>
          <p className="text-emerald-800">
            &ldquo;Settlements deduct GST TCS and income tax TDS, which must be shown separately, not as leakage.&rdquo;
            Marketplace deductions of ₹{totalTcs.toLocaleString('en-IN')} (TCS) and ₹{totalTds.toLocaleString('en-IN')} (TDS) represent statutory advance tax deposits made by marketplaces into Company A&apos;s GST and PAN credit ledgers. They are fully claimable as tax credits during monthly GSTR-3B filings and annual income tax assessments.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Gross Platform Sales
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            ₹{(totalGross / 10000000).toFixed(2)} Crore
          </span>
          <span className="text-xs text-slate-500">October 2026 Billing Period</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
            GST TCS Deposited (1% CGST/SGST)
          </span>
          <span className="text-2xl font-bold text-indigo-900 mt-1 block">
            ₹{totalTcs.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-indigo-700 font-medium">Reconciled against GSTR-8 portal</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
            Income Tax TDS Deposited (Sec 194-O)
          </span>
          <span className="text-2xl font-bold text-purple-900 mt-1 block">
            ₹{totalTds.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-purple-700 font-medium">Cross-matched with Form 26AS</span>
        </div>
      </div>

      {/* Partner Tax Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900">
            Partner-Wise Monthly Statutory Deduction Ledger
          </h2>
          <span className="text-xs text-slate-500">All figures in INR (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3">Partner Platform</th>
                <th className="py-3 px-3">Channel Type</th>
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-3 text-right">Gross Sales (₹)</th>
                <th className="py-3 px-3 text-right">Taxable Value (₹)</th>
                <th className="py-3 px-3 text-right">GST TCS 1% (₹)</th>
                <th className="py-3 px-3 text-right">Income Tax TDS (₹)</th>
                <th className="py-3 px-3">Govt Portal Status</th>
                <th className="py-3 px-3 text-right">Variance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {records.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-sans font-bold text-slate-900">{r.partner}</td>
                  <td className="py-3 px-3 font-sans text-slate-600">{r.channelType}</td>
                  <td className="py-3 px-3 font-sans text-slate-500">{r.month}</td>
                  <td className="py-3 px-3 text-right text-slate-900 font-medium">
                    ₹{r.grossSales.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">
                    ₹{r.taxableValue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-indigo-700 font-bold">
                    {r.gstTcsDeducted > 0 ? `₹${r.gstTcsDeducted.toLocaleString('en-IN')}` : '₹0 (Direct)'}
                  </td>
                  <td className="py-3 px-3 text-right text-purple-700 font-bold">
                    {r.incomeTaxTdsDeducted > 0 ? `₹${r.incomeTaxTdsDeducted.toLocaleString('en-IN')}` : '₹0 (Direct)'}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.portalStatus === 'Reconciled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.portalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {r.differenceWithGovt === 0 ? (
                      <span className="text-emerald-600 font-semibold">₹0.00</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">₹{r.differenceWithGovt}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900 text-xs">
                <td colSpan={3} className="py-3 px-3 font-sans">Total Company A Statutory Deductions</td>
                <td className="py-3 px-3 text-right font-mono">₹{totalGross.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-right font-mono">—</td>
                <td className="py-3 px-3 text-right font-mono text-indigo-700">₹{totalTcs.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-right font-mono text-purple-700">₹{totalTds.toLocaleString('en-IN')}</td>
                <td colSpan={2} className="py-3 px-3 font-sans text-emerald-700 text-right">
                  100% Tax Isolation Verified
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
