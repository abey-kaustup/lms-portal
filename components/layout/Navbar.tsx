'use client';

import React from 'react';
import { UserSession } from '@/types';
import { logoutClient } from '@/lib/auth-client';
import { GraduationCap, LogOut, User, ShieldCheck, Building2 } from 'lucide-react';

interface NavbarProps {
  session: UserSession;
}

export function Navbar({ session }: NavbarProps) {
  const handleLogout = async () => {
    await logoutClient();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-xs text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Corporate LMS Portal
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Enterprise
              </span>
            </h1>
            <p className="text-xs text-slate-400">Employee Induction & Compliance Management</p>
          </div>
        </div>

        {/* Right Session info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="p-1.5 rounded-lg bg-slate-700 text-slate-300">
              {session.role === 'HR_ADMIN' ? (
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              ) : (
                <User className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-100">{session.name}</p>
              <p className="text-slate-400 flex items-center gap-1">
                <span className="capitalize">{session.role.replace('_', ' ')}</span>
                {session.department && <span>• {session.department}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            title="Sign out of system"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
