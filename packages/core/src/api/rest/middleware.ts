/**
 * @file api/rest/middleware.ts
 * @description API middleware for the Volqan REST layer.
 *
 * Uses standard Web API Request/Response types so the core package
 * remains framework-agnostic (no Next.js dependency).
 */

import {
  unauthorized,
  forbidden,
  tooManyRequests,
  internalError,
  badRequest,
} from './response.js';
import type { CorsConfig, RateLimitConfig, Middleware, AuthContext } from './types.js';

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------

export function resolveAuthContext(request: Request): AuthContext | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as {
      sub?: string;
      email?: string;
      role?: string;
      exp?: number;
    };

    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    if (!payload.sub) return null;

    return {
      userId: payload.sub,
      email: payload.email ?? '',
      role: payload.role ?? 'user',
    };
  } catch {
    return null;
  }
}

export function withAuth(options: { optional?: boolean } = {}): Middleware {
  return async (request, next) => {
    const auth = resolveAuthContext(request);

    if (!auth && !options.optional) {
      return unauthorized();
    }

    return next();
  };
}

export function withRole(requiredRole: string): Middleware {
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

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function withRateLimit(config: RateLimitConfig): Middleware {
  const { maxRequests, windowMs } = config;

  return async (request, next) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || entry.resetAt <= now) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count++;
      if (entry.count > maxRequests) {
        const response = tooManyRequests();
        response.headers.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
        return response;
      }
    }

    const response = await next();
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(Math.max(0, maxRequests - (rateLimitStore.get(ip)?.count ?? 0))),
    );
    return response;
  };
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

export function withCors(config: CorsConfig): Middleware {
  const {
    origins,
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
    credentials = false,
  } = config;

  return async (request, next) => {
    const origin = request.headers.get('origin') ?? '';

    const isAllowed =
      origins === '*' ||
      (Array.isArray(origins) && origins.includes(origin)) ||
      origins === origin;

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': headers.join(', '),
      'Access-Control-Allow-Credentials': String(credentials),
    };

    if (isAllowed) {
      corsHeaders['Access-Control-Allow-Origin'] = origins === '*' ? '*' : origin;
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
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

export function withJsonBody(): Middleware {
  return async (request, next) => {
    const method = request.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH'].includes(method)) return next();

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return badRequest('Content-Type must be application/json');
    }

    try {
      await request.json();
    } catch {
      return badRequest('Invalid JSON body');
    }

    return next();
  };
}

// ---------------------------------------------------------------------------
// Error catching wrapper
// ---------------------------------------------------------------------------

export function withErrorHandling(
  handler: (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (err) {
      console.error('[Volqan] Unhandled route error:', err);
      return internalError();
    }
  };
}

// ---------------------------------------------------------------------------
// Middleware composer
// ---------------------------------------------------------------------------

type AnyHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;

export function compose(...middlewares: Middleware[]) {
  return (handler: AnyHandler): AnyHandler => {
    return async (request, context) => {
      let index = 0;

      const run = async (): Promise<Response> => {
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
// Auth context helpers
// ---------------------------------------------------------------------------

export function getAuthContext(request: Request): AuthContext | null {
  const userId = request.headers.get('x-volqan-user-id');
  const email = request.headers.get('x-volqan-user-email');
  const role = request.headers.get('x-volqan-user-role');

  if (!userId) return null;
  return { userId, email: email ?? '', role: role ?? 'user' };
}
