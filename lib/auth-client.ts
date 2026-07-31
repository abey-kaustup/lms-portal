'use client';

let isLoggingOut = false;

/**
 * Centralized production-grade client logout function.
 * Invalidates the user session on the server, clears client storage,
 * and forces a full browser redirect to /login.
 */
export async function logoutClient(): Promise<void> {
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    // Clear client-side storage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageErr) {
        console.error('Failed to clear local/session storage:', storageErr);
      }
    }

    // Call server-side logout API endpoint
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      credentials: 'same-origin',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    isLoggingOut = false;
    if (typeof window !== 'undefined') {
      // Force full document navigation to login page to wipe memory/React cache
      window.location.replace('/login');
    }
  }
}
