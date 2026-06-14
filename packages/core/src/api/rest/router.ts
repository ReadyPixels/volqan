/**
 * @file api/rest/router.ts
 * @description REST route generator for the Volqan CMS.
 *
 * Uses standard Web API Request/Response types so the core package
 * remains framework-agnostic (no Next.js dependency).
 */

import { success, created, noContent, paginated, handleError, notFound, badRequest } from './response.js';
import { parseQueryOptions } from './query-parser.js';
import { getAuthContext } from './middleware.js';
import type { ContentRepository } from '../../content/repository.js';
import type { SchemaBuilder } from '../../content/schema-builder.js';
import type { RouteHandler } from './types.js';

// ---------------------------------------------------------------------------
// Content Entry Routes
// ---------------------------------------------------------------------------

export function createContentListHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string }> {
  return async (request, context) => {
    try {
      const { slug } = await context.params;
      const queryOptions = parseQueryOptions(request);
      const result = await repository.findMany(slug, queryOptions);
      return paginated(result.data, result.meta);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentGetHandler(
  repository: ContentRepository,
): RouteHandler<{ slug: string; id: string }> {
  return async (request, context) => {
    try {
      const { slug, id } = await context.params;
      const entry = await repository.findById(slug, id);
      return success(entry);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentCreateHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string }> {
  return async (request, context) => {
    try {
      const { slug } = await context.params;
      const auth = getAuthContext(request);
      const body = await parseJsonBody(request);
      if (!body) return badRequest('Request body is required');

      const entry = await repository.create(slug, body as Record<string, unknown>, auth?.userId);
      return created(entry);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentUpdateHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string; id: string }> {
  return async (request, context) => {
    try {
      const { slug, id } = await context.params;
      const body = await parseJsonBody(request);
      if (!body) return badRequest('Request body is required');

      const entry = await repository.update(slug, id, body as Record<string, unknown>);
      return success(entry);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentDeleteHandler(
  repository: ContentRepository,
  _schemaBuilder?: SchemaBuilder,
): RouteHandler<{ slug: string; id: string }> {
  return async (request, context) => {
    try {
      const { slug, id } = await context.params;
      await repository.delete(slug, id);
      return noContent();
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentPublishHandler(
  repository: ContentRepository,
): RouteHandler<{ slug: string; id: string }> {
  return async (request, context) => {
    try {
      const { slug, id } = await context.params;
      const entry = await repository.publish(slug, id);
      return success(entry);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentUnpublishHandler(
  repository: ContentRepository,
): RouteHandler<{ slug: string; id: string }> {
  return async (request, context) => {
    try {
      const { slug, id } = await context.params;
      const entry = await repository.unpublish(slug, id);
      return success(entry);
    } catch (err) {
      return handleError(err);
    }
  };
}

// ---------------------------------------------------------------------------
// Content Type Routes
// ---------------------------------------------------------------------------

export function createContentTypeListHandler(
  schemaBuilder: SchemaBuilder,
): RouteHandler {
  return async (_request, _context) => {
    try {
      const types = await schemaBuilder.listContentTypes();
      return success(types);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createContentTypeCreateHandler(
  schemaBuilder: SchemaBuilder,
): RouteHandler {
  return async (request, _context) => {
    try {
      const body = await parseJsonBody(request);
      if (!body) return badRequest('Request body is required');

      const definition = await schemaBuilder.createContentType(
        body as unknown as Parameters<SchemaBuilder['createContentType']>[0],
      );
      return created(definition);
    } catch (err) {
      return handleError(err);
    }
  };
}

// ---------------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------------

export function createAuthMeHandler(): RouteHandler {
  return async (request, _context) => {
    const auth = getAuthContext(request);
    if (!auth) {
      return (await import('./response.js')).unauthorized();
    }
    return success(auth);
  };
}

export function createAuthLoginHandler(
  authenticate: (email: string, password: string) => Promise<{ token: string; user: Record<string, unknown> }>,
): RouteHandler {
  return async (request, _context) => {
    try {
      const body = await parseJsonBody(request);
      if (!body || !body['email'] || !body['password']) {
        return badRequest('email and password are required');
      }

      const result = await authenticate(String(body['email']), String(body['password']));
      return success(result);
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('invalid')) {
        return (await import('./response.js')).unauthorized('Invalid credentials');
      }
      return handleError(err);
    }
  };
}

export function createAuthRegisterHandler(
  register: (email: string, password: string, name?: string) => Promise<{ token: string; user: Record<string, unknown> }>,
): RouteHandler {
  return async (request, _context) => {
    try {
      const body = await parseJsonBody(request);
      if (!body || !body['email'] || !body['password']) {
        return badRequest('email and password are required');
      }

      const result = await register(
        String(body['email']),
        String(body['password']),
        body['name'] ? String(body['name']) : undefined,
      );
      return created(result);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createAuthLogoutHandler(
  invalidate?: (userId: string) => Promise<void>,
): RouteHandler {
  return async (request, _context) => {
    try {
      const auth = getAuthContext(request);
      if (auth && invalidate) {
        await invalidate(auth.userId);
      }
      return success({ loggedOut: true });
    } catch (err) {
      return handleError(err);
    }
  };
}

// ---------------------------------------------------------------------------
// Media Routes
// ---------------------------------------------------------------------------

export function createMediaListHandler(
  listMedia: (options: Record<string, unknown>) => Promise<{ data: unknown[]; meta: { total: number; page: number; perPage: number; totalPages: number } }>,
): RouteHandler {
  return async (request, _context) => {
    try {
      const queryOptions = parseQueryOptions(request);
      const result = await listMedia(queryOptions as Record<string, unknown>);
      return paginated(result.data, result.meta);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function createMediaUploadHandler(
  uploadMedia: (file: File, options?: Record<string, unknown>) => Promise<unknown>,
): RouteHandler {
  return async (request, _context) => {
    try {
      const contentType = request.headers.get('content-type') ?? '';
      if (!contentType.includes('multipart/form-data')) {
        return badRequest('Content-Type must be multipart/form-data');
      }

      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return badRequest('A file field is required in the form data');
      }

      const options = formData.get('options');
      const parsedOptions = options ? JSON.parse(String(options)) as Record<string, unknown> : {};

      const media = await uploadMedia(file, parsedOptions);
      return created(media);
    } catch (err) {
      return handleError(err);
    }
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
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

export interface GeneratedRoute {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
}

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
