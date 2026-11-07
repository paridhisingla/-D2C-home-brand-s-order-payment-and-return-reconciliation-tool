// src/components/HeaderNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  TrendingDown, 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  Cpu, 
  Scale, 
  PackageSearch, 
  FileText, 
  Receipt, 
  Zap 
} from 'lucide-react';
import { User, UserRole } from '@/types';

interface HeaderNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onRoleSwitch: (role: UserRole) => void;
  maskPII: boolean;
  onToggleMaskPII: () => void;
  onResetSeedData: () => void;
  pendingReviewCount: number;
  openClaimsCount: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onRoleSwitch,
  maskPII,
  onToggleMaskPII,
  onResetSeedData,
  pendingReviewCount,
  openClaimsCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Bar: Company Identity & System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-indigo-400/30">
            RT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">ReconTex</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-medium">
                Company A • Bengaluru
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              D2C Home Textiles Reconciliation OS • ₹43.2 Cr/yr • 30k Orders/mo
            </p>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Month-End Close: <strong className="text-emerald-400">Day 3</strong> (was 12d)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Target Recovery: <strong className="text-emerald-400">₹30L+</strong> / ₹64.8L Leakage</span>
          </div>
        </div>

        {/* DPDP Act 2023 Masking Toggle & User Role Switcher */}
        <div className="flex items-center gap-3">
          {/* DPDP Toggle Button */}
          <button
            onClick={onToggleMaskPII}
            title={maskPII ? "Customer PII masked under DPDP Act 2023" : "PII Unmasked for Audit"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              maskPII
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900'
                : 'bg-amber-950 text-amber-300 border border-amber-600/80 hover:bg-amber-900 animate-pulse'
            }`}
          >
            {maskPII ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DPDP 2023 Masked</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>PII Unmasked</span>
              </>
            )}
          </button>

          {/* User Role Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded border border-slate-700 text-xs">
            <span className="text-slate-400">Role:</span>
            <select
              value={currentUser.role}
              onChange={(e) => onRoleSwitch(e.target.value as UserRole)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="FINANCE_EXECUTIVE" className="bg-slate-900 text-white">
                Finance Executive (Priya)
              </option>
              <option value="CO_FOUNDER" className="bg-slate-900 text-white">
                Finance Co-Founder (Arjun)
              </option>
              <option value="RETURNS_MANAGER" className="bg-slate-900 text-white">
                Returns Manager (Ramesh)
              </option>
            </select>
          </div>

          {/* Reset to Pristine Data */}
          <button
            onClick={onResetSeedData}
            title="Reset database to pristine sample data"
            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-2 text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Money at Risk</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'reconciliation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Order Reconciliation</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Upload & AI Mapper</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-review')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors relative ${
            activeTab === 'ai-review'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>AI Review Queue</span>
          {pendingReviewCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500 text-white font-bold">
              {pendingReviewCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rate-cards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'rate-cards'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Rate Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'returns'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PackageSearch className="w-4 h-4" />
          <span>Returns Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'claims'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Claims & Evidence</span>
          {openClaimsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-900 font-bold">
              {openClaimsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tax-ledger')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'tax-ledger'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span>TCS & TDS Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'benchmark'
              ? 'bg-amber-600 text-white shadow-sm font-semibold'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-yellow-300" />
          <span>1-Lakh Row Benchmark</span>
        </button>
      </nav>
    </header>
  );
};
