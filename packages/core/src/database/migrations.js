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
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
const execFileAsync = promisify(execFile);
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
/**
 * Resolves the path to the local prisma binary inside node_modules.
 */
function getPrismaBin() {
    // In a standard pnpm monorepo the binary is hoisted; fall back to local if not.
    try {
        return require.resolve('prisma/build/index.js');
    }
    catch {
        return 'prisma'; // assumes it is in PATH
    }
}
/**
 * Runs a Prisma CLI command with the provided arguments.
 *
 * @param args - Arguments to pass to the prisma CLI
 * @returns stdout from the command
 * @throws {MigrationError} if the CLI exits with a non-zero code
 */
async function runPrismaCommand(args) {
    const schemaPath = resolve(process.cwd(), 'prisma', 'schema.prisma');
    const env = {
        ...process.env,
        DATABASE_URL: process.env['DATABASE_URL'] ?? '',
    };
    try {
        const prismaBin = getPrismaBin();
        const { stdout, stderr } = await execFileAsync('node', [prismaBin, ...args, '--schema', schemaPath], { env, timeout: 60_000 });
        // Prisma sometimes writes informational messages to stderr
        if (stderr && process.env['NODE_ENV'] !== 'production') {
            console.warn('[volqan:migrations]', stderr.trim());
        }
        return stdout;
    }
    catch (err) {
        const message = err instanceof Error
            ? err.message
            : 'Unknown error running prisma command';
        throw new MigrationError(`Prisma command failed: ${message}`, args);
    }
}
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Custom error thrown when a migration command fails.
 */
export class MigrationError extends Error {
    args;
    constructor(message, args) {
        super(message);
        this.name = 'MigrationError';
        this.args = args;
    }
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
export async function runMigrations() {
    console.info('[volqan:migrations] Running prisma migrate deploy…');
    const output = await runPrismaCommand(['migrate', 'deploy']);
    console.info('[volqan:migrations] Migrations complete.');
    return output;
}
/**
 * Returns the current migration status by running `prisma migrate status`.
 *
 * @returns Parsed status object including whether pending migrations exist
 */
export async function getMigrationStatus() {
    const raw = await runPrismaCommand(['migrate', 'status']);
    const hasPendingMigrations = raw.includes('have not yet been applied') ||
        raw.includes('pending migration');
    return { raw, hasPendingMigrations };
}
/**
 * Generates the Prisma client from the current schema.
 *
 * Useful when the schema changes programmatically (rare) or in build scripts.
 */
export async function generateClient() {
    console.info('[volqan:migrations] Running prisma generate…');
    return runPrismaCommand(['generate']);
}
/**
 * Resets the database and re-runs all migrations. **Destructive in production.**
 *
 * Only available when `NODE_ENV` is `test` or `development`.
 *
 * @throws {Error} if called in a production environment
 */
export async function resetDatabase() {
    if (process.env['NODE_ENV'] === 'production') {
        throw new Error('resetDatabase() must not be called in production.');
    }
    console.warn('[volqan:migrations] ⚠  Resetting database — all data will be lost!');
    return runPrismaCommand(['migrate', 'reset', '--force', '--skip-seed']);
}
//# sourceMappingURL=migrations.js.map