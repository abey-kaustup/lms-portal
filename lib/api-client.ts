/**
 * Enterprise REST API Adapter Client
 * Centralized API client for Next.js 16 -> ASP.NET Core 8 Web API integration.
 * Supports JWT Bearer, Refresh Token credentials, and structured error handling.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data as T,
      message: data?.message,
    };
  } catch (err: any) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    return {
      success: false,
      error: err?.message || 'Network request failed. Please check your connection.',
    };
  }
}
