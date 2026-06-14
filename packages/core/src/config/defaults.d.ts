/**
 * @file config/defaults.ts
 * @description Sensible default values for all Volqan configuration options.
 *
 * These defaults are designed for a local development environment.
 * Production deployments must override sensitive values (JWT secret, database URL)
 * via environment variables or the `volqan.config.ts` file.
 */
import type { VolqanConfig } from './types.js';
/**
 * Default Volqan configuration.
 *
 * Values here are overridden by (in ascending priority):
 * 1. `volqan.config.ts` file
 * 2. Environment variables (see {@link ./loader.ts})
 */
export declare const DEFAULT_CONFIG: VolqanConfig;
//# sourceMappingURL=defaults.d.ts.map