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
  const baseStyles = `inline-flex items-center ${alignStyle} font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none text-sm`;

  const sizeStyles = {
    sm: 'px-3 py-1.5 rounded-xl gap-1.5 h-8 text-[13px]',
    md: 'px-4 py-2 rounded-xl gap-2 h-10 text-sm',
    lg: 'px-5 py-2.5 rounded-2xl gap-2.5 h-12 text-sm',
  }[size];

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-soft-xs focus:ring-blue-500/30 font-medium',
    secondary: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-soft-xs focus:ring-slate-900/30 font-medium',
    outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-soft-xs focus:ring-slate-400/20 font-medium',
    ghost: 'bg-transparent hover:bg-slate-100/80 active:bg-slate-200/80 text-slate-700 focus:ring-slate-400/20 font-medium',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-soft-xs focus:ring-red-500/30 font-medium',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-soft-xs focus:ring-emerald-500/30 font-medium',
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
