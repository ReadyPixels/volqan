/**
 * @file database/seed.ts
 * @description Seed script for the Volqan database.
 *
 * Creates the default super-admin user, initial installation record, and
 * default settings required for a fresh Volqan instance to function.
 *
 * Run via:
 *   npx ts-node -r tsconfig-paths/register src/database/seed.ts
 * or add "seed" to prisma.seed in package.json:
 *   "prisma": { "seed": "ts-node src/database/seed.ts" }
 *
 * @example
 * ```ts
 * import { seed } from '@volqan/core/database';
 * await seed(); // idempotent — safe to call multiple times
 * ```
 */
/**
 * Runs the complete seed sequence. Safe to call multiple times (idempotent).
 *
 * @throws {Error} if any seed step fails
 */
export declare function seed(): Promise<void>;
//# sourceMappingURL=seed.d.ts.map