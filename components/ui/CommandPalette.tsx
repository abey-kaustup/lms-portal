'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  BarChart3,
  History,
  FileCheck2,
  Award,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Employee';
  href: string;
  icon: React.ElementType;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'dash', title: 'HR Admin Dashboard', category: 'Navigation', href: '/hr/dashboard', icon: LayoutDashboard },
  { id: 'depts', title: 'Departments Directory', category: 'Navigation', href: '/hr/departments', icon: Building2 },
  { id: 'course', title: 'Course Architecture & Curriculum', category: 'Navigation', href: '/hr/course', icon: BookOpen },
  { id: 'emps', title: 'Employee Directory & Onboarding', category: 'Navigation', href: '/hr/employees', icon: Users },
  { id: 'reports', title: 'Compliance & Analytics Reports', category: 'Navigation', href: '/hr/reports', icon: BarChart3 },
  { id: 'logs', title: 'Security & Activity Logs', category: 'Navigation', href: '/hr/activity-logs', icon: History },
  { id: 'emp-dash', title: 'Employee Induction Portal', category: 'Navigation', href: '/employee/dashboard', icon: Sparkles },
  { id: 'emp-learn', title: 'Learning Workspace & Videos', category: 'Navigation', href: '/employee/learn', icon: BookOpen },
  { id: 'emp-assess', title: 'Take Assessment', category: 'Navigation', href: '/employee/assessment', icon: FileCheck2 },
  { id: 'emp-cert', title: 'View & Download Certificate', category: 'Navigation', href: '/employee/certificate', icon: Award },
];

export function CommandPalette({
  isOpen,
  onClose,
  userRole = 'EMPLOYEE',
}: {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isHR = userRole === 'HR_ADMIN';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Strict role-based command filtering
  // Non-HR users MUST NOT see administrative commands, employee directories, or HR reports
  const rolePermittedItems = COMMAND_ITEMS.filter((item) => {
    if (!isHR && item.href.startsWith('/hr')) {
      return false;
    }
    return true;
  });

  const filteredItems = rolePermittedItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md transition-all">
      <div
        className="w-full max-w-xl apple-glass rounded-3xl border border-white/80 shadow-[0_24px_64px_0_rgba(15,23,42,0.25)] overflow-hidden space-y-0 text-xs apple-dropdown-anim-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 gap-3">
          <Search className="w-4 h-4 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={
              isHR
                ? 'Type a command or search page (e.g. Course, Employees, Reports)...'
                : 'Search learning center (e.g. Lessons, Assessment, Certificate)...'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <p className="text-slate-400 text-center py-8 font-medium">No matching commands found.</p>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Navigation Shortcut:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">
              Ctrl + K
            </kbd>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
