/**
 * @file extensions/manager.ts
 * @description ExtensionManager — orchestrates the full extension lifecycle
 * for a Volqan installation, including marketplace integration.
 *
 * The Extension Manager contains a deep link to the Bazarix marketplace
 * (https://bazarix.link) where developers can purchase and publish extensions.
 */
import type { VolqanExtension } from './types.js';
import { loadExtension, enableExtension, disableExtension, bootExtension, unloadExtension, getInstalledExtensions, getExtension, validateExtension, type LoadedExtension } from './loader.js';
/** Bazarix marketplace URL — the official store for Volqan extensions and themes. */
export declare const BAZARIX_MARKETPLACE_URL = "https://bazarix.link";
/** Deep link to browse extensions in the marketplace. */
export declare const BAZARIX_EXTENSIONS_URL = "https://bazarix.link/browse?type=extension";
/** Deep link to browse themes in the marketplace. */
export declare const BAZARIX_THEMES_URL = "https://bazarix.link/browse?type=theme";
export interface ExtensionManagerOptions {
    /**
     * Unique identifier for this Volqan installation.
     * Used when validating paid extension licenses against the Bazarix API.
     */
    installationId: string;
    /**
     * Whether to skip Bazarix license validation.
     * Useful in local development or air-gapped environments.
     * @default false
     */
    skipLicenseValidation?: boolean;
    /**
     * Timeout in milliseconds for license API calls.
     * @default 5000
     */
    licenseCheckTimeoutMs?: number;
    /**
     * Optional callback invoked when an extension errors during lifecycle ops.
     */
    onExtensionError?: (extensionId: string, error: Error) => void;
}
export interface LicenseValidationResult {
    valid: boolean;
    productId: string;
    installationId: string;
    plan: 'lifetime' | 'yearly' | 'monthly';
    expiresAt: string | null;
    features: string[];
    /** Error message if validation failed. */
    error?: string;
}
/**
 * ExtensionManager
 *
 * The central orchestrator for all extension operations in a Volqan instance.
 * Wraps the low-level loader functions and adds:
 *
 * - License validation for paid extensions from Bazarix
 * - Batch boot sequence for application startup
 * - Marketplace deep link helpers
 * - Typed accessors for all contributed UI and API elements
 *
 * @example
 * ```ts
 * const manager = new ExtensionManager({ installationId: 'inst_abc123' });
 * await manager.install(myExtension);
 * await manager.enable('acme/blog');
 * await manager.bootAll();
 * ```
 */
export declare class ExtensionManager {
    private readonly options;
    constructor(options: ExtensionManagerOptions);
    /**
     * Install an extension.
     *
     * If the extension requires a Bazarix license key (marketplace.licenseKey),
     * the key is validated against the Bazarix license API before installation
     * proceeds.
     *
     * @param ext - The extension object to install.
     * @returns The registered LoadedExtension record.
     */
    install(ext: unknown): Promise<LoadedExtension>;
    /**
     * Enable a previously installed extension.
     *
     * @param extensionId - The extension id (e.g. "acme/blog").
     */
    enable(extensionId: string): Promise<void>;
    /**
     * Disable an enabled extension.
     *
     * @param extensionId - The extension id.
     */
    disable(extensionId: string): Promise<void>;
    /**
     * Boot a single enabled extension.
     * Called during the Volqan application startup sequence.
     *
     * @param extensionId - The extension id.
     */
    boot(extensionId: string): Promise<void>;
    /**
     * Boot all currently enabled extensions in parallel.
     * Errors in individual extensions are captured and reported via
     * `onExtensionError` but do not block other extensions from booting.
     *
     * @returns An array of results for each boot attempt.
     */
    bootAll(): Promise<Array<{
        extensionId: string;
        success: boolean;
        error?: string;
    }>>;
    /**
     * Uninstall (remove) an extension.
     *
     * @param extensionId - The extension id.
     */
    uninstall(extensionId: string): Promise<void>;
    /** List all installed extensions. */
    list(): LoadedExtension[];
    /** Get a single extension by id. */
    get(extensionId: string): LoadedExtension | undefined;
    /** Check whether an extension is installed. */
    has(extensionId: string): boolean;
    /** Check whether an extension is currently enabled. */
    isEnabled(extensionId: string): boolean;
    /** All admin sidebar menu items contributed by enabled extensions. */
    get menuItems(): import("./types.js").MenuItem[];
    /** All admin pages contributed by enabled extensions. */
    get adminPages(): import("./types.js").AdminPage[];
    /** All dashboard widgets contributed by enabled extensions. */
    get widgets(): import("./types.js").Widget[];
    /** All settings fields contributed by enabled extensions. */
    get settings(): {
        extensionId: string;
        fields: import("./types.js").SettingField[];
    }[];
    /** All API routes contributed by enabled extensions. */
    get apiRoutes(): {
        extensionId: string;
        routes: import("./types.js").RouteDefinition[];
    }[];
    /** All content lifecycle hooks contributed by enabled extensions. */
    get contentHooks(): import("./types.js").ContentHook[];
    /** All database migrations from enabled extensions. */
    get migrations(): {
        extensionId: string;
        migrations: import("./types.js").Migration[];
    }[];
    /**
     * Open the Bazarix marketplace in a new browser tab.
     *
     * This is the single deep link between the Volqan framework and the Bazarix
     * marketplace (https://bazarix.link). The two systems share no code or database.
     *
     * This method is a no-op in non-browser (server-side) environments.
     *
     * @param category - Optional category filter ('extension' | 'theme').
     */
    openMarketplace(category?: 'extension' | 'theme'): void;
    /**
     * Get the Bazarix marketplace URL for display in UI components.
     * Use this instead of hard-coding the URL to ensure consistency.
     */
    getMarketplaceUrl(category?: 'extension' | 'theme'): string;
    /**
     * Validate a Bazarix license key against the marketplace license API.
     *
     * Called automatically during install() for extensions with a licenseKey.
     * Can also be called manually to re-verify existing licenses.
     *
     * License key format: MKT-{PRODUCT_ID}-{INSTALL_ID}-{EXPIRY_HASH}
     *
     * @param licenseKey - The license key to validate.
     * @param extensionId - The extension id (used for logging).
     * @throws {Error} when the license key is invalid or expired.
     */
    validateLicense(licenseKey: string, extensionId: string): Promise<LicenseValidationResult>;
    /**
     * Produce a summary of all installed extensions suitable for logging or
     * the admin dashboard Extensions page.
     */
    summary(): Array<{
        id: string;
        name: string;
        version: string;
        status: string;
        hasLicense: boolean;
    }>;
}
export type { LoadedExtension, VolqanExtension };
export { loadExtension, enableExtension, disableExtension, bootExtension, unloadExtension, getInstalledExtensions, getExtension, validateExtension, };
//# sourceMappingURL=manager.d.ts.map