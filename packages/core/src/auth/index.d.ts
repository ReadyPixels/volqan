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
export type { AuthUser, AuthSession, LoginCredentials, RegisterData, OAuthProfile, OAuthProviderName, TokenPayload, TokenPair, AuthErrorCode, } from './types.js';
export { AuthError } from './types.js';
export { generateTokenPair, verifyToken, verifyAccessToken, verifyRefreshToken, rotateTokens, decodeToken, ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS, } from './jwt.js';
export { hashPassword, verifyPassword, validatePasswordStrength, isBcryptHash, } from './password.js';
export type { PasswordStrengthResult } from './password.js';
export { OAuthProvider, GoogleProvider, GitHubProvider, createProvider, } from './oauth.js';
export type { OAuthProviderConfig, AuthorizationResult, TokenResponse, } from './oauth.js';
export { createSession, validateSession, destroySession, destroySessionById, destroyAllUserSessions, refreshSession, listUserSessions, purgeExpiredSessions, } from './session.js';
export type { CreateSessionOptions } from './session.js';
export { extractBearerToken, extractSessionCookie, resolveAuth, requireAuth, optionalAuth, requireRole, hasRole, setSessionCookie, clearSessionCookie, authErrorResponse, withAuth, withRole, UnauthenticatedRedirect, SESSION_COOKIE_NAME, CSRF_COOKIE_NAME, } from './middleware.js';
export type { ResolvedAuth, SetSessionCookieOptions, } from './middleware.js';
//# sourceMappingURL=index.d.ts.map