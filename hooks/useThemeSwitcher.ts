'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { Theme } from '@/lib/theme';

export function useThemeSwitcher() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    const active = resolvedTheme || theme || 'light';
    if (active === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, [theme, resolvedTheme, setTheme]);

  const currentTheme = (resolvedTheme as Theme) || (theme as Theme) || 'light';

  return {
    theme: currentTheme,
    rawTheme: theme,
    resolvedTheme: (resolvedTheme as 'light' | 'dark') || 'light',
    systemTheme,
    setTheme: changeTheme,
    toggleTheme,
    mounted,
  };
}
