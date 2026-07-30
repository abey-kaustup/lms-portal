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
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
          <Link href="/hr/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Home</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-blue-600 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-800">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Page Heading (H1) 32px / 700 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold text-slate-900 tracking-tight">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-1 font-normal">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>

      {/* Optional Top Statistics Row */}
      {stats.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(stats.length, 4)} gap-4 pt-2`}>
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
