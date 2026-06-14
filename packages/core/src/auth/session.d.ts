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
import type { AuthSession } from './types.js';
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
export declare function createSession(options: CreateSessionOptions): Promise<AuthSession>;
/**
 * Resolves a session token to a full {@link AuthSession}.
 *
 * @param token - The opaque session token from the cookie
 * @returns The validated session
 * @throws {@link AuthError} with SESSION_NOT_FOUND or SESSION_EXPIRED
 */
export declare function validateSession(token: string): Promise<AuthSession>;
/**
 * Destroys a session by token (logout).
 *
 * @param token - The session token to invalidate
 * @returns `true` if a session was deleted, `false` if it did not exist
 */
export declare function destroySession(token: string): Promise<boolean>;
/**
 * Destroys a session by its database ID.
 *
 * @param sessionId - The session's primary key
 */
export declare function destroySessionById(sessionId: string): Promise<boolean>;
/**
 * Destroys all sessions for a user (logout all devices).
 *
 * @param userId - The user's database ID
 * @returns Number of sessions destroyed
 */
export declare function destroyAllUserSessions(userId: string): Promise<number>;
/**
 * Extends an active session's expiry by resetting it from the current time.
 *
 * @param token - The session token to refresh
 * @param ttlSeconds - New TTL from now (default: 7 days)
 * @returns The updated {@link AuthSession}
 * @throws {@link AuthError} if the session is not found or already expired
 */
export declare function refreshSession(token: string, ttlSeconds?: number): Promise<AuthSession>;
/**
 * Lists all active sessions for a user.
 *
 * @param userId - The user's database ID
 * @returns Array of active {@link AuthSession} objects
 */
export declare function listUserSessions(userId: string): Promise<Array<Omit<AuthSession, 'user'>>>;
/**
 * Purges all expired sessions from the database.
 * Run this periodically (e.g. via a cron job) to keep the table clean.
 *
 * @returns Number of sessions deleted
 */
export declare function purgeExpiredSessions(): Promise<number>;
//# sourceMappingURL=session.d.ts.map