'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  BarChart3,
  History,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarGroup {
  groupLabel: string;
  items: SidebarItem[];
}

const MENU_GROUPS: SidebarGroup[] = [
  {
    groupLabel: 'MAIN',
    items: [
      { label: 'Admin Dashboard', href: '/hr/dashboard', icon: LayoutDashboard },
      { label: 'Departments', href: '/hr/departments', icon: Building2 },
    ],
  },
  {
    groupLabel: 'LEARNING ARCHITECTURE',
    items: [
      { label: 'Induction Course', href: '/hr/course', icon: BookOpen },
      { label: 'Employee Directory', href: '/hr/employees', icon: Users },
    ],
  },
  {
    groupLabel: 'GOVERNANCE & ANALYTICS',
    items: [
      { label: 'Reports & Compliance', href: '/hr/reports', icon: BarChart3 },
      { label: 'Activity Audit Logs', href: '/hr/activity-logs', icon: History },
    ],
  },
];

export function HRSidebar({ mobileOpen, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutClient();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[260px] apple-glass-dark text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Logo & App Brand Header */}
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] border border-blue-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">Corporate LMS</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">HR Admin Console</p>
            </div>
          </div>

          {/* Employee Induction Quick Access Switcher Card */}
          <Link
            href="/employee/dashboard"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium group backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-white">Employee Portal</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Navigation Menu Groups */}
          <nav className="space-y-6">
            {MENU_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.groupLabel}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/hr/dashboard' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all relative ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] border border-blue-400/30 font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out Session</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
