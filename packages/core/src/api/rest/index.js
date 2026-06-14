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
// Response helpers
export { success, created, noContent, paginated, error, badRequest, unauthorized, forbidden, notFound, conflict, validationError, tooManyRequests, internalError, handleError, } from './response.js';
// Query parser
export { parseQueryOptions, parseFilters, parseOrderBy, parsePage, parsePerPage, parseFields, parseIncludes } from './query-parser.js';
// Middleware
export { withAuth, withRole, withRateLimit, withCors, withJsonBody, withErrorHandling, compose, resolveAuthContext, getAuthContext, } from './middleware.js';
// Route handlers
export { createContentListHandler, createContentGetHandler, createContentCreateHandler, createContentUpdateHandler, createContentDeleteHandler, createContentPublishHandler, createContentUnpublishHandler, createContentTypeListHandler, createContentTypeCreateHandler, createAuthMeHandler, createAuthLoginHandler, createAuthRegisterHandler, createAuthLogoutHandler, createMediaListHandler, createMediaUploadHandler, describeContentRoutes, describeSystemRoutes, } from './router.js';
//# sourceMappingURL=index.js.map