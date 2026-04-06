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

import { db } from './client.js';
import { randomUUID } from 'node:crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_ADMIN_EMAIL = 'admin@volqan.link';
const DEFAULT_ADMIN_PASSWORD = 'changeme'; // must be changed post-installation
const DEFAULT_ADMIN_NAME = 'Volqan Admin';

// ---------------------------------------------------------------------------
// Hash helper (bcrypt-compatible, no runtime dep in seed)
// ---------------------------------------------------------------------------

/**
 * Hashes a password using the bcrypt algorithm.
 * We import bcryptjs lazily so the seed can be run in Node.js directly
 * without importing the entire auth module.
 */
async function hashPassword(plain: string): Promise<string> {
  // Dynamic import avoids bundling bcryptjs into the core module at build time.
  // If bcryptjs is not installed the seed will fail with a clear error.
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(plain, 12);
  } catch {
    // Fallback: warn loudly and use a clearly unsafe marker so seeded data is
    // never accepted in production without the real library present.
    console.error(
      '[volqan:seed] bcryptjs not found — password will NOT be usable. ' +
        'Install bcryptjs: pnpm add bcryptjs',
    );
    return `UNHASHED:${plain}`;
  }
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

/**
 * Creates the default SUPER_ADMIN user if one does not already exist.
 */
async function seedSuperAdmin(): Promise<void> {
  const existing = await db.user.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL },
  });

  if (existing) {
    console.info(
      `[volqan:seed] Super admin already exists (${DEFAULT_ADMIN_EMAIL}) — skipping.`,
    );
    return;
  }

  const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

  const user = await db.user.create({
    data: {
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      name: DEFAULT_ADMIN_NAME,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  console.info(`[volqan:seed] Created super admin: ${user.email} (id: ${user.id})`);
  console.warn(
    `[volqan:seed] ⚠  Default password is "${DEFAULT_ADMIN_PASSWORD}". ` +
      'Change it immediately after first login!',
  );
}

/**
 * Creates the initial installation record if one does not already exist.
 */
async function seedInstallation(): Promise<void> {
  const count = await db.installation.count();

  if (count > 0) {
    console.info('[volqan:seed] Installation record already exists — skipping.');
    return;
  }

  const installation = await db.installation.create({
    data: {
      installationId: randomUUID(),
      plan: 'community',
    },
  });

  console.info(
    `[volqan:seed] Created installation record (id: ${installation.installationId})`,
  );
}

/**
 * Seeds default application settings.
 */
async function seedDefaultSettings(): Promise<void> {
  const defaults: Array<{
    key: string;
    value: unknown;
    group: string;
    isPublic: boolean;
  }> = [
    { key: 'site.name', value: 'My Volqan Site', group: 'general', isPublic: true },
    { key: 'site.description', value: '', group: 'general', isPublic: true },
    { key: 'site.url', value: 'http://localhost:3000', group: 'general', isPublic: true },
    { key: 'site.logo', value: null, group: 'general', isPublic: true },
    { key: 'auth.allowRegistration', value: false, group: 'auth', isPublic: false },
    { key: 'auth.requireEmailVerification', value: false, group: 'auth', isPublic: false },
    { key: 'media.maxFileSizeMb', value: 50, group: 'media', isPublic: false },
    { key: 'media.allowedMimeTypes', value: ['image/*', 'video/*', 'application/pdf'], group: 'media', isPublic: false },
  ];

  for (const setting of defaults) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value as any,
        group: setting.group,
        isPublic: setting.isPublic,
      },
    });
  }

  console.info(`[volqan:seed] Upserted ${defaults.length} default settings.`);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Runs the complete seed sequence. Safe to call multiple times (idempotent).
 *
 * @throws {Error} if any seed step fails
 */
export async function seed(): Promise<void> {
  console.info('[volqan:seed] Starting database seed…');

  try {
    await seedInstallation();
    await seedSuperAdmin();
    await seedDefaultSettings();
    console.info('[volqan:seed] Seed complete.');
  } catch (err) {
    console.error('[volqan:seed] Seed failed:', err);
    throw err;
  } finally {
    await db.$disconnect();
  }
}

// ---------------------------------------------------------------------------
// CLI entry point (when run directly)
// ---------------------------------------------------------------------------

// Detect if this file is the main entry point
const isMain =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'));

if (isMain) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
