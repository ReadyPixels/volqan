/**
 * @file api/rest/response.ts
 * @description Standardised HTTP response helpers for the Volqan REST API.
 *
 * Uses standard Web API Response types so the core package remains
 * framework-agnostic (no Next.js dependency).
 */

import type { ApiResponse, ApiPaginatedResponse, ApiError, ApiPaginationMeta } from './types.js';

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

export function success<T>(
  data: T,
  status = 200,
  message?: string,
): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(message ? { message } : {}),
  };
  return Response.json(body, { status });
}

export function created<T>(data: T, message?: string): Response {
  return success(data, 201, message);
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

// ---------------------------------------------------------------------------
// Paginated list
// ---------------------------------------------------------------------------

export function paginated<T>(
  data: T[],
  meta: ApiPaginationMeta,
  status = 200,
): Response {
  const body: ApiPaginatedResponse<T> = {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
  return Response.json(body, { status });
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export function error(
  code: string,
  message: string,
  status: number,
  errors?: Array<{ field: string; message: string }>,
): Response {
  const body: ApiError = {
    success: false,
    code,
    message,
    timestamp: new Date().toISOString(),
    ...(errors ? { errors } : {}),
  };
  return Response.json(body, { status });
}

export function badRequest(
  message = 'Bad request',
  errors?: Array<{ field: string; message: string }>,
): Response {
  return error('BAD_REQUEST', message, 400, errors);
}

export function unauthorized(message = 'Authentication required'): Response {
  return error('UNAUTHORIZED', message, 401);
}

export function forbidden(message = 'Access denied'): Response {
  return error('FORBIDDEN', message, 403);
}

export function notFound(message = 'Resource not found'): Response {
  return error('NOT_FOUND', message, 404);
}

export function conflict(message = 'Resource already exists'): Response {
  return error('CONFLICT', message, 409);
}

export function validationError(
  errors: Array<{ field: string; message: string }>,
  message = 'Validation failed',
): Response {
  return error('VALIDATION_ERROR', message, 422, errors);
}

export function tooManyRequests(message = 'Rate limit exceeded'): Response {
  return error('RATE_LIMIT_EXCEEDED', message, 429);
}

export function internalError(message = 'Internal server error'): Response {
  return error('INTERNAL_ERROR', message, 500);
}

export function handleError(err: unknown): Response {
  if (err instanceof Error) {
    switch (err.name) {
      case 'ContentTypeNotFoundError':
      case 'ContentEntryNotFoundError':
        return notFound(err.message);

      case 'ContentValidationError': {
        const validErr = err as Error & { errors?: Array<{ field: string; message: string }> };
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
