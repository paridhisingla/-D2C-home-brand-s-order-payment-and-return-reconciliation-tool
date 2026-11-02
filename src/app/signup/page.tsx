'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'MERCHANDISER' | 'SUPERVISOR'>('SUPERVISOR');
  const [unitId, setUnitId] = useState('unit-1');
  const [languagePreference, setLanguagePreference] = useState<'ta' | 'en'>('ta');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must accept the Tiruppur Factory Compliance Policy.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          unitId,
          languagePreference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please verify information.');
      }

      localStorage.setItem('knittrack_role', data.user.role);
      localStorage.setItem('knittrack_user_name', data.user.name);
      localStorage.setItem('knittrack_user_email', data.user.email);
      localStorage.setItem('knittrack_lang', languagePreference);
      if (data.token) {
        localStorage.setItem('knittrack_jwt_token', data.token);
      }

      setSuccessMessage(`Account created successfully! Welcome, ${data.user.name}. Entering dashboard...`);

      setTimeout(() => {
        router.push(data.redirectUrl || (role === 'SUPERVISOR' ? '/supervisor' : '/orders'));
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold">
          <UserPlus className="w-3.5 h-3.5 text-brand-600" />
          Factory Staff Provisioning
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create factory account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 underline">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg space-y-4">
        {/* Error / Success messages */}
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

        {/* Main Registration Card */}
        <div className="bg-white py-6 px-4 shadow-sm border border-slate-200 rounded-2xl sm:px-8 space-y-4">
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (முழு பெயர்)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (ரமேஷ்)"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@tiruppurknitwear.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-9 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Workstation Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRole('SUPERVISOR');
                    setLanguagePreference('ta');
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === 'SUPERVISOR'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs">📱 Floor Supervisor</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Unit mobile entry, Tamil keypad, defect photos, offline sync.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('MERCHANDISER');
                    setLanguagePreference('en');
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === 'MERCHANDISER'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs">👔 Merchandiser</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Order setup, TNA milestones, run-rate math, AI review queue.
                  </div>
                </button>
              </div>
            </div>

            {/* Unit & Language dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Assigned Factory Unit
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="unit-1">Unit 1 - Arulpuram (Cutting & Stitching)</option>
                  <option value="unit-2">Unit 2 - Mangalam (Embroidery & Ironing)</option>
                  <option value="unit-3">Unit 3 - SIPCOT (Finishing & Packing)</option>
                  <option value="unit-sub-print">Subcontract - Murugan Printing</option>
                  <option value="unit-sub-wash">Subcontract - Sri Lakshmi Washing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Default Language
                </label>
                <select
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ta">தமிழ் (Tamil Interface)</option>
                  <option value="en">English Interface</option>
                </select>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600">
                I agree to the Company A Production Policy & Buyer Tenant Data Confidentiality rules.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account & Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Sourcing Buyers helper */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Are you an international buyer?{' '}
              <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 underline">
                Log in via Buyer Access PIN
              </Link>
            </span>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 underline">
            ← Back to Product Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
