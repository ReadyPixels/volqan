/**
 * @file config/loader.ts
 * @description Configuration loader for the Volqan framework.
 *
 * Resolution order (later sources win):
 * 1. Built-in defaults ({@link DEFAULT_CONFIG})
 * 2. `volqan.config.ts` / `volqan.config.js` in the project root
 * 3. Environment variable overrides (see below)
 *
 * Supported environment variable overrides:
 * | Env var                         | Config path                       |
 * |---------------------------------|-----------------------------------|
 * | DATABASE_URL                    | database.url                      |
 * | DATABASE_PROVIDER               | database.provider                 |
 * | JWT_SECRET                      | auth.jwtSecret                    |
 * | SESSION_DURATION                | auth.sessionDuration (seconds)    |
 * | ALLOW_REGISTRATION              | auth.allowRegistration            |
 * | REQUIRE_EMAIL_VERIFICATION      | auth.requireEmailVerification     |
 * | GOOGLE_CLIENT_ID                | auth.oauth.google.clientId        |
 * | GOOGLE_CLIENT_SECRET            | auth.oauth.google.clientSecret    |
 * | GOOGLE_REDIRECT_URI             | auth.oauth.google.redirectUri     |
 * | GITHUB_CLIENT_ID                | auth.oauth.github.clientId        |
 * | GITHUB_CLIENT_SECRET            | auth.oauth.github.clientSecret    |
 * | GITHUB_REDIRECT_URI             | auth.oauth.github.redirectUri     |
 * | PORT                            | server.port                       |
 * | HOST                            | server.host                       |
 * | CORS_ORIGINS                    | server.cors.origins (CSV)         |
 * | STORAGE_PROVIDER                | storage.provider                  |
 * | UPLOAD_DIR                      | storage.local.path                |
 * | UPLOAD_PUBLIC_URL               | storage.local.publicUrl           |
 * | MAX_FILE_SIZE_MB                | storage.maxFileSizeBytes          |
 * | S3_BUCKET                       | storage.s3.bucket                 |
 * | S3_REGION                       | storage.s3.region                 |
 * | S3_ACCESS_KEY_ID                | storage.s3.accessKeyId            |
 * | S3_SECRET_ACCESS_KEY            | storage.s3.secretAccessKey        |
 * | S3_ENDPOINT                     | storage.s3.endpoint               |
 * | S3_CDN_URL                      | storage.s3.cdnUrl                 |
 * | SMTP_HOST                       | email.host                        |
 * | SMTP_PORT                       | email.port                        |
 * | SMTP_SECURE                     | email.secure                      |
 * | SMTP_USER                       | email.auth.user                   |
 * | SMTP_PASS                       | email.auth.pass                   |
 * | EMAIL_FROM                      | email.from                        |
 * | EXTENSIONS_DIR                  | extensions.directory              |
 * | THEMES_DIR                      | themes.directory                  |
 *
 * @example
 * ```ts
 * import { loadConfig, getConfig } from '@volqan/core/config';
 *
 * // Boot once at application startup
 * await loadConfig();
 *
 * // Access anywhere in the app
 * const config = getConfig();
 * console.log(config.database.url);
 * ```
 */

import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { DEFAULT_CONFIG } from './defaults.js';
import type { VolqanConfig, PartialVolqanConfig } from './types.js';

// ---------------------------------------------------------------------------
// Deep merge utility
// ---------------------------------------------------------------------------

type AnyObject = Record<string, unknown>;

/**
 * Deep-merges `source` into `target`. Arrays are replaced (not merged).
 */
function deepMerge<T extends AnyObject>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      sourceVal !== undefined &&
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as AnyObject,
        sourceVal as AnyObject,
      ) as T[typeof key];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[typeof key];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Config file loader
// ---------------------------------------------------------------------------

/**
 * Attempts to load `volqan.config.ts` or `volqan.config.js` from the CWD.
 * Returns an empty object if no config file is found.
 */
async function loadConfigFile(): Promise<PartialVolqanConfig> {
  const candidates = [
    resolve(process.cwd(), 'volqan.config.ts'),
    resolve(process.cwd(), 'volqan.config.js'),
    resolve(process.cwd(), 'volqan.config.mjs'),
    resolve(process.cwd(), 'volqan.config.cjs'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        const mod = await import(candidate) as {
          default?: PartialVolqanConfig;
          config?: PartialVolqanConfig;
        };
        const config = mod.default ?? mod.config ?? {};
        console.info(`[volqan:config] Loaded config from: ${candidate}`);
        return config;
      } catch (err) {
        console.warn(
          `[volqan:config] Failed to load config file at ${candidate}:`,
          err,
        );
      }
    }
  }

  return {};
}

// ---------------------------------------------------------------------------
// Environment variable overrides
// ---------------------------------------------------------------------------

/**
 * Reads well-known environment variables and returns a partial config object.
 */
function loadEnvOverrides(): PartialVolqanConfig {
  const env = process.env;
  const override: PartialVolqanConfig = {};

  // ── Database ──────────────────────────────────────────────────────────────
  if (env['DATABASE_URL']) {
    override.database = { ...override.database, url: env['DATABASE_URL'] };
  }
  if (env['DATABASE_PROVIDER']) {
    override.database = {
      ...override.database,
      provider: env['DATABASE_PROVIDER'] as VolqanConfig['database']['provider'],
    };
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (env['JWT_SECRET']) {
    override.auth = { ...override.auth, jwtSecret: env['JWT_SECRET'] };
  }
  if (env['SESSION_DURATION']) {
    override.auth = {
      ...override.auth,
      sessionDuration: parseInt(env['SESSION_DURATION'], 10),
    };
  }
  if (env['ALLOW_REGISTRATION']) {
    override.auth = {
      ...override.auth,
      allowRegistration: env['ALLOW_REGISTRATION'] === 'true',
    };
  }
  if (env['REQUIRE_EMAIL_VERIFICATION']) {
    override.auth = {
      ...override.auth,
      requireEmailVerification: env['REQUIRE_EMAIL_VERIFICATION'] === 'true',
    };
  }

  // ── OAuth — Google ────────────────────────────────────────────────────────
  if (env['GOOGLE_CLIENT_ID'] && env['GOOGLE_CLIENT_SECRET']) {
    override.auth = {
      ...override.auth,
      oauth: {
        ...override.auth?.oauth,
        google: {
          clientId: env['GOOGLE_CLIENT_ID'],
          clientSecret: env['GOOGLE_CLIENT_SECRET'],
          redirectUri: env['GOOGLE_REDIRECT_URI'] ?? '/auth/callback/google',
        },
      },
    };
  }

  // ── OAuth — GitHub ────────────────────────────────────────────────────────
  if (env['GITHUB_CLIENT_ID'] && env['GITHUB_CLIENT_SECRET']) {
    override.auth = {
      ...override.auth,
      oauth: {
        ...override.auth?.oauth,
        github: {
          clientId: env['GITHUB_CLIENT_ID'],
          clientSecret: env['GITHUB_CLIENT_SECRET'],
          redirectUri: env['GITHUB_REDIRECT_URI'] ?? '/auth/callback/github',
        },
      },
    };
  }

  // ── Server ────────────────────────────────────────────────────────────────
  if (env['PORT']) {
    override.server = { ...override.server, port: parseInt(env['PORT'], 10) };
  }
  if (env['HOST']) {
    override.server = { ...override.server, host: env['HOST'] };
  }
  if (env['CORS_ORIGINS']) {
    override.server = {
      ...override.server,
      cors: {
        ...override.server?.cors,
        origins: env['CORS_ORIGINS'].split(',').map((o) => o.trim()),
      },
    };
  }

  // ── Storage ───────────────────────────────────────────────────────────────
  if (env['STORAGE_PROVIDER']) {
    override.storage = {
      ...override.storage,
      provider: env['STORAGE_PROVIDER'] as VolqanConfig['storage']['provider'],
    };
  }
  if (env['UPLOAD_DIR']) {
    override.storage = {
      ...override.storage,
      local: { ...override.storage?.local, path: env['UPLOAD_DIR'] } as VolqanConfig['storage']['local'],
    };
  }
  if (env['UPLOAD_PUBLIC_URL']) {
    override.storage = {
      ...override.storage,
      local: { ...override.storage?.local, publicUrl: env['UPLOAD_PUBLIC_URL'] } as VolqanConfig['storage']['local'],
    };
  }
  if (env['MAX_FILE_SIZE_MB']) {
    override.storage = {
      ...override.storage,
      maxFileSizeBytes: parseInt(env['MAX_FILE_SIZE_MB'], 10) * 1024 * 1024,
    };
  }
  if (env['S3_BUCKET']) {
    override.storage = {
      ...override.storage,
      s3: {
        bucket: env['S3_BUCKET'] ?? '',
        region: env['S3_REGION'] ?? 'us-east-1',
        accessKeyId: env['S3_ACCESS_KEY_ID'] ?? '',
        secretAccessKey: env['S3_SECRET_ACCESS_KEY'] ?? '',
        endpoint: env['S3_ENDPOINT'],
        cdnUrl: env['S3_CDN_URL'],
      },
    };
  }

  // ── Email ─────────────────────────────────────────────────────────────────
  if (env['SMTP_HOST']) {
    override.email = { ...override.email, host: env['SMTP_HOST'] };
  }
  if (env['SMTP_PORT']) {
    override.email = {
      ...override.email,
      port: parseInt(env['SMTP_PORT'], 10),
    };
  }
  if (env['SMTP_SECURE']) {
    override.email = {
      ...override.email,
      secure: env['SMTP_SECURE'] === 'true',
    };
  }
  if (env['SMTP_USER'] && env['SMTP_PASS']) {
    override.email = {
      ...override.email,
      auth: { user: env['SMTP_USER'], pass: env['SMTP_PASS'] },
    };
  }
  if (env['EMAIL_FROM']) {
    override.email = { ...override.email, from: env['EMAIL_FROM'] };
  }

  // ── Extensions / Themes ───────────────────────────────────────────────────
  if (env['EXTENSIONS_DIR']) {
    override.extensions = { ...override.extensions, directory: env['EXTENSIONS_DIR'] };
  }
  if (env['THEMES_DIR']) {
    override.themes = { ...override.themes, directory: env['THEMES_DIR'] };
  }

  return override;
}

// ---------------------------------------------------------------------------
// Config store
// ---------------------------------------------------------------------------

let _resolvedConfig: VolqanConfig | null = null;

/**
 * Returns the currently resolved config.
 *
 * @throws {Error} if {@link loadConfig} has not been called yet
 */
export function getConfig(): VolqanConfig {
  if (!_resolvedConfig) {
    throw new Error(
      '[volqan:config] Configuration has not been loaded yet. ' +
        'Call `await loadConfig()` at application startup.',
    );
  }
  return _resolvedConfig;
}

/**
 * Loads, merges, and validates the full configuration.
 *
 * Call once at application startup (e.g. in `instrumentation.ts` or
 * the root `layout.tsx`). Subsequent calls return the cached config.
 *
 * @param overrides - Optional programmatic overrides (highest priority)
 * @returns The resolved {@link VolqanConfig}
 */
export async function loadConfig(
  overrides?: PartialVolqanConfig,
): Promise<VolqanConfig> {
  if (_resolvedConfig && !overrides) {
    return _resolvedConfig;
  }

  // 1. Start with defaults
  let config: VolqanConfig = { ...DEFAULT_CONFIG };

  // 2. Merge config file
  const fileConfig = await loadConfigFile();
  config = deepMerge(config as any, fileConfig as any) as unknown as VolqanConfig;

  // 3. Merge env var overrides
  const envOverrides = loadEnvOverrides();
  config = deepMerge(config as any, envOverrides as any) as unknown as VolqanConfig;

  // 4. Merge programmatic overrides (highest priority)
  if (overrides) {
    config = deepMerge(config as any, overrides as any) as unknown as VolqanConfig;
  }

  // 5. Validate
  validateConfig(config);

  _resolvedConfig = config;
  return config;
}

/**
 * Resets the config cache. Useful for testing.
 */
export function resetConfig(): void {
  _resolvedConfig = null;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates the resolved config and throws descriptive errors for common
 * misconfigurations.
 */
function validateConfig(config: VolqanConfig): void {
  if (process.env['NODE_ENV'] === 'production') {
    if (
      config.auth.jwtSecret ===
      'volqan-insecure-dev-secret-please-set-JWT_SECRET'
    ) {
      throw new Error(
        '[volqan:config] JWT_SECRET must be set in production. ' +
          'Set the JWT_SECRET environment variable or auth.jwtSecret in volqan.config.ts.',
      );
    }

    if (config.auth.jwtSecret.length < 32) {
      throw new Error(
        '[volqan:config] auth.jwtSecret must be at least 32 characters in production.',
      );
    }
  }

  if (!config.database.url) {
    throw new Error(
      '[volqan:config] database.url must be set. ' +
        'Set the DATABASE_URL environment variable.',
    );
  }
}

// ---------------------------------------------------------------------------
// defineConfig helper
// ---------------------------------------------------------------------------

/**
 * Type-safe helper for authoring `volqan.config.ts`.
 * Returns the config object unchanged — the type inference is the benefit.
 *
 * @example
 * ```ts
 * // volqan.config.ts
 * import { defineConfig } from '@volqan/core/config';
 *
 * export default defineConfig({
 *   server: { port: 4000 },
 *   auth: { jwtSecret: process.env.JWT_SECRET! },
 * });
 * ```
 */
export function defineConfig(config: PartialVolqanConfig): PartialVolqanConfig {
  return config;
}
