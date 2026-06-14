/**
 * @file auth/jwt.ts
 * @description JWT token generation, verification, and rotation for Volqan.
 *
 * Issues two token types:
 * - **Access token** — short-lived (15 minutes), sent in Authorization header
 * - **Refresh token** — long-lived (7 days), stored in httpOnly cookie,
 *   used only to obtain a new access token pair
 *
 * Both tokens are signed with HS256 using the secret from env("JWT_SECRET").
 *
 * @example
 * ```ts
 * import { generateTokenPair, verifyAccessToken } from '@volqan/core/auth';
 *
 * const tokens = await generateTokenPair({ sub: user.id, email: user.email, role: user.role, sessionId });
 * const payload = await verifyAccessToken(tokens.accessToken);
 * ```
 */
import type { TokenPayload, TokenPair } from './types.js';
/** Access token lifetime in seconds (15 minutes) */
export declare const ACCESS_TOKEN_TTL_SECONDS: number;
/** Refresh token lifetime in seconds (7 days) */
export declare const REFRESH_TOKEN_TTL_SECONDS: number;
/**
 * Generates a matched access + refresh token pair for the given payload.
 *
 * @param payload - Core claims: sub (user ID), email, role, sessionId
 * @returns {@link TokenPair} with both tokens and their expiry timestamps
 */
export declare function generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp' | 'jti'>): Promise<TokenPair>;
/**
 * Verifies a JWT and returns its decoded payload.
 *
 * @param token - Raw JWT string
 * @returns Decoded {@link TokenPayload}
 * @throws {@link AuthError} with code TOKEN_EXPIRED or TOKEN_INVALID
 */
export declare function verifyToken(token: string): Promise<TokenPayload>;
/**
 * Alias for {@link verifyToken} — verifies a short-lived access token.
 */
export declare const verifyAccessToken: typeof verifyToken;
/**
 * Alias for {@link verifyToken} — verifies a long-lived refresh token.
 *
 * Note: refresh tokens use the same secret but are semantically different;
 * callers should enforce that a refresh token is only accepted at the
 * /auth/refresh endpoint.
 */
export declare const verifyRefreshToken: typeof verifyToken;
/**
 * Rotates a token pair by verifying the refresh token and issuing a new pair.
 *
 * The caller is responsible for:
 * 1. Invalidating the old session / refresh token in the database
 * 2. Storing the new tokens in appropriate storage
 *
 * @param refreshToken - The existing refresh token to rotate
 * @returns A new {@link TokenPair}
 * @throws {@link AuthError} if the refresh token is invalid or expired
 */
export declare function rotateTokens(refreshToken: string): Promise<{
    tokens: TokenPair;
    payload: TokenPayload;
}>;
/**
 * Decodes a JWT without verifying the signature.
 *
 * **WARNING:** Never use this for authentication. Only use for debugging or
 * reading non-sensitive claims from a token you already trust.
 *
 * @param token - Raw JWT string
 * @returns Decoded payload or null if the token is malformed
 */
export declare function decodeToken(token: string): Promise<TokenPayload | null>;
//# sourceMappingURL=jwt.d.ts.map