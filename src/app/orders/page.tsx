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
  LayoutGrid,
  List,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function OrderBoardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'table' | 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

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
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order Board
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Factory Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Tiruppur knitwear export tracking with run-rate delay projections, worst-order-first prioritization, and 2-week early warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
            <button
              onClick={() => setViewMode('cards')}
              title="Card View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/orders/new"
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Setup New Order</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row with Refined Visual Polish */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* On Track */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'GREEN' ? '' : 'GREEN')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
            selectedStatus === 'GREEN' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Track</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{greenCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Meeting daily output pace</span>
          </div>
        </button>

        {/* Amber Warnings */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'AMBER' ? '' : 'AMBER')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
            selectedStatus === 'AMBER' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delay Warning</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-700">{amberCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mt-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>1–3 days delay risk window</span>
          </div>
        </button>

        {/* Critical Red */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'RED' ? '' : 'RED')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
            selectedStatus === 'RED' ? 'ring-2 ring-rose-500 border-rose-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Action</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-700">{redCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-rose-700 font-semibold mt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{airFreightCount > 0 ? `${airFreightCount} near air-freight` : 'Deficit backlog'}</span>
          </div>
        </button>

        {/* Financial Risk Exposure */}
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/80 rounded-2xl p-4 border border-rose-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">₹ Financial Exposure</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-950">
            ₹{(totalAtRisk / 100000).toFixed(2)}L
          </div>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Sea-to-air shift & late penalties</p>
        </div>
      </div>

      {/* Filter and Search Bar with Quick Chips */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search PO, style, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Buyer Filter */}
          <div>
            <select
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Sourcing Buyers</option>
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
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Units & Subcontracts</option>
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
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
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
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Status Conditions</option>
              <option value="GREEN">🟢 On Track (Green)</option>
              <option value="AMBER">🟡 Delay Warning (Amber)</option>
              <option value="RED">🔴 Critical Action (Red)</option>
            </select>
          </div>
        </div>

        {/* Quick status chips and clear button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Filters:</span>
            <button
              onClick={() => setSelectedStatus('')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                !selectedStatus ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setSelectedStatus('RED')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedStatus === 'RED' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Red ({redCount})
            </button>
            <button
              onClick={() => setSelectedStatus('AMBER')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedStatus === 'AMBER' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Amber ({amberCount})
            </button>
            <button
              onClick={() => setSelectedStatus('GREEN')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedStatus === 'GREEN' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Green ({greenCount})
            </button>
          </div>

          {(selectedBuyer || selectedUnit || selectedShipWeek || selectedStatus || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBuyer('');
                setSelectedUnit('');
                setSelectedShipWeek('');
                setSelectedStatus('');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Cards View vs Table View */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-600" />
          <div className="text-sm font-semibold text-slate-700">Recalculating Factory Run-Rates...</div>
          <p className="text-xs text-slate-400 mt-1">Evaluating 6-day production velocities excluding Sundays</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No orders match filter criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your filters or search keywords to view seeded production orders.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Executive Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {orders.map((ord) => {
            const pct = Math.round((ord.currentStageQuantity / ord.totalQuantity) * 100);
            const isRed = ord.statusColor === 'RED';
            const isAmber = ord.statusColor === 'AMBER';

            return (
              <div
                key={ord.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between group relative overflow-hidden ${
                  isRed
                    ? 'border-l-4 border-l-rose-500 border-slate-200 hover:border-slate-300'
                    : isAmber
                    ? 'border-l-4 border-l-amber-500 border-slate-200 hover:border-slate-300'
                    : 'border-l-4 border-l-emerald-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Bar: PO & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition"
                        >
                          {ord.poNumber}
                        </Link>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {ord.shipWeek}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">
                        {ord.buyerName}
                      </div>
                    </div>

                    <StatusBadge status={ord.statusColor} size="sm" />
                  </div>

                  {/* Style & Fabric info */}
                  <div className="mt-3 bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-900 truncate" title={ord.styleName}>
                      {ord.styleName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={ord.fabricDescription}>
                      {ord.fabricDescription}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50">
                      <span>Assigned: {ord.unitName}</span>
                      <span className="font-bold text-slate-700">₹{(ord.orderValueInr / 100000).toFixed(1)}L</span>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                        {ord.currentStage}
                      </span>
                      <span className="font-semibold text-slate-600">
                        {ord.currentStageQuantity.toLocaleString()} / {ord.totalQuantity.toLocaleString()} pcs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isRed ? 'bg-rose-500' : isAmber ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Velocity Run-Rate Callout */}
                  <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Floor Pace</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        <span className={ord.runRateDeficit > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                          {ord.piecesMadePerDay}
                        </span>{' '}
                        <span className="text-slate-400">/</span> {ord.piecesNeededPerDay} <span className="text-[10px] font-normal text-slate-500">pcs/d</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Ex-Factory Date</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">
                        {ord.exFactoryDate}
                      </div>
                    </div>
                  </div>

                  {/* Financial Risk Notice if applicable */}
                  {ord.totalAtRisk > 0 && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Risk: +{ord.projectedDelayDays}d Delay
                      </span>
                      <span className="font-bold">₹{(ord.totalAtRisk / 100000).toFixed(2)}L Penalty</span>
                    </div>
                  )}
                </div>

                {/* Card Footer CTA */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {ord.workingDaysRemaining} working days left
                  </div>

                  <Link
                    href={`/orders/${ord.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Run-Rate Math</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">PO Number</th>
                  <th className="py-3 px-3 font-bold">Buyer</th>
                  <th className="py-3 px-3 font-bold">Style & Fabric</th>
                  <th className="py-3 px-3 font-bold text-right">Order Qty</th>
                  <th className="py-3 px-4 font-bold">Current Stage & Progress</th>
                  <th className="py-3 px-3 font-bold">Ship Target</th>
                  <th className="py-3 px-3 font-bold">Run-Rate (Made vs Req)</th>
                  <th className="py-3 px-3 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="hover:text-brand-600 flex items-center gap-1.5"
                        >
                          {ord.poNumber}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{ord.shipWeek}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{ord.buyerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.unitName}</div>
                      </td>

                      <td className="py-3.5 px-3 max-w-[220px]">
                        <div className="font-medium text-slate-800 truncate" title={ord.styleName}>
                          {ord.styleName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate" title={ord.fabricDescription}>
                          {ord.fabricDescription}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                        {ord.totalQuantity.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          ₹{(ord.orderValueInr / 100000).toFixed(1)}L
                        </div>
                      </td>

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

                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-800 font-medium">{ord.exFactoryDate}</div>
                        {ord.dateAudits && ord.dateAudits.length > 0 && (
                          <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-100 px-1 rounded mt-0.5">
                            Revised ({ord.dateAudits.length}x)
                          </span>
                        )}
                      </td>

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

                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={ord.statusColor} size="sm" />
                      </td>

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
        </div>
      )}
    </div>
  );
}
