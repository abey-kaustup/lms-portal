'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutClient } from '@/lib/auth-client';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  Command,
  ShieldCheck,
  Sparkles,
  BookOpen,
  FileCheck2,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { CommandPalette } from '@/components/ui/CommandPalette';

export interface HRHeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: string; // 'HR_ADMIN' | 'EMPLOYEE' | string
  userSubtitle?: string;
  userInitials?: string;
  onToggleMobileSidebar?: () => void;
}

type ActiveMenu = 'system' | 'user' | 'notifications' | null;

export function HRHeader({
  userName,
  userEmail,
  userRole = 'EMPLOYEE',
  userSubtitle,
  userInitials,
  onToggleMobileSidebar,
}: HRHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [liveUser, setLiveUser] = useState<any>(null);

  const isHR = userRole === 'HR_ADMIN';

  // Fetch live user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setLiveUser(data.user);
          }
        }
      } catch (e) {
        console.error('Header user fetch error:', e);
      }
    }
    fetchUser();
  }, []);

  // Close any open dropdown menu on route changes
  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  // Handle outside click, Escape key, and scroll listeners for all dropdowns
  useEffect(() => {
    if (!activeMenu) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    const handleScroll = () => {
      setActiveMenu(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [activeMenu]);

  const toggleMenu = (menu: ActiveMenu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const closeAllMenus = () => {
    setActiveMenu(null);
  };

  const handleLogout = async () => {
    closeAllMenus();
    await logoutClient();
  };

  // Determine active display properties using live fetched user as primary source of truth
  const effectiveRole = liveUser?.role || userRole;
  const nameToDisplay =
    liveUser?.name ||
    (userName && userName !== 'John Doe' && userName !== 'Authenticating...'
      ? userName
      : 'Kaustubh Bhatlawande');

  const subtitleToDisplay =
    liveUser?.subtitle ||
    userSubtitle ||
    (liveUser?.employeeId
      ? `${liveUser.employeeId} • ${liveUser.department} • ${liveUser.designation}`
      : 'EMP7777 • IT Department • Software Engineer');

  const initialsToDisplay =
    liveUser?.initials ||
    userInitials ||
    (nameToDisplay
      ? nameToDisplay
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'KB');

  const emailToDisplay =
    liveUser?.email ||
    (userEmail && !userEmail.includes('john.doe')
      ? userEmail
      : 'kaustubh@company.local');

  return (
    <>
      <header
        ref={headerRef}
        className="relative z-40 w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs"
      >
        {/* Left: Mobile Toggle & Global Command Search Launcher */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 hover:bg-slate-200/50 rounded-xl lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              closeAllMenus();
              setCommandOpen(true);
            }}
            className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-medium border border-slate-200 transition-all group shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>
                {effectiveRole === 'HR_ADMIN'
                  ? 'Search employees, departments, course modules...'
                  : 'Search learning center, lessons, certificate...'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80 font-mono">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Quick Action Bell, System Status Dropdown, User Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* 1. Induction System Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('system')}
              aria-expanded={activeMenu === 'system'}
              aria-haspopup="true"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeMenu === 'system'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 border-emerald-200/80'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Induction System</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  activeMenu === 'system' ? 'rotate-180 text-emerald-900' : 'text-emerald-600'
                }`}
              />
            </button>

            {activeMenu === 'system' && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-3 z-50 text-xs apple-dropdown-anim">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900">System Status</h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    Operational
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Enterprise Security</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">JWT session validation active</p>
                  </div>

                  <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Navigation</p>

                  {effectiveRole === 'HR_ADMIN' ? (
                    <div className="space-y-1">
                      <Link
                        href="/hr/dashboard"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>HR Admin Dashboard</span>
                      </Link>
                      <Link
                        href="/hr/course"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>Induction Curriculum</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Link
                        href="/employee/dashboard"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Induction Overview</span>
                      </Link>
                      <Link
                        href="/employee/learn"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>Learning Center</span>
                      </Link>
                      <Link
                        href="/employee/assessment"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
                      >
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span>Assessment Test</span>
                      </Link>
                      <Link
                        href="/employee/certificate"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
                      >
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>My Certificate</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('notifications')}
              aria-expanded={activeMenu === 'notifications'}
              aria-haspopup="true"
              className={`p-2.5 rounded-xl transition-colors relative ${
                activeMenu === 'notifications'
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {activeMenu === 'notifications' && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-3 z-50 text-xs apple-dropdown-anim">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900">System Notifications</h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    2 New
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="font-bold text-slate-900">Active Induction Session</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Welcome to your corporate onboarding workspace.</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="font-bold text-slate-900">Compliance Benchmark Met</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Induction progress synced with HRMS.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('user')}
              aria-expanded={activeMenu === 'user'}
              aria-haspopup="true"
              className={`flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl transition-colors border ${
                activeMenu === 'user'
                  ? 'bg-slate-100 border-blue-300 ring-2 ring-blue-500/20'
                  : 'hover:bg-slate-100/80 border-slate-200/60'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-soft-xs shrink-0">
                {initialsToDisplay}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[200px]">
                  {nameToDisplay}
                </p>
                <p className="text-[10px] font-medium text-slate-500 truncate max-w-[220px]">
                  {subtitleToDisplay}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  activeMenu === 'user' ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {activeMenu === 'user' && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-xs apple-dropdown-anim space-y-1">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 text-sm truncate">{nameToDisplay}</p>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{subtitleToDisplay}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{emailToDisplay}</p>
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
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        userRole={effectiveRole}
      />
    </>
  );
}
