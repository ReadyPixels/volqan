/**
 * @file database/migrations.ts
 * @description Utility to run Prisma migrations programmatically.
 *
 * Wraps the `prisma migrate` CLI commands so that migrations can be triggered
 * from application code (e.g. during automated deployment, first-boot setup,
 * or integration tests) without shelling out manually.
 *
 * @example
 * ```ts
 * import { runMigrations, getMigrationStatus } from '@volqan/core/database';
 *
 * // Apply all pending migrations
 * await runMigrations();
 *
 * // Check what is currently applied
 * const status = await getMigrationStatus();
 * console.log(status);
 * ```
 */
/**
 * Custom error thrown when a migration command fails.
 */
export declare class MigrationError extends Error {
    readonly args: string[];
    constructor(message: string, args: string[]);
}
/**
 * Migration status information returned by {@link getMigrationStatus}.
 */
export interface MigrationStatus {
    raw: string;
    hasPendingMigrations: boolean;
}
/**
 * Applies all pending migrations in production-safe mode (`migrate deploy`).
 *
 * This is the recommended command for CI/CD pipelines. It does **not**
 * create new migrations — use `prisma migrate dev` locally for that.
 *
 * @returns Raw stdout from prisma
 * @throws {MigrationError} if migrations fail
 */
export declare function runMigrations(): Promise<string>;
/**
 * Returns the current migration status by running `prisma migrate status`.
 *
 * @returns Parsed status object including whether pending migrations exist
 */
export declare function getMigrationStatus(): Promise<MigrationStatus>;
/**
 * Generates the Prisma client from the current schema.
 *
 * Useful when the schema changes programmatically (rare) or in build scripts.
 */
export declare function generateClient(): Promise<string>;
/**
 * Resets the database and re-runs all migrations. **Destructive in production.**
 *
 * Only available when `NODE_ENV` is `test` or `development`.
 *
 * @throws {Error} if called in a production environment
 */
export declare function resetDatabase(): Promise<string>;
//# sourceMappingURL=migrations.d.ts.map