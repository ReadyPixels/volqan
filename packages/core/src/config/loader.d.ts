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
import type { VolqanConfig, PartialVolqanConfig } from './types.js';
/**
 * Returns the currently resolved config.
 *
 * @throws {Error} if {@link loadConfig} has not been called yet
 */
export declare function getConfig(): VolqanConfig;
/**
 * Loads, merges, and validates the full configuration.
 *
 * Call once at application startup (e.g. in `instrumentation.ts` or
 * the root `layout.tsx`). Subsequent calls return the cached config.
 *
 * @param overrides - Optional programmatic overrides (highest priority)
 * @returns The resolved {@link VolqanConfig}
 */
export declare function loadConfig(overrides?: PartialVolqanConfig): Promise<VolqanConfig>;
/**
 * Resets the config cache. Useful for testing.
 */
export declare function resetConfig(): void;
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
export declare function defineConfig(config: PartialVolqanConfig): PartialVolqanConfig;
//# sourceMappingURL=loader.d.ts.map