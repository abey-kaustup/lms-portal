import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const alignStyle = className.includes('justify-') ? '' : 'justify-center';
  const baseStyles = `inline-flex items-center ${alignStyle} font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] hover:-translate-y-0.5`;

  const sizeStyles = {
    sm: 'px-3 py-1 rounded-xl gap-1.5 h-7 text-xs font-semibold',
    md: 'px-3.5 py-1.5 rounded-xl gap-1.5 h-9 text-xs sm:text-sm font-semibold',
    lg: 'px-4.5 py-2 rounded-xl gap-2 h-10.5 text-sm font-bold',
  }[size];

  const variantStyles = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.28)] border border-blue-400/30 focus:ring-blue-500/30',
    secondary: 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white shadow-[0_4px_14px_0_rgba(15,23,42,0.25)] border border-slate-700/40 focus:ring-slate-900/30',
    outline: 'bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 border border-slate-200/90 shadow-[0_2px_8px_0_rgba(15,23,42,0.04)] focus:ring-slate-400/20',
    ghost: 'bg-transparent hover:bg-slate-200/50 active:bg-slate-200/80 text-slate-700 focus:ring-slate-400/20',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.28)] border border-red-400/30 focus:ring-red-500/30',
    success: 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.28)] border border-emerald-400/30 focus:ring-emerald-500/30',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      {children}

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
}
