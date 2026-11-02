'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  Smartphone,
  Eye,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('karthik@tiruppurknitwear.com');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState('MERCHANDISER');

  const demoAccounts = [
    {
      role: 'MERCHANDISER',
      name: 'Karthik Subramanian',
      title: 'Senior Merchandiser (All Factory Access)',
      email: 'karthik@tiruppurknitwear.com',
      badge: '👔 Merchandiser',
      destination: '/orders',
      color: 'border-brand-300 hover:border-brand-500 bg-brand-50/40',
    },
    {
      role: 'SUPERVISOR',
      name: 'Muthusamy (முத்துசாமி)',
      title: 'Floor Supervisor (Unit 1 - Arulpuram)',
      email: 'muthusamy@tiruppurknitwear.com',
      badge: '📱 Unit Supervisor (தமிழ்)',
      destination: '/supervisor',
      color: 'border-amber-300 hover:border-amber-500 bg-amber-50/40',
    },
    {
      role: 'BUYER_B',
      name: 'Sarah Jenkins',
      title: 'Sourcing Manager (Company B - UK)',
      email: 'sarah.j@companyb-fashion.co.uk',
      badge: '🇬🇧 Buyer B (UK)',
      destination: '/buyer?company=buyer-b-uk',
      color: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/40',
    },
    {
      role: 'BUYER_C',
      name: 'Klaus Weber',
      title: 'Import Specialist (Company C - Germany)',
      email: 'klaus.w@companyc-retail.de',
      badge: '🇩🇪 Buyer C (Germany)',
      destination: '/buyer?company=buyer-c-de',
      color: 'border-slate-300 hover:border-slate-500 bg-slate-50',
    },
    {
      role: 'MD',
      name: 'V. Sundaram',
      title: 'Managing Director (₹1.08 Cr Loss Tracking)',
      email: 'md@tiruppurknitwear.com',
      badge: '📊 Managing Director',
      destination: '/executive',
      color: 'border-rose-300 hover:border-rose-500 bg-rose-50/40',
    },
  ];

  const handleSelectPreset = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setRole(acc.role);
    localStorage.setItem('knittrack_role', acc.role);
    router.push(acc.destination);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('knittrack_role', role);
    const target = demoAccounts.find((a) => a.role === role);
    router.push(target ? target.destination : '/orders');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          KnitTrack Role-Based Sign-In
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to KnitTrack Tiruppur
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select a pre-configured role account below for instant evaluation or sign in with your credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Left: Quick 1-Click Persona Cards */}
        <div className="md:col-span-3 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            One-Click Reviewer Persona Presets:
          </div>

          <div className="space-y-2.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectPreset(acc)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all shadow-xs flex items-center justify-between group hover:shadow-md ${acc.color}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition">
                      {acc.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">
                      {acc.badge}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{acc.title}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{acc.email}</div>
                </div>

                <div className="p-2 rounded-lg bg-white/80 border border-slate-200 text-slate-400 group-hover:text-brand-600 group-hover:bg-white transition flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Manual Sign-In Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm">Manual Sign-In</h2>
            <p className="text-[11px] text-slate-400">All demo passwords: demo123</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="MERCHANDISER">Merchandiser (Karthik)</option>
                <option value="SUPERVISOR">Floor Supervisor (முத்துசாமி)</option>
                <option value="BUYER_B">Buyer: Company B (UK)</option>
                <option value="BUYER_C">Buyer: Company C (Germany)</option>
                <option value="MD">Managing Director (Sundaram)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 pt-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
