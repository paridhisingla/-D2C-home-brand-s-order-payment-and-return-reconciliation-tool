// src/components/BenchmarkView.tsx
'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Gauge, 
  HardDrive, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { BenchmarkResult } from '@/types';

export const BenchmarkView: React.FC = () => {
  const [rowCount, setRowCount] = useState<number>(100000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: rowCount }),
      });

      if (!res.ok) {
        throw new Error(`Benchmark execution failed (${res.status})`);
      }

      const data = await res.json();
      setBenchmarkResult(data);
    } catch (err: any) {
      setError(err.message || 'Error running benchmark');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Title */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              1-Lakh Row High-Throughput Reconciliation Benchmark
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Hard Requirement
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            &ldquo;Hard part: matching 1 lakh rows in under a minute.&rdquo; This stress-testing suite evaluates the in-memory hash-indexed vectorized matching engine against 100,000 orders and settlements, computing rate-card deductions and flagging ₹10 discrepancies in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={rowCount}
            onChange={(e) => setRowCount(parseInt(e.target.value))}
            disabled={isRunning}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value={10000}>10,000 Rows (Quick Test)</option>
            <option value={50000}>50,000 Rows</option>
            <option value={100000}>100,000 Rows (Brief SLA Standard)</option>
            <option value={200000}>200,000 Rows (2x Stress Load)</option>
          </select>

          <button
            onClick={runBenchmark}
            disabled={isRunning}
            className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-400 text-slate-900 cursor-wait animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Processing {rowCount.toLocaleString()} Rows...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* SLA Target Callout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Target SLA (Brief)
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">
            &lt; 60.0 Seconds
          </span>
          <span className="text-xs text-slate-500">For 100,000 order-settlement rows</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
            Engine Architecture
          </span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            Hash-Indexed Vector Map
          </span>
          <span className="text-xs text-slate-500">O(1) lookups, Zero-overhead loops</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Benchmark Status
          </span>
          <span className={`text-xl font-bold mt-1 block ${
            benchmarkResult ? (benchmarkResult.meetsSla ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-400'
          }`}>
            {benchmarkResult ? (benchmarkResult.meetsSla ? 'SLA EXCEEDED (PASS)' : 'FAILED') : 'Ready to Run'}
          </span>
          <span className="text-xs text-slate-500">
            {benchmarkResult ? `${benchmarkResult.elapsedSeconds}s actual runtime` : 'Click execute to test'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
            Throughput Target
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">
            {benchmarkResult ? `${benchmarkResult.rowsPerSecond.toLocaleString()} rows/s` : '> 20,000 rows/s'}
          </span>
          <span className="text-xs text-slate-500">Real-time processing velocity</span>
        </div>
      </div>

      {/* Benchmark Results Display */}
      {benchmarkResult && (
        <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Benchmark Run Completed Successfully
                </h2>
                <span className="text-xs text-slate-500">
                  {benchmarkResult.totalRowsProcessed.toLocaleString()} rows matched and categorized in {benchmarkResult.elapsedMilliseconds} ms ({benchmarkResult.elapsedSeconds} seconds)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {Math.round((60.0 / Math.max(0.001, benchmarkResult.elapsedSeconds)) * 10) / 10}x Faster than 60s SLA
              </span>
            </div>
          </div>

          {/* Breakdown of Categorized Orders from the 1-Lakh Set */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Categorization Distribution across {benchmarkResult.totalRowsProcessed.toLocaleString()} Rows
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 font-semibold block">Settled (Within ₹10)</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                  {benchmarkResult.matchedCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {Math.round((benchmarkResult.matchedCount / benchmarkResult.totalRowsProcessed) * 100)}% of total
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-amber-800 font-semibold block">Short-Paid (&gt;₹10 Gap)</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                  {benchmarkResult.shortPaidCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-amber-700">
                  {Math.round((benchmarkResult.shortPaidCount / benchmarkResult.totalRowsProcessed) * 100)}% of total
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-rose-800 font-semibold block">Unpaid COD Past Due</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                  {benchmarkResult.unpaidCodCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-rose-700">
                  {Math.round((benchmarkResult.unpaidCodCount / benchmarkResult.totalRowsProcessed) * 100)}% of total
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-purple-800 font-semibold block">Freight Overcharged</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                  {benchmarkResult.freightOverchargeCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-purple-700">
                  {Math.round((benchmarkResult.freightOverchargeCount / benchmarkResult.totalRowsProcessed) * 100)}% of total
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200">
                <span className="text-red-900 font-semibold block">Return Not Received</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                  {benchmarkResult.lostReturnCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-red-700">
                  {Math.round((benchmarkResult.lostReturnCount / benchmarkResult.totalRowsProcessed) * 100)}% of total
                </span>
              </div>
            </div>
          </div>

          {/* Performance & Memory Footprint */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans block">Execution Time</span>
              <span className="font-bold text-slate-900 text-sm">{benchmarkResult.elapsedSeconds} seconds</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block">Processing Throughput</span>
              <span className="font-bold text-slate-900 text-sm">{benchmarkResult.rowsPerSecond.toLocaleString()} rows/sec</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block">Memory Footprint Delta</span>
              <span className="font-bold text-slate-900 text-sm">~{benchmarkResult.memoryUsageMb} MB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
