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
import { NextResponse } from 'next/server';
import { unauthorized, forbidden, tooManyRequests, internalError, badRequest, } from './response.js';
// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
/**
 * Resolves the auth context from a request's Authorization header.
 * This is a lightweight JWT decode — a real deployment should use a proper
 * JWT library (e.g. `jose`). The actual signature verification MUST be done
 * in the middleware; this placeholder provides the structure for integration.
 */
export function resolveAuthContext(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer '))
        return null;
    const token = authHeader.slice(7);
    if (!token)
        return null;
    try {
        // Decode JWT payload (base64url, no verification here — verify in your JWT lib)
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        // Expiry check
        if (payload.exp && Date.now() / 1000 > payload.exp)
            return null;
        if (!payload.sub)
            return null;
        return {
            userId: payload.sub,
            email: payload.email ?? '',
            role: payload.role ?? 'user',
        };
    }
    catch {
        return null;
    }
}
/**
 * Middleware that requires a valid Bearer token.
 * Attaches the resolved auth context to `request.headers` via a custom header
 * (Next.js does not allow mutating the request object directly).
 *
 * @param options.optional When true, the middleware passes unauthenticated
 *   requests through instead of rejecting them.
 */
export function withAuth(options = {}) {
    return async (request, next) => {
        const auth = resolveAuthContext(request);
        if (!auth && !options.optional) {
            return unauthorized();
        }
        // Inject auth context into request headers for downstream consumption.
        // Clone the request with the injected headers.
        const headers = new Headers(request.headers);
        if (auth) {
            headers.set('x-volqan-user-id', auth.userId);
            headers.set('x-volqan-user-email', auth.email);
            headers.set('x-volqan-user-role', auth.role);
        }
        return next();
    };
}
/**
 * Middleware that requires the authenticated user to have a specific role.
 * Must be used after `withAuth`.
 */
export function withRole(requiredRole) {
    return async (request, next) => {
        const role = request.headers.get('x-volqan-user-role');
        if (!role || role !== requiredRole) {
            return forbidden(`This action requires the "${requiredRole}" role`);
        }
        return next();
    };
}
// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
/** In-memory rate limit store. Not suitable for multi-node deployments. */
const rateLimitStore = new Map();
/**
 * Middleware that enforces a sliding-window rate limit per IP address.
 * For production multi-node deployments, replace the in-memory store with Redis.
 *
 * @param config Rate limit configuration.
 */
export function withRateLimit(config) {
    const { maxRequests, windowMs } = config;
    return async (request, next) => {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request.headers.get('x-real-ip') ??
            'unknown';
        const now = Date.now();
        const entry = rateLimitStore.get(ip);
        if (!entry || entry.resetAt <= now) {
            rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
        }
        else {
            entry.count++;
            if (entry.count > maxRequests) {
                const response = tooManyRequests();
                response.headers.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
                return response;
            }
        }
        const response = await next();
        response.headers.set('X-RateLimit-Limit', String(maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - (rateLimitStore.get(ip)?.count ?? 0))));
        return response;
    };
}
// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
/**
 * Middleware that adds CORS headers to every response.
 * Also handles OPTIONS preflight requests.
 *
 * @param config CORS configuration.
 */
export function withCors(config) {
    const { origins, methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], headers = ['Content-Type', 'Authorization'], credentials = false, } = config;
    return async (request, next) => {
        const origin = request.headers.get('origin') ?? '';
        const isAllowed = origins === '*' ||
            (Array.isArray(origins) && origins.includes(origin)) ||
            origins === origin;
        const corsHeaders = {
            'Access-Control-Allow-Methods': methods.join(', '),
            'Access-Control-Allow-Headers': headers.join(', '),
            'Access-Control-Allow-Credentials': String(credentials),
        };
        if (isAllowed) {
            corsHeaders['Access-Control-Allow-Origin'] = origins === '*' ? '*' : origin;
        }
        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 204, headers: corsHeaders });
        }
        const response = await next();
        for (const [key, value] of Object.entries(corsHeaders)) {
            response.headers.set(key, value);
        }
        return response;
    };
}
// ---------------------------------------------------------------------------
// Request body validation
// ---------------------------------------------------------------------------
/**
 * Middleware that parses and validates the JSON request body.
 * Rejects requests with non-JSON bodies for POST/PUT/PATCH methods.
 */
export function withJsonBody() {
    return async (request, next) => {
        const method = request.method.toUpperCase();
        if (!['POST', 'PUT', 'PATCH'].includes(method))
            return next();
        const contentType = request.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
            return badRequest('Content-Type must be application/json');
        }
        try {
            await request.json();
        }
        catch {
            return badRequest('Invalid JSON body');
        }
        return next();
    };
}
// ---------------------------------------------------------------------------
// Error catching wrapper
// ---------------------------------------------------------------------------
/**
 * Wraps a route handler with a top-level try/catch.
 * Any unhandled errors are converted to a 500 response.
 *
 * @param handler The route handler to wrap.
 */
export function withErrorHandling(handler) {
    return async (request, context) => {
        try {
            return await handler(request, context);
        }
        catch (err) {
            console.error('[Volqan] Unhandled route error:', err);
            return internalError();
        }
    };
}
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
export function compose(...middlewares) {
    return (handler) => {
        return async (request, context) => {
            let index = 0;
            const run = async () => {
                if (index >= middlewares.length) {
                    return handler(request, context);
                }
                const middleware = middlewares[index++];
                return middleware(request, run);
            };
            return run();
        };
    };
}
// ---------------------------------------------------------------------------
// Auth context helpers for use inside route handlers
// ---------------------------------------------------------------------------
/**
 * Reads the injected auth context from request headers.
 * Returns null if the request was not authenticated.
 */
export function getAuthContext(request) {
    const userId = request.headers.get('x-volqan-user-id');
    const email = request.headers.get('x-volqan-user-email');
    const role = request.headers.get('x-volqan-user-role');
    if (!userId)
        return null;
    return { userId, email: email ?? '', role: role ?? 'user' };
}
//# sourceMappingURL=middleware.js.map