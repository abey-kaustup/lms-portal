'use client';

import { useEffect } from 'react';
import { logActivity } from '@/actions/activity';

export function useAntiCheat(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Tab switch / Visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logActivity('TAB_SWITCH', 'User switched tabs during learning/assessment session');
      }
    };

    // 2. Window blur (leaving browser focus)
    const handleBlur = () => {
      logActivity('WINDOW_BLUR', 'Browser window lost focus');
    };

    // 3. Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logActivity('FULLSCREEN_EXIT', 'User exited fullscreen mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [enabled]);
}
