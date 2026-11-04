'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Smartphone,
  CheckSquare,
  Eye,
  TrendingUp,
  ArrowRight,
  Home,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function NotFoundPage() {
  const quickLinks = [
    {
      title: 'Order Board',
      desc: 'Real-time production tracking, run-rate math & filters',
      href: '/orders',
      icon: Layers,
      role: 'Merchandiser',
    },
    {
      title: 'Setup New Order',
      desc: 'Create PO, size breakdown & auto TNA schedule',
      href: '/orders/new',
      icon: Layers,
      role: 'Merchandiser',
    },
    {
      title: 'Supervisor Floor',
      desc: 'Mobile floor logging with Tamil voice & offline queue',
      href: '/supervisor',
      icon: Smartphone,
      role: 'Floor Supervisor',
    },
    {
      title: 'AI Review Queue',
      desc: 'Review Tamil notes & AI categorization with override',
      href: '/review',
      icon: CheckSquare,
      role: 'Merchandiser',
    },
    {
      title: 'Buyer Portal (UK)',
      desc: 'Read-only isolated view with milestones & photos',
      href: '/buyer?company=buyer-b-uk',
      icon: Eye,
      role: 'Overseas Buyer',
    },
    {
      title: 'MD Executive Briefing',
      desc: 'Macro loss prevention & unit capacity tracking',
      href: '/executive',
      icon: TrendingUp,
      role: 'Managing Director',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-center">
      <div className="flex justify-center mb-2">
        <Logo size="lg" />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
          <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Page Route Not Found
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Looking for a KnitTrack Screen?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          The requested URL does not match a direct route. Select any of the primary production screens below to continue:
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow transition"
        >
          <Layers className="w-4 h-4" />
          <span>Launch Order Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200/90 dark:border-slate-700 text-xs font-bold transition shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Homepage Overview</span>
        </Link>
      </div>

      {/* Grid of All Application Roles and Screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-left">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-md hover:border-brand-500 dark:hover:border-brand-500 transition group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    {item.role}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 dark:border-slate-800 flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>Open Screen</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
