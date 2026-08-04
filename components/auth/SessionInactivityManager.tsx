'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { logoutUser } from '@/actions/auth';

interface SessionInactivityManagerProps {
  inactivityThresholdSeconds?: number; // 30 seconds inactivity trigger
  maxSessionMinutes?: number; // 20 minutes max session
  className?: string;
}

export function SessionInactivityManager({
  inactivityThresholdSeconds = 30,
  maxSessionMinutes = 20,
  className = '',
}: SessionInactivityManagerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSessionSeconds, setRemainingSessionSeconds] = useState(maxSessionMinutes * 60);
  const [sessionExpired, setSessionExpired] = useState(false);

  const sessionStartTimeRef = useRef<number>(Date.now());
  const lastActivityTimeRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  const INACTIVITY_MS = inactivityThresholdSeconds * 1000;
  const MAX_SESSION_MS = maxSessionMinutes * 60 * 1000;

  // Perform logout action
  const handleLogout = useCallback(async (reason: string = 'Inactivity') => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setSessionExpired(true);

    try {
      await logoutUser();
    } catch (err) {
      console.error('Auto logout error:', err);
    } finally {
      window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
    }
  }, []);

  // Reset activity timer whenever mouse or keyboard is moved/pressed
  const resetActivity = useCallback(() => {
    lastActivityTimeRef.current = Date.now();
    setShowWarning(false);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      // If user presses key or displaces mouse, reset timer & hide popup
      resetActivity();
    };

    // Listen for mouse movements, clicks, keyboard events, scrolling, touch events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [resetActivity]);

  // Periodic Inactivity and Session Check (runs every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityTimeRef.current;
      const totalSessionTime = now - sessionStartTimeRef.current;

      const remainingSecs = Math.max(0, Math.floor((MAX_SESSION_MS - totalSessionTime) / 1000));
      setRemainingSessionSeconds(remainingSecs);

      // 1. Max 20 minutes overall session check
      if (totalSessionTime >= MAX_SESSION_MS || remainingSecs <= 0) {
        handleLogout('Session duration limit (20 mins) reached');
        return;
      }

      // 2. Inactivity check (30 seconds of no mouse/keyboard activity)
      if (idleTime >= INACTIVITY_MS) {
        if (!showWarning) {
          setShowWarning(true);
        }
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [INACTIVITY_MS, MAX_SESSION_MS, showWarning, handleLogout]);

  if (!showWarning || sessionExpired) {
    return null;
  }

  // Format 20 minutes remaining countdown as MM:SS (e.g. 19:45)
  const mins = Math.floor(remainingSessionSeconds / 60);
  const secs = remainingSessionSeconds % 60;
  const formattedTime = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div
      onClick={resetActivity}
      title="Click or move mouse/press key to reset session timer"
      className={`cursor-pointer animate-pulse transition-transform hover:scale-105 shrink-0 ${className}`}
    >
      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-amber-400 rounded-full border border-amber-500/40 shadow-sm text-xs font-mono font-extrabold tracking-wider">
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}
