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
  TrendingUp,
  ArrowRight,
  Sparkles,
  KeyRound,
  UserPlus,
  Building2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';

export default function AuthenticationPage() {
  const router = useRouter();

  // Active tab state: 'presets' | 'credentials' | 'buyer-pin' | 'register'
  const [activeTab, setActiveTab] = useState<'presets' | 'credentials' | 'buyer-pin' | 'register'>('presets');

  // Currently authenticated session state
  const [currentSession, setCurrentSession] = useState<{
    role: string | null;
    email: string | null;
    name: string | null;
  }>({ role: null, email: null, name: null });

  // Sign-in form state
  const [email, setEmail] = useState('karthik@tiruppurknitwear.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('MERCHANDISER');

  // Buyer PIN / Token state
  const [buyerPin, setBuyerPin] = useState('BUYER-B-2026');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'MERCHANDISER' | 'SUPERVISOR'>('SUPERVISOR');
  const [regUnit, setRegUnit] = useState('unit-1');
  const [regLanguage, setRegLanguage] = useState<'ta' | 'en'>('ta');

  // Status & feedback state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      title: 'Senior Merchandiser (All 3 Units & TNA Management)',
      email: 'karthik@tiruppurknitwear.com',
      badge: '👔 Merchandiser',
      destination: '/orders',
      color: 'border-brand-200 hover:border-brand-500 bg-brand-50/50',
      description: 'Full order board, TNA delay run-rate math, milestone date modifications, AI Tamil review quarantine.',
    },
    {
      role: 'SUPERVISOR',
      name: 'Muthusamy (முத்துசாமி)',
      title: 'Floor Supervisor (Unit 1 - Arulpuram Cutting & Stitching)',
      email: 'muthusamy@tiruppurknitwear.com',
      badge: '📱 Unit Supervisor (தமிழ்)',
      destination: '/supervisor',
      color: 'border-amber-200 hover:border-amber-500 bg-amber-50/50',
      description: 'Mobile-first floor UI, large touch numbers, Tamil voice & text notes, offline queue sync for low-RAM phones.',
    },
    {
      role: 'BUYER_B',
      name: 'Sarah Jenkins',
      title: 'Sourcing Director (Company B - UK)',
      email: 'sarah.j@companyb-fashion.co.uk',
      badge: '🇬🇧 Buyer B (UK)',
      destination: '/buyer?company=buyer-b-uk',
      color: 'border-indigo-200 hover:border-indigo-500 bg-indigo-50/50',
      description: 'Tokenized read-only link. Strict tenant isolation (never sees Company C styles or factory costs).',
    },
    {
      role: 'BUYER_C',
      name: 'Klaus Weber',
      title: 'Import Specialist (Company C - Germany)',
      email: 'klaus.w@companyc-retail.de',
      badge: '🇩🇪 Buyer C (Germany)',
      destination: '/buyer?company=buyer-c-de',
      color: 'border-slate-200 hover:border-slate-500 bg-slate-50',
      description: 'Strict buyer portal for German retail orders. Zero cross-tenant data leakage, milestone photo log.',
    },
    {
      role: 'MD',
      name: 'V. Sundaram',
      title: 'Managing Director (Executive ₹1.08 Cr Loss Dashboard)',
      email: 'md@tiruppurknitwear.com',
      badge: '📊 Managing Director',
      destination: '/executive',
      color: 'border-rose-200 hover:border-rose-500 bg-rose-50/50',
      description: 'High-level executive financial leakage tracking (air-freight shifts, late penalties, chasing hours).',
    },
  ];

  const handleSelectPreset = (acc: typeof demoAccounts[0]) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(`Signed in as ${acc.name} (${acc.role})`);

    localStorage.setItem('knittrack_role', acc.role);
    localStorage.setItem('knittrack_user_name', acc.name);
    localStorage.setItem('knittrack_user_email', acc.email);

    setTimeout(() => {
      router.push(acc.destination);
    }, 400);
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      localStorage.setItem('knittrack_role', data.user.role);
      localStorage.setItem('knittrack_user_name', data.user.name);
      localStorage.setItem('knittrack_user_email', data.user.email);
      if (data.token) {
        localStorage.setItem('knittrack_jwt_token', data.token);
      }

      setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        router.push(data.redirectUrl || '/orders');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/buyer-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerCodeOrPin: buyerPin }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid Buyer PIN or Code');
      }

      localStorage.setItem('knittrack_role', 'BUYER');
      localStorage.setItem('knittrack_user_name', data.buyer.name);
      localStorage.setItem('knittrack_buyer_id', data.buyer.id);
      if (data.token) {
        localStorage.setItem('knittrack_jwt_token', data.token);
      }

      setSuccessMessage(`Authenticated as ${data.buyer.name}. Loading secure sourcing portal...`);
      setTimeout(() => {
        router.push(data.redirectUrl || `/buyer?company=${data.buyer.id}`);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          unitId: regUnit,
          languagePreference: regLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('knittrack_role', data.user.role);
      localStorage.setItem('knittrack_user_name', data.user.name);
      localStorage.setItem('knittrack_user_email', data.user.email);
      if (data.token) {
        localStorage.setItem('knittrack_jwt_token', data.token);
      }

      setSuccessMessage(`Account created! Welcome, ${data.user.name}. Redirecting...`);
      setTimeout(() => {
        router.push(data.redirectUrl || '/orders');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
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
    setSuccessMessage('Signed out successfully. Select a persona or log in.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          KnitTrack Tiruppur • Role-Based Authentication Center
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to KnitTrack
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Strict role separation for Merchandisers, Floor Supervisors (Tamil), UK/EU Sourcing Buyers, and Executive Leadership.
        </p>
      </div>

      {/* Active Session Banner (if signed in) */}
      {currentSession.role && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {currentSession.name ? currentSession.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-950">Currently Active: {currentSession.name || 'Demo User'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300">
                  {currentSession.role}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono">{currentSession.email || 'Authenticated Session'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              Continue to Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5 text-emerald-700" />
              <span>Switch User</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setActiveTab('presets'); setErrorMessage(null); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'presets'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1-Click Demo Personas</span>
        </button>

        <button
          onClick={() => { setActiveTab('credentials'); setErrorMessage(null); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'credentials'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email & Password</span>
        </button>

        <button
          onClick={() => { setActiveTab('buyer-pin'); setErrorMessage(null); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'buyer-pin'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Buyer PIN / Token Portal</span>
        </button>

        <button
          onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'register'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Factory Account</span>
        </button>
      </div>

      {/* Tab 1: 1-Click Demo Personas */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select any role to test its specific capabilities immediately:
            </span>
            <span className="text-[11px] text-slate-400">All sample data pre-seeded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectPreset(acc)}
                disabled={loading}
                className={`text-left p-4 rounded-xl border transition-all shadow-xs flex flex-col justify-between group hover:shadow-md ${acc.color} ${
                  loading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition">
                      {acc.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {acc.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-1">{acc.title}</div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{acc.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">{acc.email}</span>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Enter Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Email & Password Sign In */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-base">Sign In with Factory Credentials</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticates via JWT token against the Express MongoDB service.
              </p>
            </div>

            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                    placeholder="karthik@tiruppurknitwear.com"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Hint: Demo password is <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">demo123</code></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Workstation Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="MERCHANDISER">Merchandiser (Order Setup, TNA, AI Review)</option>
                  <option value="SUPERVISOR">Floor Supervisor (Unit 1/2/3 Mobile Screen)</option>
                  <option value="BUYER_B">Buyer: Company B (UK)</option>
                  <option value="BUYER_C">Buyer: Company C (Germany)</option>
                  <option value="MD">Managing Director (Financial Dashboard)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Workstation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right helper card */}
          <div className="md:col-span-2 space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Security Specifications
            </h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Role Middleware:</strong> Floor supervisors cannot create orders; buyers cannot view factory run-rate costs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Rate Limiting:</strong> 20 attempts per 15 minutes to protect factory endpoints.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Token Resilience:</strong> JWT tokens valid for 7 days, allowing floor phones to reconnect without re-authenticating.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Buyer PIN / Token Access */}
      {activeTab === 'buyer-pin' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-base">Buyer Token & PIN Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                For UK and European sourcing teams accessing their tokenized read-only status portal.
              </p>
            </div>

            <form onSubmit={handleBuyerPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buyer Access PIN or Buyer Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={buyerPin}
                    onChange={(e) => setBuyerPin(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                    placeholder="BUYER-B-2026 or BUYER-C-2026"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setBuyerPin('BUYER-B-2026')}
                    className="text-[11px] px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-mono"
                  >
                    Use Buyer B PIN (UK)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyerPin('BUYER-C-2026')}
                    className="text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 font-mono"
                  >
                    Use Buyer C PIN (Germany)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {loading ? (
                  <span>Verifying Sourcing Access...</span>
                ) : (
                  <>
                    <span>Unlock Buyer Read-Only Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
              Tenant Isolation Guarantee
            </h3>
            <p className="text-xs text-indigo-900 leading-relaxed">
              In knitwear manufacturing, buyer contracts strictly forbid exposing styles, order volumes, or factory margins to competing brands.
            </p>
            <ul className="text-xs text-indigo-800 space-y-1.5">
              <li>• Company B (UK) only sees POs B-PO-88213 and B-PO-88240.</li>
              <li>• Company C (Germany) only sees PO C-PO-0488.</li>
              <li>• Milestones and floor photos only appear after Merchandiser verification.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Register Factory Account */}
      {activeTab === 'register' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">Create New Factory Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision an employee workstation login for Tiruppur units.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Ramesh Kumar (ரமேஷ்)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                  placeholder="ramesh@tiruppurknitwear.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="SUPERVISOR">Floor Supervisor</option>
                  <option value="MERCHANDISER">Merchandiser</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Factory Unit
                </label>
                <select
                  value={regUnit}
                  onChange={(e) => setRegUnit(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="unit-1">Unit 1 - Arulpuram</option>
                  <option value="unit-2">Unit 2 - Mangalam</option>
                  <option value="unit-3">Unit 3 - SIPCOT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Language
                </label>
                <select
                  value={regLanguage}
                  onChange={(e) => setRegLanguage(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60 pt-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account & Enter</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <Link href="/" className="hover:text-slate-800 underline">
          ← Back to Product Overview & ROI Analysis
        </Link>
        <span>
          Tiruppur Knitwear Production Tracking System • ₹1.08 Cr Loss Recovery
        </span>
      </div>
    </div>
  );
}
