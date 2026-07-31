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
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }: StatCardProps) {
  const iconBg = {
    blue: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
    slate: 'bg-slate-500/10 text-slate-700 border border-slate-500/20',
  }[color];

  return (
    <div className="apple-card p-6 border border-white/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl backdrop-blur-md ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
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
