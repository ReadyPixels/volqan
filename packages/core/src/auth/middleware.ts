/**
 * @file auth/middleware.ts
 * @description Authentication middleware helpers for Volqan.
 *
 * Uses standard Web API Request/Response types so the core package
 * remains framework-agnostic (no Next.js dependency).
 *
 * Provides three middleware patterns:
 * - {@link requireAuth} — enforce authentication; throw if missing
 * - {@link optionalAuth} — resolve auth if present; proceed as guest if not
 * - {@link requireRole} — enforce a minimum role; throw if insufficient
 *
 * Tokens are read from:
 * 1. `Authorization: Bearer <token>` header (API routes)
 * 2. `volqan_session` httpOnly cookie (browser sessions)
 */

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
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}

/**
 * Extracts the session token from the `volqan_session` cookie.
 *
 * @returns The raw token string, or null if not present
 */
export function extractSessionCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
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
 * 1. JWT Bearer token (stateless -- no DB lookup)
 * 2. Session cookie (stateful -- validates against DB)
 */
export async function resolveAuth(
  request: Request,
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
      // Invalid bearer token -- fall through to session cookie
    }
  }

  // 2. Try session cookie (browser sessions)
  const sessionToken = extractSessionCookie(request);
  if (sessionToken) {
    try {
      const session = await validateSession(sessionToken);
      return { user: session.user, session, token: sessionToken };
    } catch {
      // Invalid or expired session cookie -- fall through
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
 * @param request - The incoming request
 * @returns Resolved auth data
 * @throws {@link AuthError} if not authenticated
 */
export async function requireAuth(request: Request): Promise<ResolvedAuth> {
  const auth = await resolveAuth(request);

  if (!auth) {
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
 */
export async function optionalAuth(
  request: Request,
): Promise<ResolvedAuth | null> {
  return resolveAuth(request);
}

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

/**
 * Requires the authenticated user to have at least the given role.
 *
 * @param request - The incoming request
 * @param role - Minimum required role
 * @returns Resolved auth data
 * @throws {@link AuthError} with SESSION_NOT_FOUND (401) or INSUFFICIENT_PERMISSIONS (403)
 */
export async function requireRole(
  request: Request,
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
 * Sets the session cookie on a Response via Set-Cookie header.
 */
export function setSessionCookie(
  response: Response,
  options: SetSessionCookieOptions,
): void {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${options.token}`,
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${options.expiresAt.toUTCString()}`,
    'Path=/',
  ];
  if (options.secure ?? isProduction) parts.push('Secure');
  if (options.domain) parts.push(`Domain=${options.domain}`);
  response.headers.append('Set-Cookie', parts.join('; '));
}

/**
 * Clears the session cookie (logout).
 */
export function clearSessionCookie(response: Response): void {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    'Path=/',
  ];
  if (isProduction) parts.push('Secure');
  response.headers.append(
    'Set-Cookie',
    parts.join('; '),
  );
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/**
 * Creates a standardised JSON error response from an AuthError.
 */
export function authErrorResponse(error: AuthError): Response {
  return Response.json(
    { error: error.code, message: error.message },
    { status: error.statusCode },
  );
}

/**
 * Wraps an API route handler with `requireAuth`, returning a 401 on failure.
 */
export function withAuth(
  handler: (
    request: Request,
    auth: ResolvedAuth,
  ) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
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
 */
export function withRole(
  role: UserRole,
  handler: (
    request: Request,
    auth: ResolvedAuth,
  ) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
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
 * Thrown by auth helpers when a redirect is needed.
 */
export class UnauthenticatedRedirect extends Error {
  public readonly redirectTo: string;

  constructor(redirectTo: string) {
    super(`Unauthenticated -- redirect to: ${redirectTo}`);
    this.name = 'UnauthenticatedRedirect';
    this.redirectTo = redirectTo;
  }
}
