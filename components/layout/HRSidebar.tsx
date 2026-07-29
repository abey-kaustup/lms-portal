'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, BarChart3, ShieldAlert } from 'lucide-react';

export function HRSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/hr/dashboard', icon: LayoutDashboard },
    { name: 'Employee Directory', href: '/hr/employees', icon: Users },
    { name: 'Course Structure', href: '/hr/course', icon: BookOpen },
    { name: 'Reports & Analytics', href: '/hr/reports', icon: BarChart3 },
    { name: 'Activity Audit Logs', href: '/hr/activity-logs', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="mb-4 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        HR Administration
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
