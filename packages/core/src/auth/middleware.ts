/**
 * @file auth/middleware.ts
 * @description Authentication middleware for Next.js 15 App Router.
 *
 * Provides three middleware patterns:
 * - {@link requireAuth} — enforce authentication; redirect or 401 if missing
 * - {@link optionalAuth} — resolve auth if present; proceed as guest if not
 * - {@link requireRole} — enforce a minimum role; 403 if insufficient
 *
 * Tokens are read from:
 * 1. `Authorization: Bearer <token>` header (API routes)
 * 2. `volqan_session` httpOnly cookie (browser sessions)
 *
 * @example
 * ```ts
 * // app/api/content/route.ts
 * import { requireAuth, requireRole } from '@volqan/core/auth';
 *
 * export async function GET(request: NextRequest) {
 *   const { user } = await requireAuth(request);
 *   // user is AuthUser
 *   return Response.json({ user });
 * }
 *
 * // Enforce ADMIN role
 * export async function DELETE(request: NextRequest) {
 *   await requireRole(request, 'ADMIN');
 *   // ...
 * }
 * ```
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt.js';
import { validateSession } from './session.js';
import type { AuthUser, AuthSession } from './types.js';
import { AuthError } from './types.js';
import type { UserRole } from '../database/index.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Name of the session cookie */
export const SESSION_COOKIE_NAME = 'volqan_session';

/** Name of the CSRF token cookie (non-httpOnly) */
export const CSRF_COOKIE_NAME = 'volqan_csrf';

// ---------------------------------------------------------------------------
// Token extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extracts a Bearer token from the Authorization header.
 *
 * @returns The raw token string, or null if not present
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}

/**
 * Extracts the session token from the `volqan_session` cookie.
 *
 * @returns The raw token string, or null if not present
 */
export function extractSessionCookie(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// ---------------------------------------------------------------------------
// Auth resolution
// ---------------------------------------------------------------------------

/**
 * Result of a successful auth resolution.
 */
export interface ResolvedAuth {
  user: AuthUser;
  session: AuthSession | null;
  /** The raw token that was used for authentication */
  token: string;
}

/**
 * Attempts to resolve authentication from either a JWT Bearer token or a
 * session cookie. Returns null if neither is present or valid.
 *
 * Priority:
 * 1. JWT Bearer token (stateless — no DB lookup)
 * 2. Session cookie (stateful — validates against DB)
 *
 * @param request - The incoming Next.js request
 * @returns {@link ResolvedAuth} or null
 */
export async function resolveAuth(
  request: NextRequest,
): Promise<ResolvedAuth | null> {
  // 1. Try JWT Bearer token (preferred for API clients)
  const bearerToken = extractBearerToken(request);
  if (bearerToken) {
    try {
      const payload = await verifyAccessToken(bearerToken);
      const user: AuthUser = {
        id: payload.sub,
        email: payload.email,
        name: null,
        avatar: null,
        role: payload.role,
        emailVerified: null,
      };
      return { user, session: null, token: bearerToken };
    } catch {
      // Invalid bearer token — fall through to session cookie
    }
  }

  // 2. Try session cookie (browser sessions)
  const sessionToken = extractSessionCookie(request);
  if (sessionToken) {
    try {
      const session = await validateSession(sessionToken);
      return { user: session.user, session, token: sessionToken };
    } catch {
      // Invalid or expired session cookie — fall through
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Role comparison
// ---------------------------------------------------------------------------

/**
 * Role hierarchy from lowest (VIEWER) to highest (SUPER_ADMIN).
 */
const ROLE_HIERARCHY: UserRole[] = [
  'VIEWER' as UserRole,
  'EDITOR' as UserRole,
  'ADMIN' as UserRole,
  'SUPER_ADMIN' as UserRole,
];

/**
 * Returns true if `userRole` is at least as privileged as `requiredRole`.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------

/**
 * Requires the request to be authenticated.
 *
 * For API routes: throws an {@link AuthError} if not authenticated.
 * Pass `redirectTo` to redirect unauthenticated browser requests instead.
 *
 * @param request - The incoming Next.js request
 * @param options.redirectTo - URL to redirect to if unauthenticated (browser)
 * @returns Resolved auth data
 * @throws {@link AuthError} if not authenticated and no redirectTo provided
 */
export async function requireAuth(
  request: NextRequest,
  options: { redirectTo?: string } = {},
): Promise<ResolvedAuth> {
  const auth = await resolveAuth(request);

  if (!auth) {
    if (options.redirectTo) {
      throw new UnauthenticatedRedirect(options.redirectTo);
    }
    throw new AuthError('SESSION_NOT_FOUND', 'Authentication required.', 401);
  }

  return auth;
}

// ---------------------------------------------------------------------------
// optionalAuth
// ---------------------------------------------------------------------------

/**
 * Resolves authentication if present but does not require it.
 * Returns null when the request is not authenticated.
 *
 * Useful for endpoints that behave differently for authenticated vs. guest users.
 *
 * @param request - The incoming Next.js request
 * @returns {@link ResolvedAuth} or null
 */
export async function optionalAuth(
  request: NextRequest,
): Promise<ResolvedAuth | null> {
  return resolveAuth(request);
}

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

/**
 * Requires the authenticated user to have at least the given role.
 *
 * @param request - The incoming Next.js request
 * @param role - Minimum required role
 * @returns Resolved auth data
 * @throws {@link AuthError} with SESSION_NOT_FOUND (401) or INSUFFICIENT_PERMISSIONS (403)
 */
export async function requireRole(
  request: NextRequest,
  role: UserRole,
): Promise<ResolvedAuth> {
  const auth = await requireAuth(request);

  if (!hasRole(auth.user.role, role)) {
    throw new AuthError(
      'INSUFFICIENT_PERMISSIONS',
      `This action requires the "${role}" role or higher. You have "${auth.user.role}".`,
      403,
    );
  }

  return auth;
}

// ---------------------------------------------------------------------------
// Session cookie helpers
// ---------------------------------------------------------------------------

/**
 * Options for setting the session cookie.
 */
export interface SetSessionCookieOptions {
  /** Session token value */
  token: string;
  /** Expiry date for the cookie */
  expiresAt: Date;
  /** Set to true in production for HTTPS-only */
  secure?: boolean;
  /** Domain for cross-subdomain sessions */
  domain?: string;
}

/**
 * Sets the session cookie on a NextResponse.
 *
 * @param response - The response to set the cookie on
 * @param options - Cookie configuration
 */
export function setSessionCookie(
  response: NextResponse,
  options: SetSessionCookieOptions,
): void {
  const isProduction = process.env['NODE_ENV'] === 'production';
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: options.token,
    httpOnly: true,
    secure: options.secure ?? isProduction,
    sameSite: 'lax',
    expires: options.expiresAt,
    path: '/',
    domain: options.domain,
  });
}

/**
 * Clears the session cookie (logout).
 *
 * @param response - The response to clear the cookie on
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/**
 * Creates a standardised JSON error response from an AuthError.
 *
 * @param error - The AuthError to convert
 */
export function authErrorResponse(error: AuthError): NextResponse {
  return NextResponse.json(
    { error: error.code, message: error.message },
    { status: error.statusCode },
  );
}

/**
 * Wraps an API route handler with `requireAuth`, returning a 401 on failure.
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request, { user }) => {
 *   return Response.json({ user });
 * });
 * ```
 */
export function withAuth(
  handler: (
    request: NextRequest,
    auth: ResolvedAuth,
  ) => Promise<Response | NextResponse>,
): (request: NextRequest) => Promise<Response | NextResponse> {
  return async (request: NextRequest) => {
    try {
      const auth = await requireAuth(request);
      return handler(request, auth);
    } catch (err) {
      if (err instanceof AuthError) {
        return authErrorResponse(err);
      }
      throw err;
    }
  };
}

/**
 * Wraps an API route handler with `requireRole`, returning 401/403 on failure.
 *
 * @example
 * ```ts
 * export const DELETE = withRole('ADMIN', async (request, { user }) => {
 *   // user is guaranteed to be ADMIN or higher
 * });
 * ```
 */
export function withRole(
  role: UserRole,
  handler: (
    request: NextRequest,
    auth: ResolvedAuth,
  ) => Promise<Response | NextResponse>,
): (request: NextRequest) => Promise<Response | NextResponse> {
  return async (request: NextRequest) => {
    try {
      const auth = await requireRole(request, role);
      return handler(request, auth);
    } catch (err) {
      if (err instanceof AuthError) {
        return authErrorResponse(err);
      }
      throw err;
    }
  };
}

// ---------------------------------------------------------------------------
// Internal errors
// ---------------------------------------------------------------------------

/**
 * Thrown by {@link requireAuth} when a `redirectTo` option is provided and
 * the request is not authenticated. Callers should catch this to perform the
 * redirect in their Next.js route handler or middleware.
 */
export class UnauthenticatedRedirect extends Error {
  public readonly redirectTo: string;

  constructor(redirectTo: string) {
    super(`Unauthenticated — redirect to: ${redirectTo}`);
    this.name = 'UnauthenticatedRedirect';
    this.redirectTo = redirectTo;
  }
}
