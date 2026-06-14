/**
 * @file api/rest/response.ts
 * @description Standardised HTTP response helpers for the Volqan REST API.
 *
 * All route handlers must use these helpers to ensure a consistent response
 * envelope across every endpoint.
 *
 * @example
 * ```ts
 * import { success, error, paginated } from '@volqan/core/api/rest';
 *
 * // In a route handler:
 * return success(entry, 201);
 * return error('NOT_FOUND', 'Entry not found', 404);
 * return paginated(entries, { total: 42, page: 1, perPage: 20, totalPages: 3 });
 * ```
 */
import { NextResponse } from 'next/server';
import type { ApiResponse, ApiPaginatedResponse, ApiError, ApiPaginationMeta } from './types.js';
/**
 * Returns a successful JSON response with the standard Volqan envelope.
 *
 * @param data The payload to include in `data`.
 * @param status HTTP status code (default 200).
 * @param message Optional human-readable message.
 */
export declare function success<T>(data: T, status?: number, message?: string): NextResponse<ApiResponse<T>>;
/**
 * Returns a 201 Created response. Alias for `success(data, 201)`.
 */
export declare function created<T>(data: T, message?: string): NextResponse<ApiResponse<T>>;
/**
 * Returns a 204 No Content response.
 * Note: 204 responses must have no body; this returns an empty response.
 */
export declare function noContent(): NextResponse;
/**
 * Returns a paginated list response with the standard meta block.
 *
 * @param data Array of items for the current page.
 * @param meta Pagination metadata.
 * @param status HTTP status code (default 200).
 */
export declare function paginated<T>(data: T[], meta: ApiPaginationMeta, status?: number): NextResponse<ApiPaginatedResponse<T>>;
/**
 * Returns an error JSON response with the standard Volqan error envelope.
 *
 * @param code Machine-readable error code (e.g. "NOT_FOUND").
 * @param message Human-readable description.
 * @param status HTTP status code.
 * @param errors Optional per-field validation errors.
 */
export declare function error(code: string, message: string, status: number, errors?: Array<{
    field: string;
    message: string;
}>): NextResponse<ApiError>;
/** 400 Bad Request */
export declare function badRequest(message?: string, errors?: Array<{
    field: string;
    message: string;
}>): NextResponse<ApiError>;
/** 401 Unauthorized */
export declare function unauthorized(message?: string): NextResponse<ApiError>;
/** 403 Forbidden */
export declare function forbidden(message?: string): NextResponse<ApiError>;
/** 404 Not Found */
export declare function notFound(message?: string): NextResponse<ApiError>;
/** 409 Conflict */
export declare function conflict(message?: string): NextResponse<ApiError>;
/** 422 Unprocessable Entity (validation) */
export declare function validationError(errors: Array<{
    field: string;
    message: string;
}>, message?: string): NextResponse<ApiError>;
/** 429 Too Many Requests */
export declare function tooManyRequests(message?: string): NextResponse<ApiError>;
/** 500 Internal Server Error */
export declare function internalError(message?: string): NextResponse<ApiError>;
/**
 * Converts a caught error into an appropriate API error response.
 * Handles Volqan-specific errors and falls back to 500 for unknown errors.
 *
 * @param err The caught error (unknown type from a try/catch).
 */
export declare function handleError(err: unknown): NextResponse<ApiError>;
//# sourceMappingURL=response.d.ts.map