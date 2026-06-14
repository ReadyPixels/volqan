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
import type { ContentRepository } from '../../content/repository.js';
import type { SchemaBuilder } from '../../content/schema-builder.js';
import type { RouteHandler } from './types.js';
/**
 * GET /api/content/[slug]
 *
 * Lists entries for the given content type. Supports filtering, sorting, pagination,
 * and field projection via query parameters.
 */
export declare function createContentListHandler(repository: ContentRepository, _schemaBuilder?: SchemaBuilder): RouteHandler<{
    slug: string;
}>;
/**
 * GET /api/content/[slug]/[id]
 *
 * Returns a single content entry by its primary key.
 */
export declare function createContentGetHandler(repository: ContentRepository): RouteHandler<{
    slug: string;
    id: string;
}>;
/**
 * POST /api/content/[slug]
 *
 * Creates a new content entry. Requires authentication.
 */
export declare function createContentCreateHandler(repository: ContentRepository, _schemaBuilder?: SchemaBuilder): RouteHandler<{
    slug: string;
}>;
/**
 * PUT /api/content/[slug]/[id]
 *
 * Updates an existing content entry. Requires authentication.
 */
export declare function createContentUpdateHandler(repository: ContentRepository, _schemaBuilder?: SchemaBuilder): RouteHandler<{
    slug: string;
    id: string;
}>;
/**
 * DELETE /api/content/[slug]/[id]
 *
 * Deletes a content entry (soft or hard delete, per content type settings).
 * Requires authentication.
 */
export declare function createContentDeleteHandler(repository: ContentRepository, _schemaBuilder?: SchemaBuilder): RouteHandler<{
    slug: string;
    id: string;
}>;
/**
 * POST /api/content/[slug]/[id]/publish
 *
 * Publishes a content entry. Requires authentication.
 */
export declare function createContentPublishHandler(repository: ContentRepository): RouteHandler<{
    slug: string;
    id: string;
}>;
/**
 * POST /api/content/[slug]/[id]/unpublish
 *
 * Unpublishes a content entry. Requires authentication.
 */
export declare function createContentUnpublishHandler(repository: ContentRepository): RouteHandler<{
    slug: string;
    id: string;
}>;
/**
 * GET /api/content-types
 *
 * Lists all registered content types (public metadata).
 */
export declare function createContentTypeListHandler(schemaBuilder: SchemaBuilder): RouteHandler;
/**
 * POST /api/content-types
 *
 * Creates a new content type definition. Admin only.
 */
export declare function createContentTypeCreateHandler(schemaBuilder: SchemaBuilder): RouteHandler;
/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's context.
 */
export declare function createAuthMeHandler(): RouteHandler;
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
export declare function createAuthLoginHandler(authenticate: (email: string, password: string) => Promise<{
    token: string;
    user: Record<string, unknown>;
}>): RouteHandler;
/**
 * POST /api/auth/register
 *
 * Handles user registration. The host application provides the `register`
 * callback that creates the user and returns a { token, user } object.
 */
export declare function createAuthRegisterHandler(register: (email: string, password: string, name?: string) => Promise<{
    token: string;
    user: Record<string, unknown>;
}>): RouteHandler;
/**
 * POST /api/auth/logout
 *
 * Handles logout. For stateless JWT auth this is a client-side operation,
 * but this endpoint can be used to invalidate server-side sessions or refresh tokens.
 */
export declare function createAuthLogoutHandler(invalidate?: (userId: string) => Promise<void>): RouteHandler;
/**
 * GET /api/media
 *
 * Lists media files. The actual implementation delegates to MediaManager.
 * This handler is a typed shell that accepts an injected implementation.
 */
export declare function createMediaListHandler(listMedia: (options: Record<string, unknown>) => Promise<{
    data: unknown[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}>): RouteHandler;
/**
 * POST /api/media/upload
 *
 * Handles file uploads. Delegates to the provided upload implementation.
 * Expects multipart/form-data.
 */
export declare function createMediaUploadHandler(uploadMedia: (file: File, options?: Record<string, unknown>) => Promise<unknown>): RouteHandler;
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
export declare function describeContentRoutes(slug: string): GeneratedRoute[];
/**
 * Returns all system routes produced by the Volqan REST generator.
 */
export declare function describeSystemRoutes(): GeneratedRoute[];
//# sourceMappingURL=router.d.ts.map