/**
 * @file api/rest/types.ts
 * @description Type definitions for the Volqan REST API layer.
 *
 * These types are shared between the router, middleware, and response helpers.
 * They align with Next.js 15 App Router conventions.
 */
import type { NextRequest, NextResponse } from 'next/server';
/**
 * Standard success envelope returned by all Volqan REST endpoints.
 *
 * @template T The shape of the `data` payload.
 */
export interface ApiResponse<T = unknown> {
    /** Always true for successful responses. */
    success: true;
    /** The response payload. */
    data: T;
    /** Optional human-readable message. */
    message?: string;
    /** ISO 8601 timestamp of the response. */
    timestamp: string;
}
/**
 * Pagination metadata included in list responses.
 */
export interface ApiPaginationMeta {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
/**
 * Paginated list response shape.
 *
 * @template T The item type.
 */
export interface ApiPaginatedResponse<T = unknown> {
    success: true;
    data: T[];
    meta: ApiPaginationMeta;
    timestamp: string;
}
/**
 * Standard error envelope returned on failure.
 */
export interface ApiError {
    /** Always false for error responses. */
    success: false;
    /** Machine-readable error code (e.g. "NOT_FOUND", "VALIDATION_ERROR"). */
    code: string;
    /** Human-readable error message. */
    message: string;
    /** Optional per-field validation errors. */
    errors?: Array<{
        field: string;
        message: string;
    }>;
    /** ISO 8601 timestamp of the error. */
    timestamp: string;
}
/**
 * Next.js App Router route handler signature with typed context params.
 */
export type RouteHandler<TParams extends Record<string, string> = Record<string, string>> = (request: NextRequest, context: {
    params: Promise<TParams>;
}) => Promise<NextResponse>;
/**
 * Middleware function that runs before a route handler.
 * May return a NextResponse to short-circuit the handler (e.g. auth rejection).
 */
export type Middleware = (request: NextRequest, next: () => Promise<NextResponse>) => Promise<NextResponse>;
/** Authenticated user context attached to the request by auth middleware. */
export interface AuthContext {
    userId: string;
    email: string;
    role: string;
}
/**
 * Extended NextRequest with an optional auth context.
 * The auth middleware attaches this after validating the token.
 */
export interface AuthenticatedRequest extends NextRequest {
    auth?: AuthContext;
}
/** Configuration for a single auto-generated REST route. */
export interface RouteConfig {
    /** HTTP method. */
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** Path pattern (Next.js App Router style). */
    path: string;
    /** Whether authentication is required. */
    requireAuth?: boolean;
    /** Required role (checked after authentication). */
    requireRole?: string;
}
/** Options for the rate-limiting middleware. */
export interface RateLimitConfig {
    /** Maximum requests per window. */
    maxRequests: number;
    /** Window duration in milliseconds. */
    windowMs: number;
}
/** Options for the CORS middleware. */
export interface CorsConfig {
    /** Allowed origins. Use '*' to allow all. */
    origins: string | string[];
    /** Allowed HTTP methods. */
    methods?: string[];
    /** Allowed request headers. */
    headers?: string[];
    /** Whether to allow credentials. */
    credentials?: boolean;
}
//# sourceMappingURL=types.d.ts.map