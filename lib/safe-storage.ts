/**
 * Safe browser storage helper to prevent Runtime SecurityError in browsers
 * where localStorage or sessionStorage access is denied (e.g., Incognito mode,
 * third-party storage restrictions, cross-origin iframes, or corporate policies).
 */

export function safeClearSessionStorage(): void {
  try {
    if (typeof window !== 'undefined' && 'sessionStorage' in window) {
      try {
        window.sessionStorage.clear();
      } catch (e) {
        // Individual catch for clear invocation
      }
    }
  } catch (err) {
    // Suppress browser SecurityError on property access
  }
}

export function safeClearLocalStorage(): void {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        window.localStorage.clear();
      } catch (e) {
        // Individual catch for clear invocation
      }
    }
  } catch (err) {
    // Suppress browser SecurityError on property access
  }
}

export function safeGetStorageItem(key: string, type: 'session' | 'local' = 'session'): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const store = type === 'session' ? window.sessionStorage : window.localStorage;
    if (!store) return null;
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetStorageItem(key: string, value: string, type: 'session' | 'local' = 'session'): void {
  try {
    if (typeof window === 'undefined') return;
    const store = type === 'session' ? window.sessionStorage : window.localStorage;
    if (!store) return;
    store.setItem(key, value);
  } catch {
    // Ignore storage quota or security errors
  }
}
