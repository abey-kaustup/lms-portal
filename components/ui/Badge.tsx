import React from 'react';

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
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 group flex flex-col justify-between">
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br ${colorMap.glow} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

      <div className="relative z-10 space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          {badgeText && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorMap.badge}`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Center Content Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-2xl border shrink-0 backdrop-blur-md transition-transform group-hover:scale-110 shadow-xs ${colorMap.bg}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Optional Micro Progress Bar */}
        {typeof progress === 'number' && (
          <div className="pt-2 space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
        <div className="relative z-10 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
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
