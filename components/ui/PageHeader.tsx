import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { StatCard } from './Badge';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  stats?: StatItem[];
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  primaryAction,
  secondaryActions,
  stats = [],
}: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
          <Link href="/hr/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Home</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-300">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Compact Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{title}</h1>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>

      {/* Optional Top Statistics Row */}
      {stats.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(stats.length, 4)} gap-3 pt-1`}>
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color || 'blue'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
