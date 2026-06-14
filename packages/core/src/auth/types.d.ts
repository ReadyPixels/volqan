/**
 * @file auth/types.ts
 * @description Core type definitions for the Volqan authentication system.
 *
 * These types are shared across JWT, session, OAuth, and middleware modules.
 */
import type { UserRole } from '../database/index.js';
/**
 * Lightweight, serialisable representation of an authenticated user.
 * Embedded in JWTs and sessions — never contains sensitive fields.
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: UserRole;
    emailVerified: Date | null;
}
/**
 * A resolved authentication session including the user and metadata.
 */
export interface AuthSession {
    id: string;
    user: AuthUser;
    token: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}
/**
 * Payload accepted by the credentials (email/password) login flow.
 */
export interface LoginCredentials {
    email: string;
    password: string;
    /** Client IP for session creation; injected by middleware */
    ipAddress?: string;
    /** Raw User-Agent header string */
    userAgent?: string;
}
/**
 * Payload accepted by the registration flow.
 */
export interface RegisterData {
    email: string;
    password: string;
    name?: string;
    /** Optional invitation token for restricted registration */
    inviteToken?: string;
}
/**
 * Supported OAuth provider identifiers.
 */
export type OAuthProviderName = 'google' | 'github';
/**
 * Normalised user profile returned from any OAuth provider.
 * Consumers should not depend on provider-specific raw response shapes.
 */
export interface OAuthProfile {
    provider: OAuthProviderName;
    /** Stable provider-issued user ID */
    providerAccountId: string;
    email: string;
    name: string | null;
    avatar: string | null;
    /** Raw access token returned by the provider token endpoint */
    accessToken: string;
    refreshToken: string | null;
    /** Unix timestamp (seconds) when the access token expires */
    expiresAt: number | null;
    /** Raw profile data from the provider (provider-specific shape) */
    raw: Record<string, unknown>;
}
/**
 * Claims embedded in a signed JWT access token.
 */
export interface TokenPayload {
    /** Subject — the user's database ID */
    sub: string;
    /** User email for quick lookups without a DB round-trip */
    email: string;
    /** Role at time of token issuance */
    role: UserRole;
    /** Session ID this token was issued for */
    sessionId: string;
    /** Standard JWT issued-at timestamp (seconds since epoch) */
    iat?: number;
    /** Standard JWT expiration timestamp (seconds since epoch) */
    exp?: number;
    /** JWT ID — random value allowing single-use invalidation if needed */
    jti?: string;
}
/**
 * A pair of access + refresh tokens returned after successful authentication.
 */
export interface TokenPair {
    /** Short-lived token (15 minutes) sent in Authorization header */
    accessToken: string;
    /** Long-lived token (7 days) used only to obtain a new access token */
    refreshToken: string;
    /** Unix timestamp when the access token expires */
    accessTokenExpiresAt: number;
    /** Unix timestamp when the refresh token expires */
    refreshTokenExpiresAt: number;
}
/**
 * Discriminated error type for authentication failures.
 * Allows callers to handle specific error conditions without string comparison.
 */
export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_DISABLED' | 'SESSION_EXPIRED' | 'SESSION_NOT_FOUND' | 'TOKEN_INVALID' | 'TOKEN_EXPIRED' | 'EMAIL_ALREADY_EXISTS' | 'OAUTH_ERROR' | 'INSUFFICIENT_PERMISSIONS';
/**
 * Structured error thrown by auth operations.
 */
export declare class AuthError extends Error {
    readonly code: AuthErrorCode;
    readonly statusCode: number;
    constructor(code: AuthErrorCode, message: string, statusCode?: number);
}
//# sourceMappingURL=types.d.ts.map