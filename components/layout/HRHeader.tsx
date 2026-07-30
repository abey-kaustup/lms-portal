'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  Command,
  ShieldCheck,
  User,
} from 'lucide-react';
import { CommandPalette } from '@/components/ui/CommandPalette';

export interface HRHeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userSubtitle?: string;
  userInitials?: string;
  onToggleMobileSidebar?: () => void;
}

export function HRHeader({
  userName = 'Authenticating...',
  userEmail = 'user@corporate.local',
  userRole = 'Staff Member',
  userSubtitle,
  userInitials,
  onToggleMobileSidebar,
}: HRHeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    window.location.href = '/login';
  };

  const displayInitials = userInitials || (userName ? userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U');
  const displaySubtitle = userSubtitle || userRole;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Global Command Search Launcher */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-medium border border-slate-200/60 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Search employees, departments, course modules...</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 font-mono shadow-soft-xs">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Quick Action Bell, System Badge, User Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Environment Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Induction System Online</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-600 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-slate-200 shadow-soft-xl p-4 space-y-3 z-40 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900">System Notifications</h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">2 New</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50/50 rounded-2xl border border-blue-100/60">
                    <p className="font-bold text-slate-900">Active Induction Session</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Welcome to your corporate onboarding workspace.</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/60">
                    <p className="font-bold text-slate-900">Compliance Benchmark Met</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Induction progress synced with HRMS.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl hover:bg-slate-100/80 transition-colors border border-slate-200/60"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-soft-xs shrink-0">
                {displayInitials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[200px]">{userName}</p>
                <p className="text-[10px] font-medium text-slate-500 truncate max-w-[220px]">{displaySubtitle}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-soft-xl p-2 z-40 text-xs animate-in fade-in duration-150 space-y-1">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 text-sm truncate">{userName}</p>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{displaySubtitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette Launcher */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
