/**
 * Centralized REST API Adapter Service
 * Serves as the primary communication client between Next.js 16 -> ASP.NET Core Web API.
 * Supports JWT Bearer tokens, unified response structure, and error handling.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<ApiResponse<T>> {
  const { token, headers, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: json?.message || json?.error || `HTTP Error ${res.status}: ${res.statusText}`,
      };
    }

    return {
      success: true,
      data: json?.data !== undefined ? json.data : json,
      message: json?.message,
    };
  } catch (err: any) {
    console.error(`[API Fetch Error - ${endpoint}]:`, err);
    return {
      success: false,
      error: err?.message || 'Network request failed. Is the ASP.NET Core API running?',
    };
  }
}
