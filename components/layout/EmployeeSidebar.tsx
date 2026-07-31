'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutClient } from '@/lib/auth-client';
import {
  Sparkles,
  BookOpen,
  FileCheck2,
  Award,
  ShieldCheck,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';

interface EmployeeSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  employeeName?: string;
  departmentName?: string;
  isMasterTester?: boolean;
}

const EMPLOYEE_NAV_ITEMS = [
  { label: 'Induction Overview', href: '/employee/dashboard', icon: Sparkles },
  { label: 'Learning Center', href: '/employee/learn', icon: BookOpen },
  { label: 'Assessment Test', href: '/employee/assessment', icon: FileCheck2 },
  { label: 'My Certificate', href: '/employee/certificate', icon: Award },
];

export function EmployeeSidebar({
  mobileOpen,
  onCloseMobile,
  employeeName = 'Employee',
  departmentName = 'Staff',
  isMasterTester = false,
}: EmployeeSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutClient();
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] apple-glass-dark text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] border border-blue-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">Employee Induction</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Learning Portal</p>
            </div>
          </div>

          {/* HR Switcher */}
          <Link
            href="/hr/dashboard"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium group backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-white">HR Admin Console</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5 pt-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">NAVIGATION</p>
            {EMPLOYEE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] border border-blue-400/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {employeeName.charAt(0)}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{employeeName}</p>
              <p className="text-xs text-slate-400 font-normal truncate">{departmentName}</p>
              {isMasterTester && (
                <span className="inline-block text-[9px] font-extrabold bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md border border-purple-400/40 mt-1 uppercase tracking-wider">
                  MASTER TEST ACCOUNT
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
