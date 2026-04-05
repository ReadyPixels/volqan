/**
 * @file auth/session.ts
 * @description Database-backed session management for Volqan.
 *
 * Sessions are stored in the `sessions` table with an opaque token.
 * The session token is sent as a secure httpOnly cookie on the client.
 *
 * API:
 * - {@link createSession} — create a new session after login
 * - {@link validateSession} — resolve a session token to a full session
 * - {@link destroySession} — logout / invalidate a session
 * - {@link refreshSession} — extend an active session's expiry
 * - {@link destroyAllUserSessions} — logout all devices
 *
 * @example
 * ```ts
 * import { createSession, validateSession, destroySession } from '@volqan/core/auth';
 *
 * // Login
 * const session = await createSession({ userId: user.id, ipAddress, userAgent });
 *
 * // On subsequent requests
 * const { user, session } = await validateSession(token);
 *
 * // Logout
 * await destroySession(token);
 * ```
 */

import { randomBytes } from 'node:crypto';
import { db } from '../database/client.js';
import type { AuthSession, AuthUser } from './types.js';
import { AuthError } from './types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Session token byte length — 48 bytes → 96-char hex string */
const TOKEN_BYTES = 48;

/** Default session duration: 7 days in seconds */
const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically secure random session token.
 */
function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * Computes an expiry date from now.
 *
 * @param ttlSeconds - Number of seconds from now
 */
function expiresFromNow(ttlSeconds: number): Date {
  return new Date(Date.now() + ttlSeconds * 1000);
}

/**
 * Maps a Prisma User + Session record to an {@link AuthSession}.
 */
function mapToAuthSession(
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    user: {
      id: string;
      email: string;
      name: string | null;
      avatar: string | null;
      role: import('../database/index.js').UserRole;
      emailVerified: Date | null;
    };
  },
): AuthSession {
  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    avatar: session.user.avatar,
    role: session.user.role,
    emailVerified: session.user.emailVerified,
  };

  return {
    id: session.id,
    user,
    token: session.token,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Session creation
// ---------------------------------------------------------------------------

/**
 * Options for creating a new session.
 */
export interface CreateSessionOptions {
  userId: string;
  /** Client IP address for security auditing */
  ipAddress?: string;
  /** User-Agent header string */
  userAgent?: string;
  /** Session TTL in seconds (default: 7 days) */
  ttlSeconds?: number;
}

/**
 * Creates a new database session for the given user.
 *
 * @returns The created {@link AuthSession}
 * @throws {AuthError} if the user does not exist
 */
export async function createSession(
  options: CreateSessionOptions,
): Promise<AuthSession> {
  const {
    userId,
    ipAddress = null,
    userAgent = null,
    ttlSeconds = DEFAULT_SESSION_TTL_SECONDS,
  } = options;

  const token = generateSessionToken();
  const expiresAt = expiresFromNow(ttlSeconds);

  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
        },
      },
    },
  });

  return mapToAuthSession(session);
}

// ---------------------------------------------------------------------------
// Session validation
// ---------------------------------------------------------------------------

/**
 * Resolves a session token to a full {@link AuthSession}.
 *
 * @param token - The opaque session token from the cookie
 * @returns The validated session
 * @throws {@link AuthError} with SESSION_NOT_FOUND or SESSION_EXPIRED
 */
export async function validateSession(token: string): Promise<AuthSession> {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
        },
      },
    },
  });

  if (!session) {
    throw new AuthError('SESSION_NOT_FOUND', 'Session not found.');
  }

  if (session.expiresAt < new Date()) {
    // Clean up the expired session asynchronously
    db.session.delete({ where: { id: session.id } }).catch(() => null);
    throw new AuthError('SESSION_EXPIRED', 'Session has expired. Please log in again.');
  }

  return mapToAuthSession(session);
}

// ---------------------------------------------------------------------------
// Session destruction
// ---------------------------------------------------------------------------

/**
 * Destroys a session by token (logout).
 *
 * @param token - The session token to invalidate
 * @returns `true` if a session was deleted, `false` if it did not exist
 */
export async function destroySession(token: string): Promise<boolean> {
  try {
    await db.session.delete({ where: { token } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Destroys a session by its database ID.
 *
 * @param sessionId - The session's primary key
 */
export async function destroySessionById(sessionId: string): Promise<boolean> {
  try {
    await db.session.delete({ where: { id: sessionId } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Destroys all sessions for a user (logout all devices).
 *
 * @param userId - The user's database ID
 * @returns Number of sessions destroyed
 */
export async function destroyAllUserSessions(userId: string): Promise<number> {
  const result = await db.session.deleteMany({ where: { userId } });
  return result.count;
}

// ---------------------------------------------------------------------------
// Session refresh
// ---------------------------------------------------------------------------

/**
 * Extends an active session's expiry by resetting it from the current time.
 *
 * @param token - The session token to refresh
 * @param ttlSeconds - New TTL from now (default: 7 days)
 * @returns The updated {@link AuthSession}
 * @throws {@link AuthError} if the session is not found or already expired
 */
export async function refreshSession(
  token: string,
  ttlSeconds = DEFAULT_SESSION_TTL_SECONDS,
): Promise<AuthSession> {
  // First validate the existing session
  await validateSession(token);

  const expiresAt = expiresFromNow(ttlSeconds);

  const updated = await db.session.update({
    where: { token },
    data: { expiresAt },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
        },
      },
    },
  });

  return mapToAuthSession(updated);
}

// ---------------------------------------------------------------------------
// Utility queries
// ---------------------------------------------------------------------------

/**
 * Lists all active sessions for a user.
 *
 * @param userId - The user's database ID
 * @returns Array of active {@link AuthSession} objects
 */
export async function listUserSessions(
  userId: string,
): Promise<Array<Omit<AuthSession, 'user'>>> {
  const now = new Date();
  const sessions = await db.session.findMany({
    where: {
      userId,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((s: any) => ({
    id: s.id,
    token: s.token,
    expiresAt: s.expiresAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    createdAt: s.createdAt,
  }));
}

/**
 * Purges all expired sessions from the database.
 * Run this periodically (e.g. via a cron job) to keep the table clean.
 *
 * @returns Number of sessions deleted
 */
export async function purgeExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
