/**
 * @file extensions/deep-link.ts
 * @description Deep link utilities for connecting the Volqan admin panel to the
 * Bazarix marketplace (https://bazarix.link). Provides URL builders and parsers
 * for marketplace browsing and one-click install flows.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base URL for the Bazarix marketplace. */
export const BAZARIX_BASE_URL = 'https://bazarix.link';

/** Bazarix extensions browse page. */
export const BAZARIX_EXTENSIONS_BROWSE_URL = `${BAZARIX_BASE_URL}/extensions`;

/** Bazarix themes browse page. */
export const BAZARIX_THEMES_BROWSE_URL = `${BAZARIX_BASE_URL}/themes`;

/** Bazarix install deep link prefix. */
export const BAZARIX_INSTALL_URL = `${BAZARIX_BASE_URL}/install`;

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

export interface MarketplaceFilters {
  /** Category slug to filter by (e.g. "content", "ecommerce", "dark"). */
  category?: string;
  /** Search query string. */
  search?: string;
  /** Price filter: "free" or "paid". */
  pricing?: 'free' | 'paid';
  /** Sort order. */
  sort?: 'popular' | 'newest' | 'price-asc' | 'price-desc';
}

/**
 * Build a Bazarix marketplace browse URL with optional filters.
 *
 * @param type - Whether to browse extensions or themes.
 * @param filters - Optional filter and sort parameters.
 * @returns Fully qualified Bazarix marketplace URL.
 *
 * @example
 * ```ts
 * buildMarketplaceURL('extension');
 * // => "https://bazarix.link/extensions?source=volqan"
 *
 * buildMarketplaceURL('theme', { category: 'dark' });
 * // => "https://bazarix.link/themes?source=volqan&category=dark"
 * ```
 */
export function buildMarketplaceURL(
  type: 'extension' | 'theme',
  filters?: MarketplaceFilters,
): string {
  const base =
    type === 'extension'
      ? BAZARIX_EXTENSIONS_BROWSE_URL
      : BAZARIX_THEMES_BROWSE_URL;

  const params = new URLSearchParams();
  params.set('source', 'volqan');

  if (filters?.category) {
    params.set('category', filters.category);
  }
  if (filters?.search) {
    params.set('search', filters.search);
  }
  if (filters?.pricing) {
    params.set('pricing', filters.pricing);
  }
  if (filters?.sort) {
    params.set('sort', filters.sort);
  }

  return `${base}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Install URL parser
// ---------------------------------------------------------------------------

export interface ParsedInstallURL {
  /** Extension or theme slug (e.g. "acme/blog"). */
  slug: string;
  /** Requested version, or "latest" if not specified. */
  version: string;
}

/**
 * Parse a Bazarix install deep link URL into its slug and version components.
 *
 * Expected format: `https://bazarix.link/install/{slug}?version={version}`
 *
 * @param url - The full Bazarix install URL.
 * @returns Parsed slug and version, or `null` if the URL is not a valid install link.
 *
 * @example
 * ```ts
 * parseInstallURL('https://bazarix.link/install/acme/blog?version=2.1.0');
 * // => { slug: 'acme/blog', version: '2.1.0' }
 *
 * parseInstallURL('https://bazarix.link/install/acme/blog');
 * // => { slug: 'acme/blog', version: 'latest' }
 * ```
 */
export function parseInstallURL(url: string): ParsedInstallURL | null {
  try {
    const parsed = new URL(url);

    if (parsed.origin !== BAZARIX_BASE_URL) {
      return null;
    }

    const installPrefix = '/install/';
    if (!parsed.pathname.startsWith(installPrefix)) {
      return null;
    }

    const slug = decodeURIComponent(
      parsed.pathname.slice(installPrefix.length),
    ).replace(/\/+$/, '');

    if (!slug || !slug.includes('/')) {
      return null;
    }

    const version = parsed.searchParams.get('version') ?? 'latest';

    return { slug, version };
  } catch {
    return null;
  }
}
