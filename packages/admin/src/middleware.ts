import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'volqan_session';

/** Routes that are accessible without authentication. */
const PUBLIC_PATHS = [
  '/install',
  '/api/install',
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

/**
 * Public, unauthenticated API routes that may be called cross-origin
 * (e.g. license validation from customer installations).
 */
const CORS_PATHS = ['/api/v1/', '/api/health'];

/** Allowed origins for public API CORS. Comma-separated env override; "*" by default (endpoints are public and credential-free). */
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : origin && ALLOWED_ORIGINS.includes(origin)
      ? origin
      : '';
  if (!allowed) return {};
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    ...(allowed !== '*' ? { Vary: 'Origin' } : {}),
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS for public API routes
  if (CORS_PATHS.some((p) => pathname.startsWith(p))) {
    const headers = corsHeaders(request.headers.get('origin'));
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers });
    }
    const response = NextResponse.next();
    for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
    return response;
  }

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
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
