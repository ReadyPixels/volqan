/**
 * @file extensions/deep-link.ts
 * @description Deep link utilities for connecting the Volqan admin panel to the
 * Bazarix marketplace (https://bazarix.link). Provides URL builders and parsers
 * for marketplace browsing and one-click install flows.
 */
/** Base URL for the Bazarix marketplace. */
export declare const BAZARIX_BASE_URL = "https://bazarix.link";
/** Bazarix extensions browse page. */
export declare const BAZARIX_EXTENSIONS_BROWSE_URL = "https://bazarix.link/extensions";
/** Bazarix themes browse page. */
export declare const BAZARIX_THEMES_BROWSE_URL = "https://bazarix.link/themes";
/** Bazarix install deep link prefix. */
export declare const BAZARIX_INSTALL_URL = "https://bazarix.link/install";
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
export declare function buildMarketplaceURL(type: 'extension' | 'theme', filters?: MarketplaceFilters): string;
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
export declare function parseInstallURL(url: string): ParsedInstallURL | null;
//# sourceMappingURL=deep-link.d.ts.map