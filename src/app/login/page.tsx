'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  Smartphone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();

  // Authentication form state
  const [email, setEmail] = useState('karthik@tiruppurknitwear.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Buyer PIN modal / direct login toggle
  const [isBuyerMode, setIsBuyerMode] = useState(false);
  const [buyerPin, setBuyerPin] = useState('BUYER-B-2026');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Status & feedback state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current session
  const [currentSession, setCurrentSession] = useState<{
    role: string | null;
    email: string | null;
    name: string | null;
  }>({ role: null, email: null, name: null });

  useEffect(() => {
    const role = localStorage.getItem('knittrack_role');
    const email = localStorage.getItem('knittrack_user_email');
    const name = localStorage.getItem('knittrack_user_name');
    if (role) {
      setCurrentSession({ role, email, name });
    }
  }, []);

  const demoAccounts = [
    {
      role: 'MERCHANDISER',
      name: 'Karthik Subramanian',
      label: '👔 Merchandiser',
      email: 'karthik@tiruppurknitwear.com',
      destination: '/orders',
      color: 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50',
    },
    {
      role: 'SUPERVISOR',
      name: 'Muthusamy (முத்துசாமி)',
      label: '📱 Supervisor (தமிழ்)',
      email: 'muthusamy@tiruppurknitwear.com',
      destination: '/supervisor',
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    },
    {
      role: 'BUYER_B',
      name: 'Sarah Jenkins',
      label: '🇬🇧 Buyer B (UK)',
      email: 'sarah.j@companyb-fashion.co.uk',
      destination: '/buyer?company=buyer-b-uk',
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
    },
    {
      role: 'BUYER_C',
      name: 'Klaus Weber',
      label: '🇩🇪 Buyer C (Germany)',
      email: 'klaus.w@companyc-retail.de',
      destination: '/buyer?company=buyer-c-de',
      color: 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-stone-300 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-700',
    },
    {
      role: 'MD',
      name: 'V. Sundaram',
      label: '📊 Managing Director',
      email: 'md@tiruppurknitwear.com',
      destination: '/executive',
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/50',
    },
  ];

  const handleInstantDemoLogin = (acc: typeof demoAccounts[0]) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(`Logging in as ${acc.name}...`);

    localStorage.setItem('knittrack_role', acc.role);
    localStorage.setItem('knittrack_user_name', acc.name);
    localStorage.setItem('knittrack_user_email', acc.email);

    setTimeout(() => {
      router.push(acc.destination);
    }, 350);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isBuyerMode) {
        // Buyer PIN verification
        const res = await fetch('/api/auth/buyer-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buyerCodeOrPin: buyerPin }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Invalid Buyer Access PIN');
        }
        localStorage.setItem('knittrack_role', 'BUYER');
        localStorage.setItem('knittrack_user_name', data.buyer.name);
        localStorage.setItem('knittrack_buyer_id', data.buyer.id);
        if (data.token) localStorage.setItem('knittrack_jwt_token', data.token);

        setSuccessMessage(`Welcome, ${data.buyer.name}! Loading sourcing portal...`);
        setTimeout(() => router.push(data.redirectUrl || `/buyer?company=${data.buyer.id}`), 400);
      } else {
        // Standard user login
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Authentication failed. Please verify email and password.');
        }

        localStorage.setItem('knittrack_role', data.user.role);
        localStorage.setItem('knittrack_user_name', data.user.name);
        localStorage.setItem('knittrack_user_email', data.user.email);
        if (data.token) localStorage.setItem('knittrack_jwt_token', data.token);

        setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting...`);
        setTimeout(() => router.push(data.redirectUrl || '/orders'), 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('knittrack_role');
    localStorage.removeItem('knittrack_user_name');
    localStorage.removeItem('knittrack_user_email');
    localStorage.removeItem('knittrack_jwt_token');
    setCurrentSession({ role: null, email: null, name: null });
    setSuccessMessage('Logged out successfully.');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center mb-1">
          <Logo size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          KnitTrack Tiruppur • Production Security
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Log in to your account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Or{' '}
          <Link href="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            create a new factory account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Active Session Alert */}
        {currentSession.role && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="font-bold">Active Session:</span> {currentSession.name} ({currentSession.role})
            </div>
            <div className="flex gap-2">
              <Link
                href={
                  currentSession.role === 'SUPERVISOR'
                    ? '/supervisor'
                    : currentSession.role.startsWith('BUYER')
                    ? '/buyer'
                    : currentSession.role === 'MD'
                    ? '/executive'
                    : '/orders'
                }
                className="font-bold underline hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Go to App →
              </Link>
              <button onClick={handleSignOut} className="text-slate-500 dark:text-slate-400 hover:text-rose-600">
                (Sign out)
              </button>
            </div>
          </div>
        )}

        {/* Error / Success messages */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Evaluation Quick Logins for Reviewers */}
        <div className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              1-Click Reviewer Presets:
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Instant evaluation</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleInstantDemoLogin(acc)}
                disabled={loading}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition shadow-2xs ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 py-6 px-5 sm:px-8 shadow-xs border border-stone-200/90 dark:border-slate-800 rounded-2xl space-y-5">
          {/* Mode Switcher: Factory Staff vs Buyer Portal */}
          <div className="flex rounded-xl bg-stone-100 dark:bg-slate-800 p-1 text-xs border border-stone-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setIsBuyerMode(false); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                !isBuyerMode ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Factory Staff Login
            </button>
            <button
              type="button"
              onClick={() => { setIsBuyerMode(true); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                isBuyerMode ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Overseas Buyer PIN
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {!isBuyerMode ? (
              <>
                {/* Email field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@tiruppurknitwear.com"
                      className="w-full text-xs pl-10 pr-3 py-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-mono shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-10 pr-10 py-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-mono shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Demo password: <code className="text-slate-800 dark:text-slate-200 bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono font-bold">demo123</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-stone-300 dark:border-slate-700 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Remember my session for 7 days
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* Buyer PIN mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Buyer Access PIN or Buyer Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={buyerPin}
                      onChange={(e) => setBuyerPin(e.target.value)}
                      placeholder="e.g. BUYER-B-2026 or BUYER-C-2026"
                      className="w-full text-xs pl-10 pr-3 py-2.5 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-mono uppercase shadow-2xs"
                    />
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={() => setBuyerPin('BUYER-B-2026')}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-mono font-bold"
                    >
                      Company B (UK)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyerPin('BUYER-C-2026')}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-stone-300 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-700 font-mono font-bold"
                    >
                      Company C (Germany)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Enforces strict tenant isolation: Buyer B never sees Buyer C orders or factory pricing.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60 ${
                isBuyerMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>{isBuyerMode ? 'Access Buyer Sourcing Portal' : 'Sign in to KnitTrack'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Redirect CTA */}
          <div className="pt-4 border-t border-stone-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Need a factory staff or floor supervisor login?
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1 w-full py-2.5 px-3 rounded-xl border border-stone-300 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              <span>Create New Factory Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline font-semibold">
            ← Back to Product Overview
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-stone-200/90 dark:border-slate-800">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Demo Password Notice</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              All demo accounts (Senior Merchandiser, Floor Supervisor, UK Buyer, German Buyer, and MD) are configured with password:
            </p>
            <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-xl text-center font-mono font-bold text-slate-800 dark:text-slate-200 text-sm border border-stone-200 dark:border-slate-700">
              demo123
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              In production, password reset sends an encrypted one-time link to the user&apos;s registered Tiruppur corporate email.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
