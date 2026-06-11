import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validateSession } from '@volqan/core';

const SESSION_COOKIE = 'volqan_session';

/** Routes that are accessible without authentication. */
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/oauth',
  '/api/health',
  '/api/v1/license/validate',
  '/api/auth/sso/saml/acs',
  '/api/cron',
  '/favicon.svg',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  let isAuthenticated = false;

  if (sessionToken) {
    try {
      await validateSession(sessionToken);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    // API routes → 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Browser routes → redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
