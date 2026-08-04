'use client';

import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    await logoutClient();
  };

  const isExpanded = isHovered || mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Desktop Spacer Box */}
      <div className="hidden lg:block w-[72px] shrink-0 h-screen" />

      {/* Main Hover-Expandable Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 z-50 h-screen apple-glass-dark text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen
            ? 'translate-x-0 w-[300px] shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        } ${
          !mobileOpen && isHovered
            ? 'w-[300px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-r border-slate-700/60'
            : !mobileOpen
            ? 'lg:w-[72px] border-r border-slate-800/80'
            : ''
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 space-y-4 overflow-hidden">
          {/* Brand Header: Logo + SCIPL Elevate Title */}
          <div className="flex items-center gap-3 px-1 py-1">
            <img src="/logo.png" alt="SCIPL Elevate" className="h-9 w-auto object-contain shrink-0" />
            <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0 max-w-[210px]' : 'opacity-0 -translate-x-2 max-w-0 pointer-events-none hidden lg:block'}`}>
              <h1 className="text-xl font-black text-white tracking-tight leading-none whitespace-nowrap">SCIPL Elevate</h1>
              <p className="text-xs text-emerald-400 font-black uppercase tracking-wider whitespace-nowrap mt-1">Candidate Portal</p>
            </div>
          </div>

          {/* Nav Items (Moved Upward) */}
          <nav className="space-y-1 pt-1">
            {isExpanded && (
              <p className="px-3 text-[11px] font-black uppercase tracking-widest text-slate-300/90 whitespace-nowrap mb-1">
                NAVIGATION
              </p>
            )}

            {EMPLOYEE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={!isExpanded ? item.label : undefined}
                  className={`flex items-center ${isExpanded ? 'justify-between px-1.5' : 'justify-center px-0'} h-11 rounded-xl text-sm transition-all group/item ${
                    isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Symmetrical 40x40px Icon Container */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.4)] border border-blue-400/40 scale-[1.03]'
                          : 'bg-transparent text-slate-300 group-hover/item:bg-white/10 group-hover/item:text-white group-hover/item:scale-[1.03]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className={`whitespace-nowrap transition-all duration-200 text-sm ${isExpanded ? 'opacity-100 max-w-[180px]' : 'opacity-0 max-w-0 hidden lg:block'}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Compact Symmetrical Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          {isExpanded ? (
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-soft-xs border border-blue-400/30">
                  {employeeName.charAt(0)}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-extrabold text-white truncate leading-tight">{employeeName}</p>
                  <p className="text-xs text-slate-400 font-bold truncate mt-0.5">{departmentName}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out Session"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title={`${employeeName} - Sign Out`}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-soft-xs border border-blue-400/30 hover:scale-105 transition-transform"
            >
              {employeeName.charAt(0)}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

