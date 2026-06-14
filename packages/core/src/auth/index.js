/**
 * @file auth/index.ts
 * @description Barrel export for the Volqan authentication system.
 *
 * @example
 * ```ts
 * import {
 *   hashPassword, verifyPassword,
 *   generateTokenPair, verifyAccessToken,
 *   createSession, validateSession,
 *   requireAuth, requireRole,
 *   GoogleProvider, GitHubProvider,
 * } from '@volqan/core/auth';
 * ```
 */
export { AuthError } from './types.js';
// JWT
export { generateTokenPair, verifyToken, verifyAccessToken, verifyRefreshToken, rotateTokens, decodeToken, ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS, } from './jwt.js';
// Password
export { hashPassword, verifyPassword, validatePasswordStrength, isBcryptHash, } from './password.js';
// OAuth
export { OAuthProvider, GoogleProvider, GitHubProvider, createProvider, } from './oauth.js';
// Session
export { createSession, validateSession, destroySession, destroySessionById, destroyAllUserSessions, refreshSession, listUserSessions, purgeExpiredSessions, } from './session.js';
// Middleware
export { extractBearerToken, extractSessionCookie, resolveAuth, requireAuth, optionalAuth, requireRole, hasRole, setSessionCookie, clearSessionCookie, authErrorResponse, withAuth, withRole, UnauthenticatedRedirect, SESSION_COOKIE_NAME, CSRF_COOKIE_NAME, } from './middleware.js';
//# sourceMappingURL=index.js.map