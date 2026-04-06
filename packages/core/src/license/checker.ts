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

import { createHash, randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Bazarix license validation API base URL. */
export const LICENSE_API_URL = 'https://bazarix.link/api/v1/license';

/** Public project URL — used in attribution footer and error messages. */
export const PROJECT_URL = 'https://volqan.link';

/** Project name — used in attribution footer display. */
export const PROJECT_NAME = 'Volqan';

/** License check network timeout in milliseconds. */
const LICENSE_CHECK_TIMEOUT_MS = 3_000;

/** Cache TTL in milliseconds (24 hours). */
const CACHE_TTL_MS = 24 * 60 * 60 * 1_000;

/** Environment variable key where the installation ID is persisted. */
const INSTALL_ID_ENV_KEY = 'VOLQAN_INSTALL_ID';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

/** Internal cache entry. */
interface CacheEntry {
  data: LicenseStatus;
  expiresAt: number; // UNIX timestamp ms
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

/**
 * Simple in-memory cache for license status responses.
 *
 * In production deployments with multiple processes, replace this with a
 * Redis-backed cache or an equivalent persistent store.
 */
class LicenseCache {
  private readonly store = new Map<string, CacheEntry>();

  /**
   * Retrieve a cached entry if it has not expired.
   *
   * @param key - Cache key (typically `license:{installId}`).
   * @returns The cached LicenseStatus or null if absent / expired.
   */
  get(key: string): LicenseStatus | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Store a value with a TTL.
   *
   * @param key   - Cache key.
   * @param data  - Data to cache.
   * @param ttlMs - Time-to-live in milliseconds (default: 24h).
   */
  set(key: string, data: LicenseStatus, ttlMs: number = CACHE_TTL_MS): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /** Invalidate a specific cache key. */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Clear the entire cache. */
  clear(): void {
    this.store.clear();
  }
}

/** Singleton cache instance shared across all checkLicenseStatus() calls. */
export const licenseCache = new LicenseCache();

// ---------------------------------------------------------------------------
// Installation ID
// ---------------------------------------------------------------------------

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
export async function getInstallationId(): Promise<string> {
  // 1. Environment variable
  const fromEnv = process.env[INSTALL_ID_ENV_KEY];
  if (fromEnv?.trim()) {
    return fromEnv.trim();
  }

  // 2. Deterministic fallback from runtime context
  try {
    const cwd = process.cwd();
    const hostname = await safeHostname();
    const raw = `${cwd}::${hostname}`;
    return `vi_${createHash('sha256').update(raw).digest('hex').slice(0, 24)}`;
  } catch {
    // 3. Last resort: random ID (not stable across restarts)
    return `vi_${randomBytes(12).toString('hex')}`;
  }
}

/** Safe wrapper around os.hostname() that never throws. */
async function safeHostname(): Promise<string> {
  try {
    const { hostname } = await import('os');
    return hostname();
  } catch {
    return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// Core license check
// ---------------------------------------------------------------------------

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
export async function checkLicenseStatus(
  installationIdOverride?: string,
): Promise<LicenseStatus> {
  const installId = installationIdOverride ?? (await getInstallationId());
  const cacheKey = `license:${installId}`;

  // Return cached value if still fresh
  const cached = licenseCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const response = await fetch(`${LICENSE_API_URL}/check`, {
      method: 'GET',
      headers: {
        'X-Install-ID': installId,
        'User-Agent': `${PROJECT_NAME}/1.0 (+${PROJECT_URL})`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(LICENSE_CHECK_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Non-2xx: treat as unlicensed — attribution required
      console.warn(
        `[volqan/license] License API returned HTTP ${response.status}. Attribution will be shown.`,
      );
      const fallback: LicenseStatus = { attributionRemoved: false };
      licenseCache.set(cacheKey, fallback);
      return fallback;
    }

    const apiResponse = (await response.json()) as {
      valid?: boolean;
      plan?: string;
      expiresAt?: string;
      attributionRemoved?: boolean;
      features?: string[];
      licenseState?: string;
    };

    // Normalize the API response to the LicenseStatus shape
    const normalised: LicenseStatus = {
      attributionRemoved: Boolean(apiResponse.attributionRemoved),
      plan: normalisePlan(apiResponse.plan),
      expiresAt: apiResponse.expiresAt ?? null,
      licenseState: apiResponse.licenseState ?? (apiResponse.valid ? 'active' : 'inactive'),
      features: apiResponse.features ?? [],
    };

    licenseCache.set(cacheKey, normalised);
    return normalised;
  } catch (err) {
    // Network timeout, DNS failure, connection refused, etc.
    // Safe fallback: always show attribution
    console.warn(
      `[volqan/license] License check failed (${String(err)}). Showing attribution as fallback.`,
    );
    return { attributionRemoved: false };
  }
}

// ---------------------------------------------------------------------------
// Cache management helpers
// ---------------------------------------------------------------------------

/**
 * Forcibly invalidate the license cache for a given installation.
 * Call this after a subscription change (e.g. from the Stripe webhook handler)
 * to ensure the next request fetches a fresh status.
 *
 * @param installId - The installation ID to invalidate. Defaults to the
 *                    current installation's ID.
 */
export async function invalidateLicenseCache(
  installId?: string,
): Promise<void> {
  const id = installId ?? (await getInstallationId());
  licenseCache.invalidate(`license:${id}`);
  console.info(`[volqan/license] Cache invalidated for installation: ${id}`);
}

/**
 * Manually seed the license cache with a known status.
 * Useful in tests and after a Stripe webhook confirms subscription state.
 *
 * @param status    - The LicenseStatus to cache.
 * @param installId - The installation ID to cache for.
 * @param ttlMs     - Optional custom TTL.
 */
export async function seedLicenseCache(
  status: LicenseStatus,
  installId?: string,
  ttlMs?: number,
): Promise<void> {
  const id = installId ?? (await getInstallationId());
  licenseCache.set(`license:${id}`, status, ttlMs);
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Normalise a plan string from the API response to the LicenseStatus plan type.
 */
function normalisePlan(
  plan: string | undefined,
): 'monthly' | 'yearly' | undefined {
  if (!plan) return undefined;
  if (plan.includes('yearly') || plan.includes('year')) return 'yearly';
  if (plan.includes('monthly') || plan.includes('month')) return 'monthly';
  return undefined;
}
