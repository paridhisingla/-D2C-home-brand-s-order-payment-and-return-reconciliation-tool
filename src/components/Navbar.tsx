'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  Smartphone,
  CheckSquare,
  Eye,
  PlusCircle,
  TrendingUp,
  RotateCcw,
  Globe,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Active role stored in localStorage with fallback
  const [currentRole, setCurrentRole] = useState<'MERCHANDISER' | 'SUPERVISOR' | 'BUYER_B' | 'BUYER_C' | 'MD'>('MERCHANDISER');
  const [lang, setLang] = useState<'ta' | 'en'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('knittrack_role') as any;
    if (savedRole) setCurrentRole(savedRole);
    const savedLang = localStorage.getItem('knittrack_lang') as any;
    if (savedLang) setLang(savedLang);
  }, []);

  const handleRoleChange = (newRole: any) => {
    setCurrentRole(newRole);
    localStorage.setItem('knittrack_role', newRole);

    // Auto-navigate to appropriate starting screen for selected role
    if (newRole === 'SUPERVISOR') {
      router.push('/supervisor');
    } else if (newRole === 'BUYER_B') {
      router.push('/buyer?company=buyer-b-uk');
    } else if (newRole === 'BUYER_C') {
      router.push('/buyer?company=buyer-c-de');
    } else if (newRole === 'MD') {
      router.push('/executive');
    } else {
      router.push('/orders');
    }
  };

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    localStorage.setItem('knittrack_lang', next);
    window.dispatchEvent(new Event('languageChange'));
  };

  const handleResetData = async () => {
    if (!confirm('Reset all orders, logs and reviews to pristine sample data?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      alert('Database reset to client sample data successfully!');
      window.location.reload();
    } catch (err) {
      alert('Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  const navLinks = [
    {
      href: '/orders',
      label: lang === 'ta' ? 'ஆர்டர் போர்டு' : 'Order Board',
      icon: Layers,
      roles: ['MERCHANDISER', 'MD'],
    },
    {
      href: '/orders/new',
      label: lang === 'ta' ? 'புதிய ஆர்டர்' : 'Setup Order',
      icon: PlusCircle,
      roles: ['MERCHANDISER'],
    },
    {
      href: '/supervisor',
      label: lang === 'ta' ? 'யூனிட் தளம் (மொபைல்)' : 'Supervisor Floor',
      icon: Smartphone,
      roles: ['SUPERVISOR', 'MERCHANDISER'],
      badge: lang === 'ta' ? 'தமிழ்' : 'Tamil/Mobile',
    },
    {
      href: '/review',
      label: lang === 'ta' ? 'AI சரிபார்ப்பு' : 'AI Review Queue',
      icon: CheckSquare,
      roles: ['MERCHANDISER'],
    },
    {
      href: '/buyer?company=buyer-b-uk',
      label: lang === 'ta' ? 'பையர் போர்டல் (UK)' : 'Buyer Portal (UK)',
      icon: Eye,
      roles: ['BUYER_B', 'MERCHANDISER'],
    },
    {
      href: '/executive',
      label: lang === 'ta' ? 'நிர்வாக அறிக்கை' : 'MD Overview',
      icon: TrendingUp,
      roles: ['MD', 'MERCHANDISER'],
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
                KT
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
                  KnitTrack <span className="text-brand-600">Tiruppur</span>
                </span>
                <span className="block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Production & TNA Engine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Role Switcher & Language Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                Role:
              </span>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-white border-0 text-slate-800 font-medium text-xs rounded-lg px-2.5 py-1.5 shadow-xs focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="MERCHANDISER">👔 Merchandiser (All Access)</option>
                <option value="SUPERVISOR">📱 Unit Supervisor (Floor/Tamil)</option>
                <option value="BUYER_B">🇬🇧 Buyer: Company B (UK)</option>
                <option value="BUYER_C">🇩🇪 Buyer: Company C (Germany)</option>
                <option value="MD">📊 Managing Director (₹ Risk)</option>
              </select>
            </div>

            {/* Tamil / English Toggle */}
            <button
              onClick={toggleLanguage}
              title="Toggle Tamil / English Interface"
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Reset to Sample Data */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              title="Reset sample data"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-xs font-medium text-slate-500 mb-1">Switch User Persona:</div>
            <select
              value={currentRole}
              onChange={(e) => {
                handleRoleChange(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg p-2 font-medium"
            >
              <option value="MERCHANDISER">👔 Merchandiser (Karthik)</option>
              <option value="SUPERVISOR">📱 Unit Supervisor (முத்துசாமி)</option>
              <option value="BUYER_B">🇬🇧 Buyer Company B (UK)</option>
              <option value="BUYER_C">🇩🇪 Buyer Company C (Germany)</option>
              <option value="MD">📊 Managing Director (Sundaram)</option>
            </select>
          </div>

          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="w-4 h-4 text-brand-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300"
            >
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span>Language: {lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
