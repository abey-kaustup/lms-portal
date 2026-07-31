import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { UserSession } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'corporate-lms-secure-jwt-secret-key-2026-production-grade';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  matcher: ['/', '/hr/:path*', '/employee/:path*'],
};
