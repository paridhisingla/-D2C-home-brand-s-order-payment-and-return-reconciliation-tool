'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  Save,
  HelpCircle,
} from 'lucide-react';
import { STANDARD_TNA_STAGES } from '@/lib/sampleData';

export default function NewOrderPage() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [poNumber, setPoNumber] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [styleName, setStyleName] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [fabricDescription, setFabricDescription] = useState('100% Combed Cotton Single Jersey 180 GSM, Bio-Washed');
  const [totalQuantity, setTotalQuantity] = useState(10000);
  const [orderValueInr, setOrderValueInr] = useState(2100000);
  const [exFactoryDate, setExFactoryDate] = useState('2026-12-15');
  const [unitId, setUnitId] = useState('');

  // Size breakdown
  const [sizeS, setSizeS] = useState(2000);
  const [sizeM, setSizeM] = useState(4000);
  const [sizeL, setSizeL] = useState(3000);
  const [sizeXL, setSizeXL] = useState(1000);

  useEffect(() => {
    fetch('/api/buyers')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.buyers.length > 0) {
          setBuyers(d.buyers);
          setBuyerId(d.buyers[0].id);
        }
      });

    fetch('/api/units')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.units.length > 0) {
          setUnits(d.units);
          setUnitId(d.units[0].id);
        }
      });
  }, []);

  // Update total qty when sizes change
  useEffect(() => {
    const sum = Number(sizeS || 0) + Number(sizeM || 0) + Number(sizeL || 0) + Number(sizeXL || 0);
    setTotalQuantity(sum);
    setOrderValueInr(sum * 210); // Standard ₹210/piece average
  }, [sizeS, sizeM, sizeL, sizeXL]);

  // Compute preview of TNA Milestones based on ex-factory date
  const exDate = new Date(exFactoryDate || '2026-12-15');
  const milestonePreviews = STANDARD_TNA_STAGES.map((stage, idx) => {
    const plannedEnd = new Date(exDate);
    plannedEnd.setDate(plannedEnd.getDate() - stage.daysBeforeExFactory + stage.durationDays);
    const plannedStart = new Date(exDate);
    plannedStart.setDate(plannedStart.getDate() - stage.daysBeforeExFactory);

    return {
      name: stage.name,
      start: plannedStart.toISOString().split('T')[0],
      end: plannedEnd.toISOString().split('T')[0],
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!poNumber.trim()) {
      setError('Please provide a Purchase Order (PO) Number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poNumber: poNumber.trim(),
          buyerId,
          styleName: styleName.trim() || "Men's Classic Knit Tee",
          styleCode: styleCode.trim() || `STY-${Math.floor(100 + Math.random() * 900)}`,
          fabricDescription,
          totalQuantity,
          orderValueInr,
          exFactoryDate,
          unitId,
          sizeBreakdown: [
            { size: 'S', color: 'Navy', qty: Number(sizeS) },
            { size: 'M', color: 'Navy', qty: Number(sizeM) },
            { size: 'L', color: 'Navy', qty: Number(sizeL) },
            { size: 'XL', color: 'Navy', qty: Number(sizeXL) },
          ],
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the order');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="p-2.5 rounded-xl border border-stone-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">Setup New Purchase Order</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define PO specifications, size/color matrix, and automatically generate TNA milestone schedule
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Order Metadata */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            1. Commercial & Style Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PO Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                PO Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B-PO-88290"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-mono shadow-2xs"
              />
            </div>

            {/* Buyer Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Buyer Account *
              </label>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 shadow-2xs"
              >
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Production Unit *
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 shadow-2xs"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Garment Style Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Men's vintage washed crew neck tee, charcoal"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 shadow-2xs"
              />
            </div>

            {/* Ex-Factory Target Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Buyer Ex-Factory Date *
              </label>
              <input
                type="date"
                required
                value={exFactoryDate}
                onChange={(e) => setExFactoryDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-mono shadow-2xs"
              />
            </div>

            {/* Fabric Specs */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fabric Specification & Yarn GSM
              </label>
              <input
                type="text"
                value={fabricDescription}
                onChange={(e) => setFabricDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Size Breakdown Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              2. Quantity & Size Breakdown Matrix
            </h2>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Total Order Pieces: <span className="font-extrabold text-slate-900 dark:text-slate-100">{totalQuantity.toLocaleString()}</span> (₹{(orderValueInr / 100000).toFixed(2)}L)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200/90 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Size S</label>
              <input
                type="number"
                min="0"
                value={sizeS}
                onChange={(e) => setSizeS(Number(e.target.value))}
                className="w-full text-xs p-2 border border-stone-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200/90 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Size M</label>
              <input
                type="number"
                min="0"
                value={sizeM}
                onChange={(e) => setSizeM(Number(e.target.value))}
                className="w-full text-xs p-2 border border-stone-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200/90 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Size L</label>
              <input
                type="number"
                min="0"
                value={sizeL}
                onChange={(e) => setSizeL(Number(e.target.value))}
                className="w-full text-xs p-2 border border-stone-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200/90 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Size XL</label>
              <input
                type="number"
                min="0"
                value={sizeXL}
                onChange={(e) => setSizeXL(Number(e.target.value))}
                className="w-full text-xs p-2 border border-stone-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Auto-Generated TNA Milestones Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              3. Time-and-Action (TNA) Milestone Template Schedule
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Auto-calculated backwards from {exFactoryDate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {milestonePreviews.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-stone-200/90 dark:border-slate-800 bg-stone-50/80 dark:bg-slate-800/60 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {idx + 1}. {m.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {m.start} → {m.end}
                  </div>
                </div>
                <span className="text-[10px] bg-stone-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md font-mono font-bold">
                  {totalQuantity.toLocaleString()} pcs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/orders"
            className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Creating PO & Milestones...' : 'Initialize Order & Generate TNA'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
