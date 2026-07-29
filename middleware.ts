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

  // Protected HR Routes
  if (pathname.startsWith('/hr')) {
    if (!session || session.role !== 'HR_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protected Employee Routes
  if (pathname.startsWith('/employee')) {
    if (!session || session.role !== 'EMPLOYEE') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect root / to login or dashboard
  if (pathname === '/') {
    if (session?.role === 'HR_ADMIN') {
      return NextResponse.redirect(new URL('/hr/dashboard', request.url));
    }
    if (session?.role === 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/hr/:path*', '/employee/:path*'],
};
