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
/** Supported database providers */
export type DatabaseProvider = 'postgresql' | 'mysql' | 'sqlite';
/** Database connection configuration */
export interface DatabaseConfig {
    /** Full connection URL (overrides individual fields) */
    url: string;
    /** Database engine (default: postgresql) */
    provider: DatabaseProvider;
    /** Enable query logging in development */
    debug: boolean;
}
/** Configuration for a single OAuth provider */
export interface OAuthProviderConfig {
    clientId: string;
    clientSecret: string;
    /** Full callback URL, e.g. https://myapp.com/auth/callback/google */
    redirectUri: string;
}
/** Auth system configuration */
export interface AuthConfig {
    /** Secret for signing JWTs — must be at least 32 chars in production */
    jwtSecret: string;
    /** Access token lifetime in seconds (default: 900 = 15 minutes) */
    accessTokenTtl: number;
    /** Refresh token lifetime in seconds (default: 604800 = 7 days) */
    refreshTokenTtl: number;
    /** Session lifetime in seconds (default: 604800 = 7 days) */
    sessionDuration: number;
    /** Name of the session cookie */
    sessionCookieName: string;
    /** Whether new users can self-register (default: false) */
    allowRegistration: boolean;
    /** Whether email must be verified before login (default: false) */
    requireEmailVerification: boolean;
    /** OAuth provider credentials */
    oauth: {
        google?: OAuthProviderConfig;
        github?: OAuthProviderConfig;
    };
}
/** CORS configuration */
export interface CorsConfig {
    /** Allowed origins — use ['*'] to allow all */
    origins: string[];
    /** Allowed HTTP methods */
    methods: string[];
    /** Allowed headers */
    headers: string[];
    /** Whether to expose credentials */
    credentials: boolean;
}
/** HTTP server configuration */
export interface ServerConfig {
    /** Bind port (default: 3000) */
    port: number;
    /** Bind host (default: '0.0.0.0') */
    host: string;
    /** CORS settings */
    cors: CorsConfig;
    /** Trusted proxy IPs for real IP resolution */
    trustProxy: boolean | string[];
}
export type StorageProviderName = 'local' | 's3';
/** Local filesystem storage configuration */
export interface LocalStorageConfig {
    /** Absolute path to the upload directory */
    path: string;
    /** Public URL base for serving files */
    publicUrl: string;
}
/** S3-compatible object storage configuration */
export interface S3StorageConfig {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    /** Custom endpoint for S3-compatible services (e.g. MinIO, Cloudflare R2) */
    endpoint?: string;
    /** Public CDN URL prefix for serving files */
    cdnUrl?: string;
}
/** Storage subsystem configuration */
export interface StorageConfig {
    /** Active storage provider */
    provider: StorageProviderName;
    /** Maximum upload file size in bytes (default: 50 MB) */
    maxFileSizeBytes: number;
    /** Allowed MIME type patterns (default: ['image/*', 'video/*', 'application/pdf']) */
    allowedMimeTypes: string[];
    /** Local filesystem settings */
    local: LocalStorageConfig;
    /** S3 settings (required when provider is 's3') */
    s3?: S3StorageConfig;
}
/** SMTP email transport configuration */
export interface EmailConfig {
    /** SMTP host */
    host: string;
    /** SMTP port (default: 587) */
    port: number;
    /** Use TLS (default: true) */
    secure: boolean;
    /** SMTP credentials */
    auth?: {
        user: string;
        pass: string;
    };
    /** Sender address */
    from: string;
    /** Reply-to address */
    replyTo?: string;
}
/** Extension system configuration */
export interface ExtensionsConfig {
    /** Directory to scan for local extensions */
    directory: string;
    /** Whether to allow installing extensions from the marketplace */
    marketplaceEnabled: boolean;
}
/** Theme system configuration */
export interface ThemesConfig {
    /** Directory to scan for local themes */
    directory: string;
}
/**
 * Complete Volqan framework configuration.
 * All top-level keys are required by the internal loader after merging with defaults.
 */
export interface VolqanConfig {
    database: DatabaseConfig;
    auth: AuthConfig;
    server: ServerConfig;
    storage: StorageConfig;
    email: EmailConfig;
    extensions: ExtensionsConfig;
    themes: ThemesConfig;
}
/**
 * Deep partial version of {@link VolqanConfig} accepted by `defineConfig()`.
 * Consumers only need to specify values they want to override.
 */
export type PartialVolqanConfig = DeepPartial<VolqanConfig>;
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export {};
//# sourceMappingURL=types.d.ts.map