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
// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------
/**
 * Returns a successful JSON response with the standard Volqan envelope.
 *
 * @param data The payload to include in `data`.
 * @param status HTTP status code (default 200).
 * @param message Optional human-readable message.
 */
export function success(data, status = 200, message) {
    const body = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        ...(message ? { message } : {}),
    };
    return NextResponse.json(body, { status });
}
/**
 * Returns a 201 Created response. Alias for `success(data, 201)`.
 */
export function created(data, message) {
    return success(data, 201, message);
}
/**
 * Returns a 204 No Content response.
 * Note: 204 responses must have no body; this returns an empty response.
 */
export function noContent() {
    return new NextResponse(null, { status: 204 });
}
// ---------------------------------------------------------------------------
// Paginated list
// ---------------------------------------------------------------------------
/**
 * Returns a paginated list response with the standard meta block.
 *
 * @param data Array of items for the current page.
 * @param meta Pagination metadata.
 * @param status HTTP status code (default 200).
 */
export function paginated(data, meta, status = 200) {
    const body = {
        success: true,
        data,
        meta,
        timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, { status });
}
// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
/**
 * Returns an error JSON response with the standard Volqan error envelope.
 *
 * @param code Machine-readable error code (e.g. "NOT_FOUND").
 * @param message Human-readable description.
 * @param status HTTP status code.
 * @param errors Optional per-field validation errors.
 */
export function error(code, message, status, errors) {
    const body = {
        success: false,
        code,
        message,
        timestamp: new Date().toISOString(),
        ...(errors ? { errors } : {}),
    };
    return NextResponse.json(body, { status });
}
// ---------------------------------------------------------------------------
// Convenience error factories
// ---------------------------------------------------------------------------
/** 400 Bad Request */
export function badRequest(message = 'Bad request', errors) {
    return error('BAD_REQUEST', message, 400, errors);
}
/** 401 Unauthorized */
export function unauthorized(message = 'Authentication required') {
    return error('UNAUTHORIZED', message, 401);
}
/** 403 Forbidden */
export function forbidden(message = 'Access denied') {
    return error('FORBIDDEN', message, 403);
}
/** 404 Not Found */
export function notFound(message = 'Resource not found') {
    return error('NOT_FOUND', message, 404);
}
/** 409 Conflict */
export function conflict(message = 'Resource already exists') {
    return error('CONFLICT', message, 409);
}
/** 422 Unprocessable Entity (validation) */
export function validationError(errors, message = 'Validation failed') {
    return error('VALIDATION_ERROR', message, 422, errors);
}
/** 429 Too Many Requests */
export function tooManyRequests(message = 'Rate limit exceeded') {
    return error('RATE_LIMIT_EXCEEDED', message, 429);
}
/** 500 Internal Server Error */
export function internalError(message = 'Internal server error') {
    return error('INTERNAL_ERROR', message, 500);
}
// ---------------------------------------------------------------------------
// Error handler — converts known error types to API responses
// ---------------------------------------------------------------------------
/**
 * Converts a caught error into an appropriate API error response.
 * Handles Volqan-specific errors and falls back to 500 for unknown errors.
 *
 * @param err The caught error (unknown type from a try/catch).
 */
export function handleError(err) {
    if (err instanceof Error) {
        switch (err.name) {
            case 'ContentTypeNotFoundError':
            case 'ContentEntryNotFoundError':
                return notFound(err.message);
            case 'ContentValidationError': {
                const validErr = err;
                return validationError(validErr.errors ?? [], err.message);
            }
            case 'MediaNotFoundError':
                return notFound(err.message);
            default:
                if (err.message?.includes('Unique constraint')) {
                    return conflict('A resource with this value already exists');
                }
                console.error('[Volqan API Error]', err);
                return internalError();
        }
    }
    console.error('[Volqan API Unknown Error]', err);
    return internalError();
}
//# sourceMappingURL=response.js.map