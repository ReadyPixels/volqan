/**
 * @file api/rest/router.ts
 * @description REST route generator for the Volqan CMS.
 *
 * Generates Next.js App Router route handler functions for every registered
 * ContentType. Consumers mount these handlers in their Next.js project under
 * `app/api/content/[slug]/route.ts` and `app/api/content/[slug]/[id]/route.ts`.
 *
 * ## Usage
 *
 * ```ts
 * // app/api/content/[slug]/route.ts
 * import { createContentListHandler, createContentCreateHandler } from '@volqan/core/api/rest';
 * import { getVolqanServices } from '@/lib/volqan';
 *
 * const { repository, schemaBuilder } = getVolqanServices();
 * export const GET = createContentListHandler(repository, schemaBuilder);
 * export const POST = createContentCreateHandler(repository, schemaBuilder);
 *
 * // app/api/content/[slug]/[id]/route.ts
 * export const GET = createContentGetHandler(repository);
 * export const PUT = createContentUpdateHandler(repository, schemaBuilder);
 * export const DELETE = createContentDeleteHandler(repository, schemaBuilder);
 * ```
 */

import { NextResponse, type NextRequest } from 'next/server';
import { success, created, noContent, paginated, handleError, notFound, badRequest } from './response.js';
import { parseQueryOptions } from './query-parser.js';
import { getAuthContext } from './middleware.js';
import type { ContentRepository } from '../../content/repository.js';
import type { SchemaBuilder } from '../../content/schema-builder.js';
import type { RouteHandler } from './types.js';

// ---------------------------------------------------------------------------
// Content Entry Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/content/[slug]
 *
 * Lists entries for the given content type. Supports filtering, sorting, pagination,
 * and field projection via query parameters.
 */
export function createContentListHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug } = await context.params;
      const queryOptions = parseQueryOptions(request);
      const result = await repository.findMany(slug, queryOptions);
      return paginated(result.data, result.meta) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * GET /api/content/[slug]/[id]
 *
 * Returns a single content entry by its primary key.
 */
export function createContentGetHandler(
  repository: ContentRepository,
): RouteHandler<{ slug: string; id: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug, id } = await context.params;
      const entry = await repository.findById(slug, id);
      return success(entry) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/content/[slug]
 *
 * Creates a new content entry. Requires authentication.
 */
export function createContentCreateHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug } = await context.params;
      const auth = getAuthContext(request);
      const body = await parseJsonBody(request);
      if (!body) return badRequest('Request body is required') as NextResponse;

      const entry = await repository.create(slug, body as Record<string, unknown>, auth?.userId);
      return created(entry) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * PUT /api/content/[slug]/[id]
 *
 * Updates an existing content entry. Requires authentication.
 */
export function createContentUpdateHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string; id: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug, id } = await context.params;
      const body = await parseJsonBody(request);
      if (!body) return badRequest('Request body is required') as NextResponse;

      const entry = await repository.update(slug, id, body as Record<string, unknown>);
      return success(entry) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * DELETE /api/content/[slug]/[id]
 *
 * Deletes a content entry (soft or hard delete, per content type settings).
 * Requires authentication.
 */
export function createContentDeleteHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string; id: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug, id } = await context.params;
      await repository.delete(slug, id);
      return noContent();
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/content/[slug]/[id]/publish
 *
 * Publishes a content entry. Requires authentication.
 */
export function createContentPublishHandler(
  repository: ContentRepository,
): RouteHandler<{ slug: string; id: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug, id } = await context.params;
      const entry = await repository.publish(slug, id);
      return success(entry) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/content/[slug]/[id]/unpublish
 *
 * Unpublishes a content entry. Requires authentication.
 */
export function createContentUnpublishHandler(
  repository: ContentRepository,
): RouteHandler<{ slug: string; id: string }> {
  return async (request: NextRequest, context) => {
    try {
      const { slug, id } = await context.params;
      const entry = await repository.unpublish(slug, id);
      return success(entry) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

// ---------------------------------------------------------------------------
// Content Type Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/content-types
 *
 * Lists all registered content types (public metadata).
 */
export function createContentTypeListHandler(
  schemaBuilder: SchemaBuilder,
): RouteHandler {
  return async (_request: NextRequest, _context) => {
    try {
      const types = await schemaBuilder.listContentTypes();
      return success(types) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/content-types
 *
 * Creates a new content type definition. Admin only.
 */
export function createContentTypeCreateHandler(
  schemaBuilder: SchemaBuilder,
): RouteHandler {
  return async (request: NextRequest, _context) => {
    try {
      const body = await parseJsonBody(request);
      if (!body) return badRequest('Request body is required') as NextResponse;

      const definition = await schemaBuilder.createContentType(
        body as unknown as Parameters<SchemaBuilder['createContentType']>[0],
      );
      return created(definition) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

// ---------------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's context.
 */
export function createAuthMeHandler(): RouteHandler {
  return async (request: NextRequest, _context) => {
    const auth = getAuthContext(request);
    if (!auth) {
      return (await import('./response.js')).unauthorized() as NextResponse;
    }
    return success(auth) as NextResponse;
  };
}

/**
 * POST /api/auth/login
 *
 * Handles user login. The actual credential check and JWT issuance must be
 * implemented by the host application. This handler provides the request
 * parsing and response envelope.
 *
 * The host application should provide an `authenticate` callback that returns
 * a { token, user } object or throws on failure.
 */
export function createAuthLoginHandler(
  authenticate: (email: string, password: string) => Promise<{ token: string; user: Record<string, unknown> }>,
): RouteHandler {
  return async (request: NextRequest, _context) => {
    try {
      const body = await parseJsonBody(request);
      if (!body || !body['email'] || !body['password']) {
        return badRequest('email and password are required') as NextResponse;
      }

      const result = await authenticate(String(body['email']), String(body['password']));
      return success(result) as NextResponse;
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('invalid')) {
        return (await import('./response.js')).unauthorized('Invalid credentials') as NextResponse;
      }
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/auth/register
 *
 * Handles user registration. The host application provides the `register`
 * callback that creates the user and returns a { token, user } object.
 */
export function createAuthRegisterHandler(
  register: (email: string, password: string, name?: string) => Promise<{ token: string; user: Record<string, unknown> }>,
): RouteHandler {
  return async (request: NextRequest, _context) => {
    try {
      const body = await parseJsonBody(request);
      if (!body || !body['email'] || !body['password']) {
        return badRequest('email and password are required') as NextResponse;
      }

      const result = await register(
        String(body['email']),
        String(body['password']),
        body['name'] ? String(body['name']) : undefined,
      );
      return created(result) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/auth/logout
 *
 * Handles logout. For stateless JWT auth this is a client-side operation,
 * but this endpoint can be used to invalidate server-side sessions or refresh tokens.
 */
export function createAuthLogoutHandler(
  invalidate?: (userId: string) => Promise<void>,
): RouteHandler {
  return async (request: NextRequest, _context) => {
    try {
      const auth = getAuthContext(request);
      if (auth && invalidate) {
        await invalidate(auth.userId);
      }
      return success({ loggedOut: true }) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

// ---------------------------------------------------------------------------
// Media Routes (shell — full implementation is in the media module)
// ---------------------------------------------------------------------------

/**
 * GET /api/media
 *
 * Lists media files. The actual implementation delegates to MediaManager.
 * This handler is a typed shell that accepts an injected implementation.
 */
export function createMediaListHandler(
  listMedia: (options: Record<string, unknown>) => Promise<{ data: unknown[]; meta: { total: number; page: number; perPage: number; totalPages: number } }>,
): RouteHandler {
  return async (request: NextRequest, _context) => {
    try {
      const queryOptions = parseQueryOptions(request);
      const result = await listMedia(queryOptions as Record<string, unknown>);
      return paginated(result.data, result.meta) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

/**
 * POST /api/media/upload
 *
 * Handles file uploads. Delegates to the provided upload implementation.
 * Expects multipart/form-data.
 */
export function createMediaUploadHandler(
  uploadMedia: (file: File, options?: Record<string, unknown>) => Promise<unknown>,
): RouteHandler {
  return async (request: NextRequest, _context) => {
    try {
      const contentType = request.headers.get('content-type') ?? '';
      if (!contentType.includes('multipart/form-data')) {
        return badRequest('Content-Type must be multipart/form-data') as NextResponse;
      }

      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return badRequest('A file field is required in the form data') as NextResponse;
      }

      const options = formData.get('options');
      const parsedOptions = options ? JSON.parse(String(options)) as Record<string, unknown> : {};

      const media = await uploadMedia(file, parsedOptions);
      return created(media) as NextResponse;
    } catch (err) {
      return handleError(err) as NextResponse;
    }
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Safely parses a JSON request body.
 * Returns null if the body is empty or malformed.
 */
async function parseJsonBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route registry
// ---------------------------------------------------------------------------

/** Descriptor of an auto-generated REST route for documentation / tooling. */
export interface GeneratedRoute {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
}

/**
 * Returns the list of routes that the Volqan REST generator produces for a
 * given content type slug. Useful for documentation generation.
 *
 * @param slug The content type slug (e.g. "blog-post").
 */
export function describeContentRoutes(slug: string): GeneratedRoute[] {
  return [
    { method: 'GET', path: `/api/content/${slug}`, description: 'List entries', requiresAuth: false },
    { method: 'POST', path: `/api/content/${slug}`, description: 'Create entry', requiresAuth: true },
    { method: 'GET', path: `/api/content/${slug}/[id]`, description: 'Get single entry', requiresAuth: false },
    { method: 'PUT', path: `/api/content/${slug}/[id]`, description: 'Update entry', requiresAuth: true },
    { method: 'DELETE', path: `/api/content/${slug}/[id]`, description: 'Delete entry', requiresAuth: true },
    { method: 'POST', path: `/api/content/${slug}/[id]/publish`, description: 'Publish entry', requiresAuth: true },
    { method: 'POST', path: `/api/content/${slug}/[id]/unpublish`, description: 'Unpublish entry', requiresAuth: true },
  ];
}

/**
 * Returns all system routes produced by the Volqan REST generator.
 */
export function describeSystemRoutes(): GeneratedRoute[] {
  return [
    { method: 'GET', path: '/api/content-types', description: 'List content types', requiresAuth: false },
    { method: 'POST', path: '/api/content-types', description: 'Create content type', requiresAuth: true },
    { method: 'GET', path: '/api/auth/me', description: 'Current user', requiresAuth: true },
    { method: 'POST', path: '/api/auth/login', description: 'Login', requiresAuth: false },
    { method: 'POST', path: '/api/auth/register', description: 'Register', requiresAuth: false },
    { method: 'POST', path: '/api/auth/logout', description: 'Logout', requiresAuth: false },
    { method: 'GET', path: '/api/media', description: 'List media', requiresAuth: false },
    { method: 'POST', path: '/api/media/upload', description: 'Upload media', requiresAuth: true },
  ];
}
