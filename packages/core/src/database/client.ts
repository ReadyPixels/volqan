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

// ---------------------------------------------------------------------------
// Type-safe global augmentation to persist the client across hot reloads
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  _volqanPrisma?: PrismaClient;
};

// ---------------------------------------------------------------------------
// Client factory
// ---------------------------------------------------------------------------

/**
 * Creates a new PrismaClient with sensible defaults.
 *
 * In production we use the default connection pool. In development or test
 * environments verbose query logging is enabled via the DEBUG_DB env flag.
 */
function createPrismaClient(): PrismaClient {
  const logLevels: Array<'query' | 'info' | 'warn' | 'error'> =
    process.env['DEBUG_DB'] === 'true'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'];

  return new PrismaClient({
    log: logLevels,
    errorFormat: process.env['NODE_ENV'] === 'production' ? 'minimal' : 'pretty',
  });
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/**
 * Shared Prisma database client.
 *
 * In development the client is attached to `globalThis` so Next.js hot-reloads
 * do not spin up a new connection pool on every file change. In production a
 * new instance is created once and module-level caching keeps it alive.
 */
export const db: PrismaClient =
  globalForPrisma._volqanPrisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma._volqanPrisma = db;
}

// ---------------------------------------------------------------------------
// Graceful shutdown helpers
// ---------------------------------------------------------------------------

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
export async function disconnectDb(): Promise<void> {
  await db.$disconnect();
}

/**
 * Re-connects a previously disconnected client. Rarely needed in practice as
 * Prisma lazy-connects on first query, but useful in test teardown/setup cycles.
 */
export async function connectDb(): Promise<void> {
  await db.$connect();
}

export default db;
