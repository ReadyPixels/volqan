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
import type { AuthUser, AuthSession } from './types.js';
import { AuthError } from './types.js';
import type { UserRole } from '../database/index.js';
/** Name of the session cookie */
export declare const SESSION_COOKIE_NAME = "volqan_session";
/** Name of the CSRF token cookie (non-httpOnly) */
export declare const CSRF_COOKIE_NAME = "volqan_csrf";
/**
 * Extracts a Bearer token from the Authorization header.
 *
 * @returns The raw token string, or null if not present
 */
export declare function extractBearerToken(request: NextRequest): string | null;
/**
 * Extracts the session token from the `volqan_session` cookie.
 *
 * @returns The raw token string, or null if not present
 */
export declare function extractSessionCookie(request: NextRequest): string | null;
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
export declare function resolveAuth(request: NextRequest): Promise<ResolvedAuth | null>;
/**
 * Returns true if `userRole` is at least as privileged as `requiredRole`.
 */
export declare function hasRole(userRole: UserRole, requiredRole: UserRole): boolean;
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
export declare function requireAuth(request: NextRequest, options?: {
    redirectTo?: string;
}): Promise<ResolvedAuth>;
/**
 * Resolves authentication if present but does not require it.
 * Returns null when the request is not authenticated.
 *
 * Useful for endpoints that behave differently for authenticated vs. guest users.
 *
 * @param request - The incoming Next.js request
 * @returns {@link ResolvedAuth} or null
 */
export declare function optionalAuth(request: NextRequest): Promise<ResolvedAuth | null>;
/**
 * Requires the authenticated user to have at least the given role.
 *
 * @param request - The incoming Next.js request
 * @param role - Minimum required role
 * @returns Resolved auth data
 * @throws {@link AuthError} with SESSION_NOT_FOUND (401) or INSUFFICIENT_PERMISSIONS (403)
 */
export declare function requireRole(request: NextRequest, role: UserRole): Promise<ResolvedAuth>;
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
export declare function setSessionCookie(response: NextResponse, options: SetSessionCookieOptions): void;
/**
 * Clears the session cookie (logout).
 *
 * @param response - The response to clear the cookie on
 */
export declare function clearSessionCookie(response: NextResponse): void;
/**
 * Creates a standardised JSON error response from an AuthError.
 *
 * @param error - The AuthError to convert
 */
export declare function authErrorResponse(error: AuthError): NextResponse;
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
export declare function withAuth(handler: (request: NextRequest, auth: ResolvedAuth) => Promise<Response | NextResponse>): (request: NextRequest) => Promise<Response | NextResponse>;
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
export declare function withRole(role: UserRole, handler: (request: NextRequest, auth: ResolvedAuth) => Promise<Response | NextResponse>): (request: NextRequest) => Promise<Response | NextResponse>;
/**
 * Thrown by {@link requireAuth} when a `redirectTo` option is provided and
 * the request is not authenticated. Callers should catch this to perform the
 * redirect in their Next.js route handler or middleware.
 */
export declare class UnauthenticatedRedirect extends Error {
    readonly redirectTo: string;
    constructor(redirectTo: string);
}
//# sourceMappingURL=middleware.d.ts.map