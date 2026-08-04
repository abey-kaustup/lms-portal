import { NextRequest } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limit map for Verification Gateway
const rateLimitMap = new Map<string, RateLimitStore>();

// Periodically clean up expired IP entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, store] of rateLimitMap.entries()) {
      if (now > store.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfter: number;
}

/**
 * IP-Based Sliding Window Rate Limiter
 * Default limit: 10 requests per minute per IP.
 */
export function rateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:cert_verify:${ip}`;
  const store = rateLimitMap.get(key);

  if (!store || now > store.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
      retryAfter: 0,
    };
  }

  if (store.count >= limit) {
    const retryAfter = Math.ceil((store.resetTime - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds: retryAfter,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  store.count += 1;
  const remaining = Math.max(0, limit - store.count);
  const resetSeconds = Math.ceil((store.resetTime - now) / 1000);

  return {
    success: true,
    limit,
    remaining,
    resetSeconds,
    retryAfter: 0,
  };
}

/**
 * Extracts client IP address safely from request headers
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return (request as any).ip || '127.0.0.1';
}

/**
 * Returns security and rate limit HTTP headers
 */
export function getVerificationSecurityHeaders(rateLimitResult?: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  if (rateLimitResult) {
    headers['X-RateLimit-Limit'] = String(rateLimitResult.limit);
    headers['X-RateLimit-Remaining'] = String(rateLimitResult.remaining);
    headers['X-RateLimit-Reset'] = String(rateLimitResult.resetSeconds);

    if (!rateLimitResult.success) {
      headers['Retry-After'] = String(rateLimitResult.retryAfter);
    }
  }

  return headers;
}
