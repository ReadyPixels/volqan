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
import { NextResponse } from 'next/server';
import { success, created, noContent, paginated, handleError, notFound, badRequest } from './response.js';
import { parseQueryOptions } from './query-parser.js';
import { getAuthContext } from './middleware.js';
// ---------------------------------------------------------------------------
// Content Entry Routes
// ---------------------------------------------------------------------------
/**
 * GET /api/content/[slug]
 *
 * Lists entries for the given content type. Supports filtering, sorting, pagination,
 * and field projection via query parameters.
 */
export function createContentListHandler(repository, _schemaBuilder) {
    return async (request, context) => {
        try {
            const { slug } = await context.params;
            const queryOptions = parseQueryOptions(request);
            const result = await repository.findMany(slug, queryOptions);
            return paginated(result.data, result.meta);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * GET /api/content/[slug]/[id]
 *
 * Returns a single content entry by its primary key.
 */
export function createContentGetHandler(repository) {
    return async (request, context) => {
        try {
            const { slug, id } = await context.params;
            const entry = await repository.findById(slug, id);
            return success(entry);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * POST /api/content/[slug]
 *
 * Creates a new content entry. Requires authentication.
 */
export function createContentCreateHandler(repository, _schemaBuilder) {
    return async (request, context) => {
        try {
            const { slug } = await context.params;
            const auth = getAuthContext(request);
            const body = await parseJsonBody(request);
            if (!body)
                return badRequest('Request body is required');
            const entry = await repository.create(slug, body, auth?.userId);
            return created(entry);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * PUT /api/content/[slug]/[id]
 *
 * Updates an existing content entry. Requires authentication.
 */
export function createContentUpdateHandler(repository, _schemaBuilder) {
    return async (request, context) => {
        try {
            const { slug, id } = await context.params;
            const body = await parseJsonBody(request);
            if (!body)
                return badRequest('Request body is required');
            const entry = await repository.update(slug, id, body);
            return success(entry);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * DELETE /api/content/[slug]/[id]
 *
 * Deletes a content entry (soft or hard delete, per content type settings).
 * Requires authentication.
 */
export function createContentDeleteHandler(repository, _schemaBuilder) {
    return async (request, context) => {
        try {
            const { slug, id } = await context.params;
            await repository.delete(slug, id);
            return noContent();
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * POST /api/content/[slug]/[id]/publish
 *
 * Publishes a content entry. Requires authentication.
 */
export function createContentPublishHandler(repository) {
    return async (request, context) => {
        try {
            const { slug, id } = await context.params;
            const entry = await repository.publish(slug, id);
            return success(entry);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * POST /api/content/[slug]/[id]/unpublish
 *
 * Unpublishes a content entry. Requires authentication.
 */
export function createContentUnpublishHandler(repository) {
    return async (request, context) => {
        try {
            const { slug, id } = await context.params;
            const entry = await repository.unpublish(slug, id);
            return success(entry);
        }
        catch (err) {
            return handleError(err);
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
export function createContentTypeListHandler(schemaBuilder) {
    return async (_request, _context) => {
        try {
            const types = await schemaBuilder.listContentTypes();
            return success(types);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * POST /api/content-types
 *
 * Creates a new content type definition. Admin only.
 */
export function createContentTypeCreateHandler(schemaBuilder) {
    return async (request, _context) => {
        try {
            const body = await parseJsonBody(request);
            if (!body)
                return badRequest('Request body is required');
            const definition = await schemaBuilder.createContentType(body);
            return created(definition);
        }
        catch (err) {
            return handleError(err);
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
export function createAuthMeHandler() {
    return async (request, _context) => {
        const auth = getAuthContext(request);
        if (!auth) {
            return (await import('./response.js')).unauthorized();
        }
        return success(auth);
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
export function createAuthLoginHandler(authenticate) {
    return async (request, _context) => {
        try {
            const body = await parseJsonBody(request);
            if (!body || !body['email'] || !body['password']) {
                return badRequest('email and password are required');
            }
            const result = await authenticate(String(body['email']), String(body['password']));
            return success(result);
        }
        catch (err) {
            if (err instanceof Error && err.message.toLowerCase().includes('invalid')) {
                return (await import('./response.js')).unauthorized('Invalid credentials');
            }
            return handleError(err);
        }
    };
}
/**
 * POST /api/auth/register
 *
 * Handles user registration. The host application provides the `register`
 * callback that creates the user and returns a { token, user } object.
 */
export function createAuthRegisterHandler(register) {
    return async (request, _context) => {
        try {
            const body = await parseJsonBody(request);
            if (!body || !body['email'] || !body['password']) {
                return badRequest('email and password are required');
            }
            const result = await register(String(body['email']), String(body['password']), body['name'] ? String(body['name']) : undefined);
            return created(result);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * POST /api/auth/logout
 *
 * Handles logout. For stateless JWT auth this is a client-side operation,
 * but this endpoint can be used to invalidate server-side sessions or refresh tokens.
 */
export function createAuthLogoutHandler(invalidate) {
    return async (request, _context) => {
        try {
            const auth = getAuthContext(request);
            if (auth && invalidate) {
                await invalidate(auth.userId);
            }
            return success({ loggedOut: true });
        }
        catch (err) {
            return handleError(err);
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
export function createMediaListHandler(listMedia) {
    return async (request, _context) => {
        try {
            const queryOptions = parseQueryOptions(request);
            const result = await listMedia(queryOptions);
            return paginated(result.data, result.meta);
        }
        catch (err) {
            return handleError(err);
        }
    };
}
/**
 * POST /api/media/upload
 *
 * Handles file uploads. Delegates to the provided upload implementation.
 * Expects multipart/form-data.
 */
export function createMediaUploadHandler(uploadMedia) {
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
            const parsedOptions = options ? JSON.parse(String(options)) : {};
            const media = await uploadMedia(file, parsedOptions);
            return created(media);
        }
        catch (err) {
            return handleError(err);
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
async function parseJsonBody(request) {
    try {
        const text = await request.text();
        if (!text.trim())
            return null;
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
/**
 * Returns the list of routes that the Volqan REST generator produces for a
 * given content type slug. Useful for documentation generation.
 *
 * @param slug The content type slug (e.g. "blog-post").
 */
export function describeContentRoutes(slug) {
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
export function describeSystemRoutes() {
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
//# sourceMappingURL=router.js.map