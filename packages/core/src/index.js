/**
 * @file index.ts
 * @description Root barrel export for the @volqan/core package.
 *
 * Includes: extensions, themes, license, billing, content modeling,
 * REST API, GraphQL API, and media manager.
 *
 * Consumers can import anything from the top-level package entry:
 * ```ts
 * import {
 *   VolqanExtension,
 *   ExtensionManager,
 *   VolqanTheme,
 *   applyTheme,
 *   checkLicenseStatus,
 *   calculateServiceFee,
 *   createWebhookHandler,
 * } from '@volqan/core';
 * ```
 *
 * Or import from subpath exports for better tree-shaking:
 * ```ts
 * import { ExtensionManager } from '@volqan/core/extensions';
 * import { loadTheme }        from '@volqan/core/themes';
 * import { checkLicenseStatus } from '@volqan/core/license';
 * import { calculateServiceFee } from '@volqan/core/billing';
 * ```
 */
export { ExtensionManager, loadExtension, validateExtension, enableExtension, disableExtension, bootExtension, unloadExtension, getInstalledExtensions, getExtension, collectMenuItems, collectAdminPages, collectWidgets, collectSettings, collectApiRoutes, collectContentHooks, collectMigrations, setInstallationId, ExtensionValidationError, ExtensionLifecycleError, BAZARIX_MARKETPLACE_URL, BAZARIX_EXTENSIONS_URL, BAZARIX_THEMES_URL, BAZARIX_BASE_URL, BAZARIX_EXTENSIONS_BROWSE_URL, BAZARIX_THEMES_BROWSE_URL, buildMarketplaceURL, parseInstallURL, } from './extensions/index.js';
export { loadTheme, applyTheme, loadAndApplyTheme, getActiveTheme, listThemes, getTheme, unloadTheme, generateThemeCss, getComponentOverride, mergeComponentStyle, validateTheme, ThemeValidationError, } from './themes/index.js';
export { checkLicenseStatus, getInstallationId, invalidateLicenseCache, seedLicenseCache, licenseCache, LICENSE_API_URL, PROJECT_URL, PROJECT_NAME, } from './license/index.js';
export { calculateServiceFee, calculateMonthlyPrice, calculateBuyerTotal, calculateSellerPayout, calculatePlatformRevenue, getDetailedFeeBreakdown, isValidListingPrice, formatUsd, createWebhookHandler, MIN_LISTING_PRICE_CENTS, MAX_LISTING_PRICE_CENTS, } from './billing/index.js';
// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export { db, prisma, connectDb, disconnectDb } from './database/index.js';
export { runMigrations, getMigrationStatus, generateClient, resetDatabase, MigrationError, seed, } from './database/index.js';
export { AuthError, 
// JWT
generateTokenPair, verifyToken, verifyAccessToken, verifyRefreshToken, rotateTokens, decodeToken, ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS, 
// Password
hashPassword, verifyPassword, validatePasswordStrength, isBcryptHash, 
// OAuth
OAuthProvider, GoogleProvider, GitHubProvider, createProvider, 
// Session
createSession, validateSession, destroySession, destroySessionById, destroyAllUserSessions, refreshSession, listUserSessions, purgeExpiredSessions, 
// Middleware
extractBearerToken, extractSessionCookie, resolveAuth, requireAuth, optionalAuth, requireRole, hasRole, setSessionCookie, clearSessionCookie, authErrorResponse, UnauthenticatedRedirect, SESSION_COOKIE_NAME, CSRF_COOKIE_NAME, } from './auth/index.js';
export { PERMISSION_MATRIX, getPermission, getRolePermissions, parseResourceAction, can, assertCan, canAny, canAll, withPermission, getUserCapabilities, } from './rbac/index.js';
export { DEFAULT_CONFIG, loadConfig, getConfig, resetConfig, defineConfig, } from './config/index.js';
// ---------------------------------------------------------------------------
// Content Modeling Engine
// ---------------------------------------------------------------------------
export { FieldType, ContentStatus, ContentValidationError, ContentTypeNotFoundError, ContentEntryNotFoundError, SchemaBuilder, toSlug, ContentRepository, HookRegistry, } from './content/index.js';
// ---------------------------------------------------------------------------
// REST API Generator
// ---------------------------------------------------------------------------
export { success, created, noContent, paginated, error, badRequest, unauthorized, forbidden, notFound, conflict, validationError, tooManyRequests, internalError, handleError, parseQueryOptions, parseFilters, parseOrderBy, parsePage, parsePerPage, parseFields, parseIncludes, withAuth, withRole, withRateLimit, withCors, withJsonBody, withErrorHandling, compose, resolveAuthContext, getAuthContext, createContentListHandler, createContentGetHandler, createContentCreateHandler, createContentUpdateHandler, createContentDeleteHandler, createContentPublishHandler, createContentUnpublishHandler, createContentTypeListHandler, createContentTypeCreateHandler, createAuthMeHandler, createAuthLoginHandler, createAuthRegisterHandler, createAuthLogoutHandler, createMediaListHandler, createMediaUploadHandler, describeContentRoutes, describeSystemRoutes, } from './api/rest/index.js';
// ---------------------------------------------------------------------------
// GraphQL API Generator
// ---------------------------------------------------------------------------
export { SchemaGenerator, buildResolvers, GraphQLAuthError, GraphQLNotFoundError, } from './api/graphql/index.js';
// ---------------------------------------------------------------------------
// Media Manager
// ---------------------------------------------------------------------------
export { SUPPORTED_IMAGE_TYPES, SUPPORTED_DOCUMENT_TYPES, SUPPORTED_VIDEO_TYPES, SUPPORTED_AUDIO_TYPES, ALL_SUPPORTED_TYPES, DEFAULT_MAX_FILE_SIZE, FileTooLargeError, UnsupportedFileTypeError, MediaNotFoundError, LocalStorageProvider, S3StorageProvider, ImageProcessor, isProcessableImage, MediaManager, } from './media/index.js';
// ---------------------------------------------------------------------------
// Extension Runtime
// ---------------------------------------------------------------------------
export { ExtensionSandbox, SandboxError, createSandbox, createExtensionContext, clearExtensionConfig, exportAllConfigs, clearEventBus, ExtensionLifecycleManager, ExtensionRegistry, extensionRegistry, } from './extensions/runtime/index.js';
// ---------------------------------------------------------------------------
// Theme Runtime
// ---------------------------------------------------------------------------
export { ThemeApplicator, flattenThemeTokens, tokensToCSS, themeApplicator, ThemeRegistry, themeRegistry, ThemePreview, themePreview, } from './themes/runtime/index.js';
export { PageRepository, pageRepository } from './pages/index.js';
export { OpenAIProvider, AnthropicProvider, GeminiProvider, OllamaProvider, AIManager, aiManager, } from './ai/index.js';
//# sourceMappingURL=index.js.map