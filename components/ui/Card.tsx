import React from 'react';

interface CardProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, id, className = '', hoverable = true, padding = 'md' }: CardProps) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  }[padding];

  const hoverStyles = hoverable
    ? 'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)]'
    : '';

  return (
    <div
      id={id}
      className={`apple-card ${paddingStyles} ${hoverStyles} transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col space-y-0.5 border-b border-slate-100/80 dark:border-slate-800/80 pb-3 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs text-slate-500 dark:text-slate-400 font-medium ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between border-t border-slate-100/80 dark:border-slate-800/80 pt-3 mt-3 ${className}`}>
      {children}
    </div>
  );
}
