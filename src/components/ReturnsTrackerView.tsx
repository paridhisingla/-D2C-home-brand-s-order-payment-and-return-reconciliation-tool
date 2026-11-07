// src/components/ReturnsTrackerView.tsx
'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Barcode, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  PackageCheck, 
  PackageSearch, 
  PackageX, 
  QrCode, 
  RotateCcw, 
  Search, 
  ShieldAlert 
} from 'lucide-react';
import { OrderRecord } from '@/types';

interface ReturnsTrackerViewProps {
  orders: OrderRecord[];
  onLogWarehouseScan: (awbOrOrderId: string, condition?: string) => Promise<boolean>;
  onRaiseClaim: (orderId: string) => void;
}

export const ReturnsTrackerView: React.FC<ReturnsTrackerViewProps> = ({
  orders,
  onLogWarehouseScan,
  onRaiseClaim,
}) => {
  const [scanInput, setScanInput] = useState<string>('');
  const [scanCondition, setScanCondition] = useState<string>('Good Condition / Packaging Intact');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'UNSCANNED' | 'VERIFIED'>('ALL');

  // Filter returns / RTO orders
  const returnOrders = orders.filter(o =>
    o.deliveryStatus === 'Returned to warehouse' ||
    o.deliveryStatus === 'RTO initiated' ||
    o.deliveryStatus === 'Lost in transit' ||
    o.reconciliationStatus === 'Return not received' ||
    o.warehouseScanDate !== null
  );

  const displayedOrders = returnOrders.filter(o => {
    if (filterType === 'UNSCANNED') return o.warehouseScanDate === null;
    if (filterType === 'VERIFIED') return o.warehouseScanDate !== null;
    return true;
  });

  const lostCount = returnOrders.filter(o => o.reconciliationStatus === 'Return not received').length;
  const verifiedCount = returnOrders.filter(o => o.warehouseScanDate !== null).length;

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setIsScanning(true);
    setScanMessage(null);
    try {
      const ok = await onLogWarehouseScan(scanInput.trim(), scanCondition);
      if (ok) {
        setScanMessage({
          type: 'success',
          text: `Inward scan confirmed for ${scanInput.trim()}. Verified at Bengaluru warehouse dock.`,
        });
        setScanInput('');
      } else {
        setScanMessage({
          type: 'error',
          text: `No active return order found matching AWB or Order ID "${scanInput.trim()}".`,
        });
      }
    } catch (err: any) {
      setScanMessage({ type: 'error', text: err.message || 'Scan logging failed' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Title */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Returns & Warehouse Inward Dock Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              Catch Lost Returns Within Days
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Reconciles courier return / RTO manifests against physical barcode scans at the Bengaluru warehouse dock. Automatically flags orders where courier marked returned but items never arrived within 7 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
            <span className="text-rose-600 block font-semibold">Lost Returns (At Risk)</span>
            <span className="text-xl font-bold text-slate-900">{lostCount} shipments</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <span className="text-emerald-600 block font-semibold">Verified Dock Scans</span>
            <span className="text-xl font-bold text-slate-900">{verifiedCount} received</span>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Inward Simulation Box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Barcode className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Warehouse Inward Barcode Scanner (Bengaluru Dock)
              </h2>
              <span className="text-[11px] text-slate-400">
                Scan barcode or type AWB/Order ID when driver unloads return parcels
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs font-mono font-medium">
            Scanner Port: Ready
          </span>
        </div>

        <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Scan or enter AWB (e.g. DEL-FK-99021411, SR-BLR-90204377)..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={scanCondition}
            onChange={(e) => setScanCondition(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="Good Condition / Packaging Intact">Good Condition / Intact</option>
            <option value="Outer Box Crushed">Outer Box Crushed (QC Review)</option>
            <option value="Seal Broken / Partial Goods">Seal Broken / Incomplete</option>
            <option value="Wrong Item Returned by Customer">Wrong Item Returned</option>
          </select>

          <button
            type="submit"
            disabled={isScanning || !scanInput.trim()}
            className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
              scanInput.trim()
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Record Dock Receipt</span>
          </button>
        </form>

        {/* Quick Click Scan Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px]">Test with active sample return:</span>
          <button
            type="button"
            onClick={() => setScanInput('DEL-FK-99021411')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-mono text-[11px] border border-slate-700"
          >
            DEL-FK-99021411 (Lost Return: Eyelet Curtains)
          </button>
          <button
            type="button"
            onClick={() => setScanInput('SR-BLR-90204377')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-mono text-[11px] border border-slate-700"
          >
            SR-BLR-90204377 (Linen Duvet Cover)
          </button>
        </div>

        {scanMessage && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            scanMessage.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
              : 'bg-rose-950/80 text-rose-300 border border-rose-700'
          }`}>
            {scanMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{scanMessage.text}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Return Shipments ({returnOrders.length})
          </button>
          <button
            onClick={() => setFilterType('UNSCANNED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              filterType === 'UNSCANNED'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            Unscanned / Missing ({returnOrders.filter(o => !o.warehouseScanDate).length})
          </button>
          <button
            onClick={() => setFilterType('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              filterType === 'VERIFIED'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Verified Dock Receipts ({verifiedCount})
          </button>
        </div>
      </div>

      {/* Returns Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3">Courier & AWB</th>
                <th className="py-3 px-3 text-right">Value (₹)</th>
                <th className="py-3 px-3">Return Status</th>
                <th className="py-3 px-3">Age Since RTO</th>
                <th className="py-3 px-3">Warehouse Inward Receipt</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedOrders.map((order) => {
                const isLost = order.reconciliationStatus === 'Return not received';
                const isScanned = order.warehouseScanDate !== null;

                return (
                  <tr key={order.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-3 px-3 font-bold text-slate-900">{order.orderId}</td>
                    <td className="py-3 px-3 font-sans text-slate-800 max-w-[180px] truncate">
                      {order.itemDescription}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="text-slate-800 font-medium block">{order.courierPartner}</span>
                      <span className="text-slate-400 font-mono block text-[10px]">{order.awbNumber}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{order.orderValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isLost ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`font-semibold ${order.daysSinceDelivery > 7 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {order.daysSinceDelivery} days
                      </span>
                      {order.daysSinceDelivery > 7 && (
                        <span className="text-[10px] text-rose-500 block">&gt; 7-day SLA breach</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {isScanned ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Scanned ({new Date(order.warehouseScanDate!).toLocaleDateString()})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                          <PackageX className="w-4 h-4 text-rose-600" />
                          <span>Not Received at Dock</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {isLost && order.claimStatus === 'None' ? (
                        <button
                          onClick={() => onRaiseClaim(order.orderId)}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors shadow-sm"
                        >
                          Raise Lost Claim
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {order.claimStatus !== 'None' ? `Claim ${order.claimStatus}` : 'Verified'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
