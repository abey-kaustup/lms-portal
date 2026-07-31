import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      const unauthResponse = NextResponse.json(
        { user: null, error: 'Unauthorized' },
        { status: 401 }
      );
      unauthResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      unauthResponse.headers.set('Pragma', 'no-cache');
      unauthResponse.headers.set('Expires', '0');
      return unauthResponse;
    }

    const response = NextResponse.json({ user }, { status: 200 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { user: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

