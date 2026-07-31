/**
 * Safe browser storage helper to prevent Runtime SecurityError in browsers
 * (Firefox, Microsoft Edge, Chrome, Safari) where localStorage or sessionStorage
 * access is restricted or denied (e.g. Firefox ETP, Edge Tracking Protection,
 * Incognito mode, cross-origin iframes, or corporate network policies).
 */

function getSafeSessionStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined') {
      return window.sessionStorage || null;
    }
  } catch {
    // Suppress SecurityError in Firefox/Edge when storage is blocked
  }
  return null;
}

function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage || null;
    }
  } catch {
    // Suppress SecurityError in Firefox/Edge when storage is blocked
  }
  return null;
}

export function safeClearSessionStorage(): void {
  try {
    const store = getSafeSessionStorage();
    store?.clear();
  } catch {
    // Suppress storage errors
  }
}

export function safeClearLocalStorage(): void {
  try {
    const store = getSafeLocalStorage();
    store?.clear();
  } catch {
    // Suppress storage errors
  }
}

export function safeGetStorageItem(key: string, type: 'session' | 'local' = 'session'): string | null {
  try {
    const store = type === 'session' ? getSafeSessionStorage() : getSafeLocalStorage();
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeSetStorageItem(key: string, value: string, type: 'session' | 'local' = 'session'): void {
  try {
    const store = type === 'session' ? getSafeSessionStorage() : getSafeLocalStorage();
    store?.setItem(key, value);
  } catch {
    // Suppress storage errors
  }
}

export function safeRemoveStorageItem(key: string, type: 'session' | 'local' = 'session'): void {
  try {
    const store = type === 'session' ? getSafeSessionStorage() : getSafeLocalStorage();
    store?.removeItem(key);
  } catch {
    // Suppress storage errors
  }
}
