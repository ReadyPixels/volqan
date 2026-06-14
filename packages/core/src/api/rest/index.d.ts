/**
 * @file api/rest/index.ts
 * @description Barrel export for the Volqan REST API generator.
 *
 * @example
 * ```ts
 * import {
 *   createContentListHandler,
 *   createContentCreateHandler,
 *   withAuth,
 *   withCors,
 *   compose,
 *   success,
 *   error,
 *   paginated,
 *   parseQueryOptions,
 * } from '@volqan/core/api/rest';
 * ```
 */
export type { ApiResponse, ApiPaginatedResponse, ApiPaginationMeta, ApiError, RouteHandler, Middleware, AuthContext, AuthenticatedRequest, RouteConfig, RateLimitConfig, CorsConfig, } from './types.js';
export { success, created, noContent, paginated, error, badRequest, unauthorized, forbidden, notFound, conflict, validationError, tooManyRequests, internalError, handleError, } from './response.js';
export { parseQueryOptions, parseFilters, parseOrderBy, parsePage, parsePerPage, parseFields, parseIncludes } from './query-parser.js';
export { withAuth, withRole, withRateLimit, withCors, withJsonBody, withErrorHandling, compose, resolveAuthContext, getAuthContext, } from './middleware.js';
export { createContentListHandler, createContentGetHandler, createContentCreateHandler, createContentUpdateHandler, createContentDeleteHandler, createContentPublishHandler, createContentUnpublishHandler, createContentTypeListHandler, createContentTypeCreateHandler, createAuthMeHandler, createAuthLoginHandler, createAuthRegisterHandler, createAuthLogoutHandler, createMediaListHandler, createMediaUploadHandler, describeContentRoutes, describeSystemRoutes, } from './router.js';
export type { GeneratedRoute } from './router.js';
//# sourceMappingURL=index.d.ts.map