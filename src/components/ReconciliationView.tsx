// src/components/ReconciliationView.tsx
'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Filter, 
  HelpCircle, 
  Layers, 
  Search, 
  ShieldCheck, 
  SlidersHorizontal, 
  X 
} from 'lucide-react';
import { OrderRecord, ReconciliationStatus, SalesChannel } from '@/types';

interface ReconciliationViewProps {
  orders: OrderRecord[];
  onRaiseClaim: (orderId: string) => void;
  maskPII: boolean;
  onToggleMaskPII: () => void;
  initialStatusFilter?: string;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  orders,
  onRaiseClaim,
  maskPII,
  onToggleMaskPII,
  initialStatusFilter = 'ALL',
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [diffFilter, setDiffFilter] = useState<'ALL' | 'GAP_GT_10'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingOrder, setInspectingOrder] = useState<OrderRecord | null>(null);

  // Filter pipeline
  const filteredOrders = orders.filter((order) => {
    if (selectedChannel !== 'ALL' && order.channel !== selectedChannel) return false;
    if (selectedStatus !== 'ALL' && order.reconciliationStatus !== selectedStatus) return false;
    if (diffFilter === 'GAP_GT_10' && Math.abs(order.difference) <= 10) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        order.orderId.toLowerCase().includes(q) ||
        order.awbNumber.toLowerCase().includes(q) ||
        order.sku.toLowerCase().includes(q) ||
        order.itemDescription.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Export visible rows to CSV
  const exportToCsv = () => {
    const headers = [
      'Order ID',
      'Channel',
      'Order Value (₹)',
      'Payment Mode',
      'Delivery Status',
      'Courier Partner',
      'AWB Number',
      'Physical Wt (kg)',
      'Billed Wt (kg)',
      'Expected Received (₹)',
      'Actual Received (₹)',
      'Difference (₹)',
      'Reconciliation Status',
      'Leakage Reason',
      'TCS (₹)',
      'TDS (₹)',
      'Customer Name',
      'City',
    ];

    const rows = filteredOrders.map(o => [
      o.orderId,
      o.channel,
      o.orderValue,
      o.paymentMode,
      o.deliveryStatus,
      o.courierPartner,
      o.awbNumber,
      o.physicalWeightKg,
      o.billedWeightKg,
      o.expectedReceived,
      o.actualReceived,
      o.difference,
      o.reconciliationStatus,
      `"${o.leakageReason.replace(/"/g, '""')}"`,
      o.tcsDeducted,
      o.tdsDeducted,
      `"${o.customerName}"`,
      o.city,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reconciliation_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'Settled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Settled (≤₹10)
          </span>
        );
      case 'Short-paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Short-paid
          </span>
        );
      case 'Unpaid past due':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Unpaid past due
          </span>
        );
      case 'Freight overcharged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <AlertCircle className="w-3 h-3 text-purple-600" />
            Freight overcharged
          </span>
        );
      case 'Return not received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
            <AlertCircle className="w-3 h-3 text-red-700" />
            Return not received
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, AWB, SKU, customer or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Filter */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Channels (6)</option>
            <option value="Website">Website (55% COD)</option>
            <option value="Marketplace 1">Marketplace 1 (Amazon)</option>
            <option value="Marketplace 2">Marketplace 2 (Flipkart)</option>
            <option value="Marketplace 3">Marketplace 3 (Myntra)</option>
            <option value="Quick-Commerce 1">Quick-Commerce 1 (Blinkit)</option>
            <option value="Quick-Commerce 2">Quick-Commerce 2 (Zepto)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses (5)</option>
            <option value="Settled">Settled (Within ₹10)</option>
            <option value="Short-paid">Short-paid</option>
            <option value="Unpaid past due">Unpaid past due (COD)</option>
            <option value="Freight overcharged">Freight overcharged</option>
            <option value="Return not received">Return not received</option>
          </select>

          {/* Gap > ₹10 Filter Pill */}
          <button
            onClick={() => setDiffFilter(diffFilter === 'ALL' ? 'GAP_GT_10' : 'ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              diffFilter === 'GAP_GT_10'
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Flagged &gt; ₹10 Gap
          </button>

          {/* Export Button */}
          <button
            onClick={exportToCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Order ID & Date</th>
                <th className="py-3 px-3">Channel & SKU</th>
                <th className="py-3 px-3">Value (₹) & Pay</th>
                <th className="py-3 px-3">Courier & AWB</th>
                <th className="py-3 px-3">Weight (Cat / Bill)</th>
                <th className="py-3 px-3 text-right">Expected (₹)</th>
                <th className="py-3 px-3 text-right">Received (₹)</th>
                <th className="py-3 px-3 text-right">Difference (₹)</th>
                <th className="py-3 px-3">Reconciliation Status</th>
                <th className="py-3 px-3">Customer (DPDP)</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isWeightOverbilled = order.billedWeightKg > order.physicalWeightKg + 0.15;
                  const isDiscrepancy = Math.abs(order.difference) > 10;
                  const isBriefSample = ['ORD-W-204118', 'ORD-M-88120', 'ORD-W-204377'].includes(order.orderId);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setInspectingOrder(order)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isBriefSample ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* Order ID & Date */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                          <span>{order.orderId}</span>
                          {isBriefSample && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-semibold" title="Sample row from brief">
                              Sample
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </td>

                      {/* Channel & SKU */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block truncate max-w-[130px]">
                          {order.channel}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px] block" title={order.itemDescription}>
                          {order.sku}
                        </span>
                      </td>

                      {/* Value & Payment Mode */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">
                          ₹{order.orderValue.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          order.paymentMode === 'COD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.paymentMode}
                        </span>
                      </td>

                      {/* Courier & AWB */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 block">{order.courierPartner}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{order.awbNumber}</span>
                      </td>

                      {/* Weight Comparison */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-600 font-mono">{order.physicalWeightKg.toFixed(2)} kg</span>
                          <span className="text-slate-400">/</span>
                          <span className={`font-mono ${isWeightOverbilled ? 'font-bold text-purple-700 underline' : 'text-slate-600'}`}>
                            {order.billedWeightKg.toFixed(2)} kg
                          </span>
                        </div>
                        {isWeightOverbilled && (
                          <span className="text-[9px] text-purple-600 font-semibold block">Overbilled slab</span>
                        )}
                      </td>

                      {/* Expected (₹) */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        ₹{order.expectedReceived.toLocaleString('en-IN')}
                      </td>

                      {/* Actual Received (₹) */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                        ₹{order.actualReceived.toLocaleString('en-IN')}
                      </td>

                      {/* Difference (₹) */}
                      <td className="py-3 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          order.difference < -10
                            ? 'bg-rose-100 text-rose-700'
                            : (order.difference > 10 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-50 text-emerald-700')
                        }`}>
                          {order.difference > 0 ? `+₹${order.difference}` : (order.difference === 0 ? '₹0' : `-₹${Math.abs(order.difference)}`)}
                        </span>
                      </td>

                      {/* Reconciliation Status Badge */}
                      <td className="py-3 px-3">
                        {getStatusBadge(order.reconciliationStatus)}
                      </td>

                      {/* Customer PII (DPDP Masked) */}
                      <td className="py-3 px-3">
                        <span className="text-slate-700 block font-medium">{order.customerName}</span>
                        <span className="text-[10px] text-slate-400 block">{order.city}</span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {order.claimStatus === 'None' && order.reconciliationStatus !== 'Settled' ? (
                          <button
                            onClick={() => onRaiseClaim(order.orderId)}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors shadow-sm"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {order.claimStatus === 'None' ? '—' : order.claimStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Summary */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{filteredOrders.length}</strong> of {orders.length} orders
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Settled (≤₹10)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Discrepancy &gt; ₹10
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DPDP 2023 Masking: {maskPII ? 'Active' : 'Unmasked'}
            </span>
          </div>
        </div>
      </div>

      {/* Slide-Over Order Detail Breakdown Drawer */}
      {inspectingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-mono">
                    {inspectingOrder.orderId}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 font-semibold text-slate-700">
                    {inspectingOrder.channel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full Rate-Card Fee Decomposition & Leakage Proof
                </p>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation Status & Reason */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Reconciliation Classification
                </span>
                {getStatusBadge(inspectingOrder.reconciliationStatus)}
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {inspectingOrder.leakageReason}
              </div>
            </div>

            {/* Financial Step-by-Step Arithmetic */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rate-Card Mathematical Proof
              </h3>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Gross Order Value</span>
                  <span className="font-bold font-mono text-slate-900">₹{inspectingOrder.orderValue.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Marketplace Commission & Fees</span>
                  <span className="font-mono text-rose-600">-₹{inspectingOrder.commissionDeducted || (inspectingOrder.feesBreakdown?.commission || 0)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Courier Freight Deduction</span>
                  <span className="font-mono text-rose-600">-₹{inspectingOrder.freightDeducted || (inspectingOrder.feesBreakdown?.courierFreight || 0)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>COD Handling Charge</span>
                  <span className="font-mono text-rose-600">-₹{inspectingOrder.codFeeDeducted || (inspectingOrder.feesBreakdown?.codHandlingFee || 0)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>GST TCS (1% Section 52)</span>
                  <span className="font-mono text-slate-500">-₹{inspectingOrder.tcsDeducted}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Income Tax TDS (0.1%/1% Sec 194-O)</span>
                  <span className="font-mono text-slate-500">-₹{inspectingOrder.tdsDeducted}</span>
                </div>

                <div className="flex justify-between py-2 border-t-2 border-slate-200 font-semibold text-slate-900 bg-slate-50 px-2 rounded">
                  <span>Expected Net Receivable</span>
                  <span className="font-mono text-indigo-700">₹{inspectingOrder.expectedReceived}</span>
                </div>

                <div className="flex justify-between py-2 font-semibold text-slate-900 bg-slate-50 px-2 rounded">
                  <span>Actual Net Received</span>
                  <span className="font-mono text-slate-900">₹{inspectingOrder.actualReceived}</span>
                </div>

                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-sm px-2 rounded bg-rose-50 text-rose-800">
                  <span>Financial Difference</span>
                  <span className="font-mono">
                    {inspectingOrder.difference < 0 ? `-₹${Math.abs(inspectingOrder.difference)}` : `+₹${inspectingOrder.difference}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Courier Freight & Weight Certificate */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Logistics & Weight Audit
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Catalog Physical Weight</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{inspectingOrder.physicalWeightKg} kg</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Certified master data</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Courier Invoiced Weight</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{inspectingOrder.billedWeightKg} kg</span>
                  <span className={`text-[10px] font-semibold block mt-0.5 ${
                    inspectingOrder.billedWeightKg > inspectingOrder.physicalWeightKg ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {inspectingOrder.billedWeightKg > inspectingOrder.physicalWeightKg ? 'Discrepancy Detected' : 'Matched Slab'}
                  </span>
                </div>
              </div>
            </div>

            {/* DPDP Customer Details */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Customer Consignee</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  DPDP Act 2023 Masked
                </span>
              </div>
              <div className="text-slate-900 font-medium">{inspectingOrder.customerName}</div>
              <div className="text-slate-500">{inspectingOrder.customerPhone}</div>
              <div className="text-slate-500">{inspectingOrder.customerAddress}</div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              {inspectingOrder.reconciliationStatus !== 'Settled' && inspectingOrder.claimStatus === 'None' && (
                <button
                  onClick={() => {
                    onRaiseClaim(inspectingOrder.orderId);
                    setInspectingOrder(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Generate Partner Claim Dossier
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
