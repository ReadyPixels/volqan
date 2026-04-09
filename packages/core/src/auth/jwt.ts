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

import { randomUUID } from 'node:crypto';
import type { TokenPayload, TokenPair } from './types.js';
import { AuthError } from './types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Access token lifetime in seconds (15 minutes) */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

/** Refresh token lifetime in seconds (7 days) */
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Algorithm used for all JWTs */
const JWT_ALGORITHM = 'HS256';

// ---------------------------------------------------------------------------
// Secret management
// ---------------------------------------------------------------------------

/**
 * Retrieves and validates the JWT secret from the environment.
 *
 * @throws {Error} if JWT_SECRET is missing or too short in production
 */
function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];

  if (!secret) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error(
        '[volqan:jwt] JWT_SECRET environment variable is required in production.',
      );
    }
    // Development fallback — NOT safe for production
    console.warn(
      '[volqan:jwt] ⚠  JWT_SECRET is not set — using insecure development fallback.',
    );
    return 'volqan.link-secret-do-not-use-in-production-please-set-jwt-secret';
  }

  if (process.env['NODE_ENV'] === 'production' && secret.length < 32) {
    throw new Error(
      '[volqan:jwt] JWT_SECRET must be at least 32 characters long.',
    );
  }

  return secret;
}

// ---------------------------------------------------------------------------
// Lazy-loaded jsonwebtoken
// ---------------------------------------------------------------------------

type JwtModule = typeof import('jsonwebtoken');

let _jwt: JwtModule | null = null;

async function getJwt(): Promise<JwtModule> {
  if (_jwt) return _jwt;
  try {
    _jwt = await import('jsonwebtoken');
    return _jwt;
  } catch {
    throw new Error(
      '[volqan:jwt] jsonwebtoken is not installed. Run: pnpm add jsonwebtoken',
    );
  }
}

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

/**
 * Signs a payload as a JWT string.
 *
 * @param payload - Claims to embed (must not include iat/exp — set via expiresIn)
 * @param expiresIn - Seconds until expiration
 * @returns Signed JWT string
 */
async function signToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  expiresIn: number,
): Promise<string> {
  const jwt = await getJwt();
  const secret = getJwtSecret();

  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn },
      (err, token) => {
        if (err || !token) {
          reject(new Error(`[volqan:jwt] Failed to sign token: ${err?.message}`));
        } else {
          resolve(token);
        }
      },
    );
  });
}

/**
 * Generates a matched access + refresh token pair for the given payload.
 *
 * @param payload - Core claims: sub (user ID), email, role, sessionId
 * @returns {@link TokenPair} with both tokens and their expiry timestamps
 */
export async function generateTokenPair(
  payload: Omit<TokenPayload, 'iat' | 'exp' | 'jti'>,
): Promise<TokenPair> {
  const now = Math.floor(Date.now() / 1000);
  const jti = randomUUID();

  const [accessToken, refreshToken] = await Promise.all([
    signToken({ ...payload, jti }, ACCESS_TOKEN_TTL_SECONDS),
    signToken({ ...payload, jti: randomUUID() }, REFRESH_TOKEN_TTL_SECONDS),
  ]);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL_SECONDS,
  };
}

// ---------------------------------------------------------------------------
// Token verification
// ---------------------------------------------------------------------------

/**
 * Verifies a JWT and returns its decoded payload.
 *
 * @param token - Raw JWT string
 * @returns Decoded {@link TokenPayload}
 * @throws {@link AuthError} with code TOKEN_EXPIRED or TOKEN_INVALID
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const jwt = await getJwt();
  const secret = getJwtSecret();

  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] }, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          reject(new AuthError('TOKEN_EXPIRED', 'Access token has expired.'));
        } else {
          reject(new AuthError('TOKEN_INVALID', `Invalid token: ${err.message}`));
        }
        return;
      }
      resolve(decoded as TokenPayload);
    });
  });
}

/**
 * Alias for {@link verifyToken} — verifies a short-lived access token.
 */
export const verifyAccessToken = verifyToken;

/**
 * Alias for {@link verifyToken} — verifies a long-lived refresh token.
 *
 * Note: refresh tokens use the same secret but are semantically different;
 * callers should enforce that a refresh token is only accepted at the
 * /auth/refresh endpoint.
 */
export const verifyRefreshToken = verifyToken;

// ---------------------------------------------------------------------------
// Token rotation
// ---------------------------------------------------------------------------

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
export async function rotateTokens(refreshToken: string): Promise<{
  tokens: TokenPair;
  payload: TokenPayload;
}> {
  const payload = await verifyRefreshToken(refreshToken);

  const newTokens = await generateTokenPair({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId,
  });

  return { tokens: newTokens, payload };
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Decodes a JWT without verifying the signature.
 *
 * **WARNING:** Never use this for authentication. Only use for debugging or
 * reading non-sensitive claims from a token you already trust.
 *
 * @param token - Raw JWT string
 * @returns Decoded payload or null if the token is malformed
 */
export async function decodeToken(token: string): Promise<TokenPayload | null> {
  const jwt = await getJwt();
  const decoded = jwt.decode(token);
  return decoded as TokenPayload | null;
}
