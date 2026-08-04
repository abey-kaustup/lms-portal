import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { UserSession } from '@/types';
import { SECRET_KEY } from '@/lib/env';
import { rateLimit, getClientIp, getVerificationSecurityHeaders } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate Limiter & Security Protection for Verification Gateway (/verify and /api/verify)
  if (pathname.startsWith('/verify') || pathname.startsWith('/api/verify')) {
    const ip = getClientIp(request);
    const rlResult = rateLimit(ip, 10, 60 * 1000); // 10 requests per minute per IP
    const secHeaders = getVerificationSecurityHeaders(rlResult);

    if (!rlResult.success) {
      console.warn(`[SECURITY ALERT] Rate limit exceeded on verification gateway from IP: ${ip}`);

      if (pathname.startsWith('/api/verify')) {
        return NextResponse.json(
          {
            error: 'Too many verification requests. Rate limit exceeded.',
            retryAfterSeconds: rlResult.retryAfter,
          },
          { status: 429, headers: secHeaders }
        );
      }

      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>429 Rate Limit Exceeded - Corporate Verification Gateway</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0F172A; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
              .card { background: #1E293B; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #334155; text-align: center; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
              h1 { color: #F87171; font-size: 1.25rem; font-weight: 800; margin: 0 0 0.75rem 0; text-transform: uppercase; tracking: 0.05em; }
              p { color: #94A3B8; font-size: 0.875rem; line-height: 1.5; margin: 0 0 1.25rem 0; }
              .badge { background: rgba(248, 113, 113, 0.1); color: #FCA5A5; font-weight: 700; font-size: 0.75rem; padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid rgba(248, 113, 113, 0.2); display: inline-block; font-mono: monospace; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Rate Limit Exceeded</h1>
              <p>Too many certificate verification requests detected from your IP address. Access has been temporarily restricted to protect system integrity.</p>
              <div class="badge">Retry-After: ${rlResult.retryAfter} Seconds</div>
            </div>
          </body>
        </html>`,
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...secHeaders,
          },
        }
      );
    }

    const response = NextResponse.next();
    Object.entries(secHeaders).forEach(([k, v]) => response.headers.set(k, String(v)));
    return response;
  }

  // Session JWT Authentication
  const token = request.cookies.get('app_session')?.value;
  let session: UserSession | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as UserSession;
    } catch {
      session = null;
    }
  }

  const redirectWithNoCache = (url: URL) => {
    const res = NextResponse.redirect(url);
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  };

  // Protected HR Routes
  if (pathname.startsWith('/hr')) {
    if (!session || session.role !== 'HR_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return redirectWithNoCache(loginUrl);
    }
  }

  // Protected Employee Routes
  if (pathname.startsWith('/employee')) {
    if (!session || session.role !== 'EMPLOYEE') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return redirectWithNoCache(loginUrl);
    }
  }

  // Redirect root / to login or dashboard
  if (pathname === '/') {
    if (session?.role === 'HR_ADMIN') {
      return redirectWithNoCache(new URL('/hr/dashboard', request.url));
    }
    if (session?.role === 'EMPLOYEE') {
      return redirectWithNoCache(new URL('/employee/dashboard', request.url));
    }
    return redirectWithNoCache(new URL('/login', request.url));
  }

  const response = NextResponse.next();
  if (pathname.startsWith('/hr') || pathname.startsWith('/employee')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/', '/hr/:path*', '/employee/:path*', '/verify', '/api/verify'],
};
