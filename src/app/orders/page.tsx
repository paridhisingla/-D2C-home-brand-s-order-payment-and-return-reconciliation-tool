'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Filter,
  PlusCircle,
  Search,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function OrderBoardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedShipWeek, setSelectedShipWeek] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBuyer) params.set('buyerCompanyId', selectedBuyer);
      if (selectedUnit) params.set('unitId', selectedUnit);
      if (selectedShipWeek) params.set('shipWeek', selectedShipWeek);
      if (selectedStatus) params.set('statusColor', selectedStatus);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        // Sort worst orders first (RED first, then AMBER, then GREEN)
        const priority: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
        const sorted = [...data.orders].sort((a, b) => {
          const pA = priority[a.statusColor] ?? 9;
          const pB = priority[b.statusColor] ?? 9;
          if (pA !== pB) return pA - pB;
          return (b.projectedDelayDays || 0) - (a.projectedDelayDays || 0);
        });
        setOrders(sorted);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch buyers and units once
    fetch('/api/buyers')
      .then((res) => res.json())
      .then((d) => d.success && setBuyers(d.buyers));
    fetch('/api/units')
      .then((res) => res.json())
      .then((d) => d.success && setUnits(d.units));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedBuyer, selectedUnit, selectedShipWeek, selectedStatus, searchQuery]);

  // Financial summary
  const redCount = orders.filter((o) => o.statusColor === 'RED').length;
  const amberCount = orders.filter((o) => o.statusColor === 'AMBER').length;
  const greenCount = orders.filter((o) => o.statusColor === 'GREEN').length;
  const totalAtRisk = orders.reduce((sum, o) => sum + (o.totalAtRisk || 0), 0);
  const airFreightCount = orders.filter((o) => (o.airFreightRiskAmount || 0) > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Merchandiser Order Board</h1>
            <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-brand-200">
              Live Factory Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily floor pace, identify delay risks 2 weeks early, and prevent air-freight penalties.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </a>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Setup New Order</span>
          </Link>
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition"
          >
            <span>Review AI Logs</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* On Track */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">On Track (Green)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{greenCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Meeting daily output quota</p>
        </div>

        {/* Amber Warnings */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Delay Warning (Amber)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{amberCount}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">1–3 days delay risk window</p>
        </div>

        {/* Critical Red */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Critical Action (Red)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{redCount}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {airFreightCount > 0 ? `${airFreightCount} orders near air freight risk` : 'Critical delay'}
          </p>
        </div>

        {/* Financial Risk Exposure */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl p-4 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">₹ Financial Exposure</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-900">
            ₹{(totalAtRisk / 100000).toFixed(2)}L
          </div>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Sea-to-air shift & late discounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search PO, style, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Buyer Filter */}
          <div>
            <select
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Buyers (Company B, C)</option>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Factory Units & Subcontracts</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ship Week Filter */}
          <div>
            <select
              value={selectedShipWeek}
              onChange={(e) => setSelectedShipWeek(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Ship Weeks</option>
              <option value="2026-W46">Week 46 (Mid Nov 2026)</option>
              <option value="2026-W47">Week 47 (Late Nov 2026)</option>
              <option value="2026-W48">Week 48 (Early Dec 2026)</option>
            </select>
          </div>

          {/* Status Color Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Statuses (Green/Amber/Red)</option>
              <option value="GREEN">🟢 On Track (Green)</option>
              <option value="AMBER">🟡 Warning (Amber)</option>
              <option value="RED">🔴 Critical Delay (Red)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button if any active */}
        {(selectedBuyer || selectedUnit || selectedShipWeek || selectedStatus || searchQuery) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSelectedBuyer('');
                setSelectedUnit('');
                setSelectedShipWeek('');
                setSelectedStatus('');
                setSearchQuery('');
              }}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            Loading production orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">No orders match filter criteria</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">PO Number</th>
                  <th className="py-3 px-3 font-semibold">Buyer</th>
                  <th className="py-3 px-3 font-semibold">Style & Fabric</th>
                  <th className="py-3 px-3 font-semibold text-right">Order Qty</th>
                  <th className="py-3 px-4 font-semibold">Current Stage & Progress</th>
                  <th className="py-3 px-3 font-semibold">Ship Target</th>
                  <th className="py-3 px-3 font-semibold">Run-Rate (Actual vs Req)</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const pct = Math.round((ord.currentStageQuantity / ord.totalQuantity) * 100);
                  const isRed = ord.statusColor === 'RED';
                  const isAmber = ord.statusColor === 'AMBER';

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isRed ? 'bg-rose-50/20' : isAmber ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* PO Number */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="hover:text-brand-600 flex items-center gap-1.5"
                        >
                          {ord.poNumber}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{ord.shipWeek}</div>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">{ord.buyerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.unitName}</div>
                      </td>

                      {/* Style */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <div className="font-medium text-slate-800 truncate" title={ord.styleName}>
                          {ord.styleName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate" title={ord.fabricDescription}>
                          {ord.fabricDescription}
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                        {ord.totalQuantity.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          ₹{(ord.orderValueInr / 100000).toFixed(1)}L
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-800">{ord.currentStage}</span>
                          <span className="text-slate-500 font-medium">
                            {ord.currentStageQuantity.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="w-36 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isRed ? 'bg-rose-500' : isAmber ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      {/* Ex-Factory Date */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-800 font-medium">{ord.exFactoryDate}</div>
                        {ord.dateAudits && ord.dateAudits.length > 0 && (
                          <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-100 px-1 rounded mt-0.5">
                            Revised ({ord.dateAudits.length}x)
                          </span>
                        )}
                      </td>

                      {/* Run-Rate Pace */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-900">
                          <span className={ord.runRateDeficit > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                            {ord.piecesMadePerDay}
                          </span>{' '}
                          <span className="text-slate-400">/</span> {ord.piecesNeededPerDay} pcs/d
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {ord.projectedDelayDays > 0 ? (
                            <span className="text-rose-600 font-medium">+{ord.projectedDelayDays}d delay risk</span>
                          ) : (
                            <span className="text-emerald-600">On schedule</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={ord.statusColor} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
