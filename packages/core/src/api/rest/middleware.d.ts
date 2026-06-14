/**
 * @file api/rest/middleware.ts
 * @description API middleware for the Volqan REST layer.
 *
 * Provides composable middleware functions for:
 * - JWT Authentication
 * - Role-based access control
 * - Rate limiting (in-memory, suitable for single-node deployments)
 * - CORS
 * - Request body validation
 * - Global error handling
 *
 * @example
 * ```ts
 * import { withAuth, withCors, withRateLimit, compose } from '@volqan/core/api/rest';
 *
 * const handler = compose(
 *   withCors({ origins: '*' }),
 *   withRateLimit({ maxRequests: 100, windowMs: 60_000 }),
 *   withAuth(),
 * )(myRouteHandler);
 * ```
 */
import { NextResponse, type NextRequest } from 'next/server';
import type { CorsConfig, RateLimitConfig, Middleware, AuthContext } from './types.js';
/**
 * Resolves the auth context from a request's Authorization header.
 * This is a lightweight JWT decode — a real deployment should use a proper
 * JWT library (e.g. `jose`). The actual signature verification MUST be done
 * in the middleware; this placeholder provides the structure for integration.
 */
export declare function resolveAuthContext(request: NextRequest): AuthContext | null;
/**
 * Middleware that requires a valid Bearer token.
 * Attaches the resolved auth context to `request.headers` via a custom header
 * (Next.js does not allow mutating the request object directly).
 *
 * @param options.optional When true, the middleware passes unauthenticated
 *   requests through instead of rejecting them.
 */
export declare function withAuth(options?: {
    optional?: boolean;
}): Middleware;
/**
 * Middleware that requires the authenticated user to have a specific role.
 * Must be used after `withAuth`.
 */
export declare function withRole(requiredRole: string): Middleware;
/**
 * Middleware that enforces a sliding-window rate limit per IP address.
 * For production multi-node deployments, replace the in-memory store with Redis.
 *
 * @param config Rate limit configuration.
 */
export declare function withRateLimit(config: RateLimitConfig): Middleware;
/**
 * Middleware that adds CORS headers to every response.
 * Also handles OPTIONS preflight requests.
 *
 * @param config CORS configuration.
 */
export declare function withCors(config: CorsConfig): Middleware;
/**
 * Middleware that parses and validates the JSON request body.
 * Rejects requests with non-JSON bodies for POST/PUT/PATCH methods.
 */
export declare function withJsonBody(): Middleware;
/**
 * Wraps a route handler with a top-level try/catch.
 * Any unhandled errors are converted to a 500 response.
 *
 * @param handler The route handler to wrap.
 */
export declare function withErrorHandling(handler: (request: NextRequest, context: {
    params: Promise<Record<string, string>>;
}) => Promise<NextResponse>): (request: NextRequest, context: {
    params: Promise<Record<string, string>>;
}) => Promise<NextResponse>;
type AnyHandler = (request: NextRequest, context: {
    params: Promise<Record<string, string>>;
}) => Promise<NextResponse>;
/**
 * Composes multiple middleware functions into a single wrapper.
 * Middleware is applied in the order provided (outermost to innermost).
 *
 * @param middlewares Ordered list of middleware to compose.
 * @returns A function that wraps a route handler with the composed middleware.
 *
 * @example
 * ```ts
 * const protectedHandler = compose(
 *   withCors({ origins: '*' }),
 *   withRateLimit({ maxRequests: 60, windowMs: 60_000 }),
 *   withAuth(),
 * )(myHandler);
 * ```
 */
export declare function compose(...middlewares: Middleware[]): (handler: AnyHandler) => AnyHandler;
/**
 * Reads the injected auth context from request headers.
 * Returns null if the request was not authenticated.
 */
export declare function getAuthContext(request: NextRequest): AuthContext | null;
export {};
//# sourceMappingURL=middleware.d.ts.map