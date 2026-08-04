'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';

export const ThemeSwitcher = memo(function ThemeSwitcher({
  className = '',
}: {
  className?: string;
}) {
  const { theme, toggleTheme, mounted } = useThemeSwitcher();

  const handleToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // View Transitions Radial Sweep Animation (Top-Right -> Bottom-Left Light Bulb Effect)
      if (typeof document === 'undefined' || !(document as any).startViewTransition) {
        toggleTheme();
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const isCurrentlyDark = theme === 'dark';

      const transition = (document as any).startViewTransition(() => {
        toggleTheme();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: isCurrentlyDark ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 750,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            pseudoElement: isCurrentlyDark
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
          }
        );
      });
    },
    [theme, toggleTheme]
  );

  if (!mounted) {
    return (
      <div className={`w-14 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Toggle Theme. Current theme: ${theme}`}
      title={`Current: ${theme.toUpperCase()} mode. Click for radial light bulb theme transition.`}
      className={`relative flex items-center justify-between p-1 w-14 h-8 rounded-full border backdrop-blur-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-blue-400'
          : 'bg-slate-100/90 border-slate-300/80 text-amber-500'
      } ${className}`}
    >
      {/* Background Icons */}
      <div className="flex items-center justify-between w-full px-1 pointer-events-none">
        <Sun className={`w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? 'opacity-30 text-slate-500' : 'opacity-100 text-amber-500'}`} />
        <Moon className={`w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? 'opacity-100 text-blue-400' : 'opacity-30 text-slate-400'}`} />
      </div>

      {/* Sliding Apple Spring Knob */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={`absolute top-1 bottom-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center pointer-events-none ${
          isDark ? 'right-1' : 'left-1'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20 stroke-[2.5]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 stroke-[2.5]" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
});
