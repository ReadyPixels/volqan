/**
 * @file config/types.ts
 * @description Type definitions for the Volqan framework configuration system.
 *
 * The complete configuration shape is defined here. Consumers create a
 * `volqan.config.ts` file at their project root that exports a partial config;
 * the loader merges it with defaults and env-var overrides.
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
export {};
//# sourceMappingURL=types.js.map