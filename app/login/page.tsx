'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginHR, loginEmployee } from '@/actions/auth';
import { GraduationCap, ShieldCheck, User, ArrowRight, Lock } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectFrom = searchParams.get('from');

  const [tab, setTab] = useState<'EMPLOYEE' | 'HR'>('EMPLOYEE');
  const [employeeId, setEmployeeId] = useState('');
  const [hrUsername, setHrUsername] = useState('');
  const [hrPassword, setHrPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('employeeId', employeeId);

    try {
      const res = await loginEmployee(null, formData);
      if (res.success && res.redirectUrl) {
        router.push(redirectFrom || res.redirectUrl);
      } else {
        setError(res.error || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleHRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('username', hrUsername);
    formData.append('password', hrPassword);

    try {
      const res = await loginHR(null, formData);
      if (res.success && res.redirectUrl) {
        router.push(redirectFrom || res.redirectUrl);
      } else {
        setError(res.error || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
        <button
          onClick={() => {
            setTab('EMPLOYEE');
            setError('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${tab === 'EMPLOYEE'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <User className="w-4 h-4 text-emerald-600" />
          <span>Employee Login</span>
        </button>

        <button
          onClick={() => {
            setTab('HR');
            setError('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${tab === 'HR'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>HR Admin</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
          {error}
        </div>
      )}

      {/* Employee Login Form */}
      {tab === 'EMPLOYEE' ? (
        <form onSubmit={handleEmployeeLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Corporate Employee ID</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. EMP1001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Internal network authentication. Password or OTP is not required.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Learning Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-left">
            <p className="text-[11px] font-bold text-emerald-900">Demo Employee ID:</p>
            <p className="text-[11px] text-emerald-700 font-mono mt-0.5">EMP1001, EMP1002, EMP1003</p>
          </div>
        </form>
      ) : (
        /* HR Admin Login Form */
        <form onSubmit={handleHRLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">HR Username</label>
            <input
              type="text"
              required
              placeholder="admin"
              value={hrUsername}
              onChange={(e) => setHrUsername(e.target.value)}
              className="w-full px-3.5 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={hrPassword}
                onChange={(e) => setHrPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Login as HR Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-left">
            <p className="text-[11px] font-bold text-blue-900">Demo HR Admin Credentials:</p>
            <p className="text-[11px] text-blue-700 font-mono mt-0.5">Username: admin | Password: admin123</p>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 text-white rounded-2xl shadow-lg mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Corporate LMS Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Employee Induction & Compliance Platform</p>
        </div>

        <Suspense fallback={<div className="p-8 bg-white rounded-3xl text-center text-xs text-slate-400">Loading Login...</div>}>
          <LoginFormContent />
        </Suspense>

        <div className="text-center text-xs text-slate-400">
          Internal Corporate Network • Protected by JWT Session Security
        </div>
      </div>
    </div>
  );
}
