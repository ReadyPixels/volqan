/**
 * @file license/checker.ts
 * @description License status checker for the Volqan attribution system.
 *
 * Validates the installation's active subscription against the Bazarix
 * license API (https://bazarix.link/api/v1/license). Results are cached
 * server-side for 24 hours to avoid hammering the API on every request.
 *
 * License API:  https://bazarix.link/api/v1/license
 * Project URL:  https://volqan.link
 * Project Name: Volqan
 */
/** Bazarix license validation API base URL. */
export declare const LICENSE_API_URL = "https://bazarix.link/api/v1/license";
/** Public project URL — used in attribution footer and error messages. */
export declare const PROJECT_URL = "https://volqan.link";
/** Project name — used in attribution footer display. */
export declare const PROJECT_NAME = "Volqan";
/**
 * The shape returned by the Bazarix license API and cached locally.
 */
export interface LicenseStatus {
    /**
     * When true, the installation holds a valid active subscription and the
     * attribution footer may be hidden.
     */
    attributionRemoved: boolean;
    /**
     * The subscription plan type. Present only when attributionRemoved is true.
     */
    plan?: 'monthly' | 'yearly';
    /**
     * ISO 8601 expiry timestamp. null for lifetime licenses.
     */
    expiresAt?: string | null;
    /**
     * Human-readable status returned by the API (e.g. "active", "grace_period").
     */
    licenseState?: string;
    /**
     * List of features active on this installation.
     * Populated from the API response when attributionRemoved is true.
     */
    features?: string[];
}
/**
 * Simple in-memory cache for license status responses.
 *
 * In production deployments with multiple processes, replace this with a
 * Redis-backed cache or an equivalent persistent store.
 */
declare class LicenseCache {
    private readonly store;
    /**
     * Retrieve a cached entry if it has not expired.
     *
     * @param key - Cache key (typically `license:{installId}`).
     * @returns The cached LicenseStatus or null if absent / expired.
     */
    get(key: string): LicenseStatus | null;
    /**
     * Store a value with a TTL.
     *
     * @param key   - Cache key.
     * @param data  - Data to cache.
     * @param ttlMs - Time-to-live in milliseconds (default: 24h).
     */
    set(key: string, data: LicenseStatus, ttlMs?: number): void;
    /** Invalidate a specific cache key. */
    invalidate(key: string): void;
    /** Clear the entire cache. */
    clear(): void;
}
/** Singleton cache instance shared across all checkLicenseStatus() calls. */
export declare const licenseCache: LicenseCache;
/**
 * Return the unique installation identifier for this Volqan instance.
 *
 * Resolution order:
 * 1. VOLQAN_INSTALL_ID environment variable (set by Docker / .env)
 * 2. A deterministic hash of the process working directory + hostname
 * 3. A random UUID stored in-process (regenerates on restart)
 *
 * In production, always set VOLQAN_INSTALL_ID in the environment so the ID
 * survives container restarts and horizontal scaling.
 */
export declare function getInstallationId(): Promise<string>;
/**
 * Check whether the current installation has a valid active subscription
 * that permits removing the attribution footer.
 *
 * The function:
 * 1. Retrieves the installation ID.
 * 2. Returns the cached status if present and not expired (24h TTL).
 * 3. Calls the Bazarix license API with a 3-second timeout.
 * 4. Caches the successful response for 24 hours.
 * 5. Falls back to `{ attributionRemoved: false }` on any network error,
 *    ensuring the attribution footer is always shown when the API is
 *    unreachable — protecting the open-core license requirement.
 *
 * @param installationIdOverride - Optional installation ID override.
 *   When provided, uses this ID instead of auto-detecting.
 *   Useful for multi-tenant deployments or testing.
 * @returns A LicenseStatus object.
 */
export declare function checkLicenseStatus(installationIdOverride?: string): Promise<LicenseStatus>;
/**
 * Forcibly invalidate the license cache for a given installation.
 * Call this after a subscription change (e.g. from the Stripe webhook handler)
 * to ensure the next request fetches a fresh status.
 *
 * @param installId - The installation ID to invalidate. Defaults to the
 *                    current installation's ID.
 */
export declare function invalidateLicenseCache(installId?: string): Promise<void>;
/**
 * Manually seed the license cache with a known status.
 * Useful in tests and after a Stripe webhook confirms subscription state.
 *
 * @param status    - The LicenseStatus to cache.
 * @param installId - The installation ID to cache for.
 * @param ttlMs     - Optional custom TTL.
 */
export declare function seedLicenseCache(status: LicenseStatus, installId?: string, ttlMs?: number): Promise<void>;
export {};
//# sourceMappingURL=checker.d.ts.map