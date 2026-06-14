/**
 * @file database/client.ts
 * @description Prisma client singleton with connection pooling for the Volqan framework.
 *
 * Implements the global singleton pattern recommended by Prisma for Next.js /
 * any long-running Node.js process to avoid exhausting database connections
 * during development hot-reloads or in serverless environments.
 *
 * @example
 * ```ts
 * import { db } from '@volqan/core/database';
 *
 * const user = await db.user.findUnique({ where: { email: 'admin@volqan.link' } });
 * ```
 */
import { PrismaClient } from '@prisma/client';
/**
 * Shared Prisma database client.
 *
 * In development the client is attached to `globalThis` so Next.js hot-reloads
 * do not spin up a new connection pool on every file change. In production a
 * new instance is created once and module-level caching keeps it alive.
 */
export declare const db: PrismaClient;
/**
 * Disconnects the Prisma client cleanly. Call this during process shutdown to
 * ensure all in-flight queries are flushed and connections are returned.
 *
 * @example
 * ```ts
 * process.on('SIGTERM', async () => {
 *   await disconnectDb();
 *   process.exit(0);
 * });
 * ```
 */
export declare function disconnectDb(): Promise<void>;
/**
 * Re-connects a previously disconnected client. Rarely needed in practice as
 * Prisma lazy-connects on first query, but useful in test teardown/setup cycles.
 */
export declare function connectDb(): Promise<void>;
export default db;
//# sourceMappingURL=client.d.ts.map