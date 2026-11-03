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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Order Board
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Factory Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Tiruppur knitwear export tracking with run-rate delay projections, worst-order-first prioritization, and 2-week early warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-stone-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-stone-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              title="Card View"
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200/90 dark:border-slate-700 text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/orders/new"
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs hover:shadow transition"
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
          className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
            selectedStatus === 'GREEN'
              ? 'ring-2 ring-emerald-500 border-emerald-300 dark:border-emerald-700'
              : 'border-stone-200/90 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">On Track</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{greenCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Meeting daily output pace</span>
          </div>
        </button>

        {/* Amber Warnings */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'AMBER' ? '' : 'AMBER')}
          className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
            selectedStatus === 'AMBER'
              ? 'ring-2 ring-amber-500 border-amber-300 dark:border-amber-700'
              : 'border-stone-200/90 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delay Warning</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">{amberCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>1–3 days delay risk window</span>
          </div>
        </button>

        {/* Critical Red */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'RED' ? '' : 'RED')}
          className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
            selectedStatus === 'RED'
              ? 'ring-2 ring-rose-500 border-rose-300 dark:border-rose-700'
              : 'border-stone-200/90 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical Action</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">{redCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{airFreightCount > 0 ? `${airFreightCount} near air-freight` : 'Deficit backlog'}</span>
          </div>
        </button>

        {/* Financial Risk Exposure */}
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/80 dark:from-rose-950/40 dark:via-slate-900 dark:to-amber-950/30 rounded-2xl p-4 border border-rose-200/90 dark:border-rose-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider">₹ Financial Exposure</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100">
            ₹{(totalAtRisk / 100000).toFixed(2)}L
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium mt-1">Sea-to-air shift & late penalties</p>
        </div>
      </div>

      {/* Filter and Search Bar with Quick Chips */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search PO, style, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Buyer Filter */}
          <div>
            <select
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
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
              className="w-full py-2 px-3 text-xs border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
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
              className="w-full py-2 px-3 text-xs border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
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
              className="w-full py-2 px-3 text-xs border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Status Conditions</option>
              <option value="GREEN">🟢 On Track (Green)</option>
              <option value="AMBER">🟡 Delay Warning (Amber)</option>
              <option value="RED">🔴 Critical Action (Red)</option>
            </select>
          </div>
        </div>

        {/* Quick status chips and clear button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Filters:</span>
            <button
              onClick={() => setSelectedStatus('')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                !selectedStatus
                  ? 'bg-slate-900 dark:bg-brand-600 text-white'
                  : 'bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setSelectedStatus('RED')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                selectedStatus === 'RED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
            >
              Red ({redCount})
            </button>
            <button
              onClick={() => setSelectedStatus('AMBER')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                selectedStatus === 'AMBER'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              Amber ({amberCount})
            </button>
            <button
              onClick={() => setSelectedStatus('GREEN')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                selectedStatus === 'GREEN'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
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
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Cards View vs Table View */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-600 dark:text-brand-400" />
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Recalculating Factory Run-Rates...</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Evaluating 6-day production velocities excluding Sundays</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No orders match filter criteria</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
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
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between group relative overflow-hidden ${
                  isRed
                    ? 'border-l-4 border-l-rose-500 border-stone-200/90 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700'
                    : isAmber
                    ? 'border-l-4 border-l-amber-500 border-stone-200/90 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700'
                    : 'border-l-4 border-l-emerald-500 border-stone-200/90 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar: PO & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition"
                        >
                          {ord.poNumber}
                        </Link>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-stone-200/60 dark:border-slate-700">
                          {ord.shipWeek}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                        {ord.buyerName}
                      </div>
                    </div>

                    <StatusBadge status={ord.statusColor} size="sm" />
                  </div>

                  {/* Style & Fabric info */}
                  <div className="mt-3 bg-stone-50/80 dark:bg-slate-800/60 rounded-xl p-3 border border-stone-100 dark:border-slate-700/60 space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={ord.styleName}>
                      {ord.styleName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={ord.fabricDescription}>
                      {ord.fabricDescription}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-slate-700/60">
                      <span>Assigned: {ord.unitName}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">₹{(ord.orderValueInr / 100000).toFixed(1)}L</span>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />
                        {ord.currentStage}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {ord.currentStageQuantity.toLocaleString()} / {ord.totalQuantity.toLocaleString()} pcs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-stone-200/70 dark:border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isRed ? 'bg-rose-500' : isAmber ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Velocity Run-Rate Callout */}
                  <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 dark:border-slate-800 text-xs">
                    <div className="bg-stone-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Daily Floor Pace</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        <span className={ord.runRateDeficit > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                          {ord.piecesMadePerDay}
                        </span>{' '}
                        <span className="text-slate-400 dark:text-slate-500">/</span> {ord.piecesNeededPerDay} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">pcs/d</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Ex-Factory Date</div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {ord.exFactoryDate}
                      </div>
                    </div>
                  </div>

                  {/* Financial Risk Notice if applicable */}
                  {ord.totalAtRisk > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-[11px] flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Risk: +{ord.projectedDelayDays}d Delay
                      </span>
                      <span className="font-extrabold">₹{(ord.totalAtRisk / 100000).toFixed(2)}L Penalty</span>
                    </div>
                  )}
                </div>

                {/* Card Footer CTA */}
                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    {ord.workingDaysRemaining} working days left
                  </div>

                  <Link
                    href={`/orders/${ord.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-stone-200/90 dark:border-slate-800">
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
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                {orders.map((ord) => {
                  const pct = Math.round((ord.currentStageQuantity / ord.totalQuantity) * 100);
                  const isRed = ord.statusColor === 'RED';
                  const isAmber = ord.statusColor === 'AMBER';

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-stone-50/80 dark:hover:bg-slate-800/40 transition ${
                        isRed
                          ? 'bg-rose-50/30 dark:bg-rose-950/20'
                          : isAmber
                          ? 'bg-amber-50/30 dark:bg-amber-950/20'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1.5"
                        >
                          {ord.poNumber}
                        </Link>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{ord.shipWeek}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{ord.buyerName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{ord.unitName}</div>
                      </td>

                      <td className="py-3.5 px-3 max-w-[220px]">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={ord.styleName}>
                          {ord.styleName}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={ord.fabricDescription}>
                          {ord.fabricDescription}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {ord.totalQuantity.toLocaleString()}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          ₹{(ord.orderValueInr / 100000).toFixed(1)}L
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{ord.currentStage}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {ord.currentStageQuantity.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="w-36 bg-stone-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isRed ? 'bg-rose-500' : isAmber ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{ord.exFactoryDate}</div>
                        {ord.dateAudits && ord.dateAudits.length > 0 && (
                          <span className="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md mt-0.5 border border-amber-200 dark:border-amber-800">
                            Revised ({ord.dateAudits.length}x)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          <span className={ord.runRateDeficit > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold'}>
                            {ord.piecesMadePerDay}
                          </span>{' '}
                          <span className="text-slate-400 dark:text-slate-500">/</span> {ord.piecesNeededPerDay} pcs/d
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {ord.projectedDelayDays > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">+{ord.projectedDelayDays}d delay risk</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">On schedule</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={ord.statusColor} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 px-3 py-1.5 rounded-xl transition border border-brand-200/60 dark:border-brand-800"
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
