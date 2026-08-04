import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const styles = {
    default: 'bg-slate-100/80 text-slate-700 border-slate-200/80 backdrop-blur-md',
    success: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 backdrop-blur-md',
    warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20 backdrop-blur-md',
    danger: 'bg-red-500/10 text-red-700 border-red-500/20 backdrop-blur-md',
    info: 'bg-blue-500/10 text-blue-700 border-blue-500/20 backdrop-blur-md',
    purple: 'bg-purple-500/10 text-purple-700 border-purple-500/20 backdrop-blur-md',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-xs ${styles} ${className}`}
    >
      {children}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  progress?: number;
  badgeText?: string;
  actionHref?: string;
  actionText?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'blue',
  progress,
  badgeText,
  actionHref,
  actionText,
}: StatCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      progress: 'bg-gradient-to-r from-blue-600 to-blue-500',
      glow: 'from-blue-500/10 via-blue-500/5 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progress: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
      glow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      progress: 'bg-gradient-to-r from-amber-600 to-amber-500',
      glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-purple-500/5',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      progress: 'bg-gradient-to-r from-purple-600 to-purple-500',
      glow: 'from-purple-500/10 via-purple-500/5 to-transparent',
    },
    slate: {
      bg: 'bg-slate-500/10 text-slate-700 border-slate-500/20 shadow-slate-500/5',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      progress: 'bg-gradient-to-r from-slate-600 to-slate-500',
      glow: 'from-slate-500/10 via-slate-500/5 to-transparent',
    },
  }[color];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-soft-xs min-h-[104px] transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-md hover:border-slate-300 dark:hover:border-slate-700 group flex flex-col justify-between micro-lift">
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute -right-6 -top-6 w-16 h-16 bg-gradient-to-br ${colorMap.glow} rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

      <div className="relative z-10 space-y-1">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
            {title}
          </span>
          {badgeText && (
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0 ${colorMap.badge}`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Center Content Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate leading-none">
              {value}
            </p>

            {/* Zig-Zag Upward / Downward Trend Indicator with Count/Percentage */}
            {trend && (
              <div className="flex items-center gap-1 pt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md border shadow-2xs ${
                    trendUp
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}
                >
                  {trendUp ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400 stroke-[2.5]" />
                  )}
                  <span>{trend}</span>
                </span>
              </div>
            )}

            {subtitle && !trend && (
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-1.5 rounded-xl border shrink-0 backdrop-blur-md transition-transform group-hover:scale-105 shadow-xs ${colorMap.bg}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {subtitle && trend && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate pt-0.5">
            {subtitle}
          </p>
        )}

        {/* Optional Micro Progress Bar */}
        {typeof progress === 'number' && (
          <div className="pt-0.5">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorMap.progress} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Optional Bottom Action Link */}
      {actionHref && actionText && (
        <div className="relative z-10 pt-1 mt-0.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] font-bold">
          <a
            href={actionHref}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors group-hover:translate-x-0.5"
          >
            <span>{actionText}</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'blue' | 'emerald';
}

export function ProgressBar({ progress, size = 'md', showLabel = true, color = 'blue' }: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const barColor = color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600';

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
