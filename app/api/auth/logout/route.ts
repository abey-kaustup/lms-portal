import { NextResponse } from 'next/server';
import { logoutUser } from '@/actions/auth';

export async function POST() {
  try {
    await logoutUser();

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // List of potential session / token cookies to purge
    const cookiesToPurge = ['app_session', 'refresh_token', 'session', 'token', 'next-auth.session-token'];

    for (const cookieName of cookiesToPurge) {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
    }

    // Strict security response headers to prevent browser caching of logout API response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

