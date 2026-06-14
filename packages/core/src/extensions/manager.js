/**
 * @file extensions/manager.ts
 * @description ExtensionManager — orchestrates the full extension lifecycle
 * for a Volqan installation, including marketplace integration.
 *
 * The Extension Manager contains a deep link to the Bazarix marketplace
 * (https://bazarix.link) where developers can purchase and publish extensions.
 */
import { loadExtension, enableExtension, disableExtension, bootExtension, unloadExtension, getInstalledExtensions, getExtension, collectMenuItems, collectAdminPages, collectWidgets, collectSettings, collectApiRoutes, collectContentHooks, collectMigrations, setInstallationId, validateExtension, } from './loader.js';
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Bazarix marketplace URL — the official store for Volqan extensions and themes. */
export const BAZARIX_MARKETPLACE_URL = 'https://bazarix.link';
/** Deep link to browse extensions in the marketplace. */
export const BAZARIX_EXTENSIONS_URL = `${BAZARIX_MARKETPLACE_URL}/browse?type=extension`;
/** Deep link to browse themes in the marketplace. */
export const BAZARIX_THEMES_URL = `${BAZARIX_MARKETPLACE_URL}/browse?type=theme`;
/** License validation endpoint used to verify paid extension licenses. */
const LICENSE_VALIDATE_URL = `${BAZARIX_MARKETPLACE_URL}/api/v1/license/validate`;
// ---------------------------------------------------------------------------
// ExtensionManager
// ---------------------------------------------------------------------------
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
export class ExtensionManager {
    options;
    constructor(options) {
        this.options = {
            skipLicenseValidation: false,
            licenseCheckTimeoutMs: 5000,
            onExtensionError: (id, err) => console.error(`[ExtensionManager] Error in extension "${id}":`, err),
            ...options,
        };
        setInstallationId(options.installationId);
    }
    // -------------------------------------------------------------------------
    // Lifecycle operations
    // -------------------------------------------------------------------------
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
    async install(ext) {
        validateExtension(ext);
        if (ext.marketplace?.licenseKey && !this.options.skipLicenseValidation) {
            await this.validateLicense(ext.marketplace.licenseKey, ext.id);
        }
        return loadExtension(ext);
    }
    /**
     * Enable a previously installed extension.
     *
     * @param extensionId - The extension id (e.g. "acme/blog").
     */
    async enable(extensionId) {
        try {
            await enableExtension(extensionId);
        }
        catch (err) {
            this.options.onExtensionError(extensionId, err);
            throw err;
        }
    }
    /**
     * Disable an enabled extension.
     *
     * @param extensionId - The extension id.
     */
    async disable(extensionId) {
        try {
            await disableExtension(extensionId);
        }
        catch (err) {
            this.options.onExtensionError(extensionId, err);
            throw err;
        }
    }
    /**
     * Boot a single enabled extension.
     * Called during the Volqan application startup sequence.
     *
     * @param extensionId - The extension id.
     */
    async boot(extensionId) {
        try {
            await bootExtension(extensionId);
        }
        catch (err) {
            this.options.onExtensionError(extensionId, err);
            throw err;
        }
    }
    /**
     * Boot all currently enabled extensions in parallel.
     * Errors in individual extensions are captured and reported via
     * `onExtensionError` but do not block other extensions from booting.
     *
     * @returns An array of results for each boot attempt.
     */
    async bootAll() {
        const enabled = getInstalledExtensions().filter((r) => r.status === 'enabled');
        const results = await Promise.allSettled(enabled.map(({ extension }) => bootExtension(extension.id)));
        return results.map((result, i) => {
            const extensionId = enabled[i].extension.id;
            if (result.status === 'fulfilled') {
                return { extensionId, success: true };
            }
            const error = String(result.reason);
            this.options.onExtensionError(extensionId, result.reason);
            return { extensionId, success: false, error };
        });
    }
    /**
     * Uninstall (remove) an extension.
     *
     * @param extensionId - The extension id.
     */
    async uninstall(extensionId) {
        try {
            await unloadExtension(extensionId);
        }
        catch (err) {
            this.options.onExtensionError(extensionId, err);
            throw err;
        }
    }
    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------
    /** List all installed extensions. */
    list() {
        return getInstalledExtensions();
    }
    /** Get a single extension by id. */
    get(extensionId) {
        return getExtension(extensionId);
    }
    /** Check whether an extension is installed. */
    has(extensionId) {
        return getExtension(extensionId) !== undefined;
    }
    /** Check whether an extension is currently enabled. */
    isEnabled(extensionId) {
        return getExtension(extensionId)?.status === 'enabled';
    }
    // -------------------------------------------------------------------------
    // Contributed UI & API accessors
    // -------------------------------------------------------------------------
    /** All admin sidebar menu items contributed by enabled extensions. */
    get menuItems() {
        return collectMenuItems();
    }
    /** All admin pages contributed by enabled extensions. */
    get adminPages() {
        return collectAdminPages();
    }
    /** All dashboard widgets contributed by enabled extensions. */
    get widgets() {
        return collectWidgets();
    }
    /** All settings fields contributed by enabled extensions. */
    get settings() {
        return collectSettings();
    }
    /** All API routes contributed by enabled extensions. */
    get apiRoutes() {
        return collectApiRoutes();
    }
    /** All content lifecycle hooks contributed by enabled extensions. */
    get contentHooks() {
        return collectContentHooks();
    }
    /** All database migrations from enabled extensions. */
    get migrations() {
        return collectMigrations();
    }
    // -------------------------------------------------------------------------
    // Marketplace integration
    // -------------------------------------------------------------------------
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
    openMarketplace(category) {
        const url = category === 'theme'
            ? BAZARIX_THEMES_URL
            : category === 'extension'
                ? BAZARIX_EXTENSIONS_URL
                : BAZARIX_MARKETPLACE_URL;
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
        else {
            console.info(`[ExtensionManager] Marketplace URL: ${url}`);
        }
    }
    /**
     * Get the Bazarix marketplace URL for display in UI components.
     * Use this instead of hard-coding the URL to ensure consistency.
     */
    getMarketplaceUrl(category) {
        if (category === 'theme')
            return BAZARIX_THEMES_URL;
        if (category === 'extension')
            return BAZARIX_EXTENSIONS_URL;
        return BAZARIX_MARKETPLACE_URL;
    }
    // -------------------------------------------------------------------------
    // License validation
    // -------------------------------------------------------------------------
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
    async validateLicense(licenseKey, extensionId) {
        let result;
        try {
            const response = await fetch(LICENSE_VALIDATE_URL, {
                method: 'GET',
                headers: {
                    'X-License-Key': licenseKey,
                    'X-Install-ID': this.options.installationId,
                    'User-Agent': 'Volqan/1.0 (+https://volqan.link)',
                },
                signal: AbortSignal.timeout(this.options.licenseCheckTimeoutMs),
            });
            if (!response.ok) {
                throw new Error(`License API returned HTTP ${response.status}: ${response.statusText}`);
            }
            result = (await response.json());
        }
        catch (err) {
            // Network errors are non-fatal at install time — allow offline installs
            // but log the warning. On boot, stricter validation may apply.
            console.warn(`[ExtensionManager] License validation network error for "${extensionId}": ${String(err)}`);
            return {
                valid: false,
                productId: '',
                installationId: this.options.installationId,
                plan: 'monthly',
                expiresAt: null,
                features: [],
                error: String(err),
            };
        }
        if (!result.valid) {
            throw new Error(`License key for extension "${extensionId}" is not valid. ` +
                `Purchase or renew it at ${BAZARIX_MARKETPLACE_URL}.`);
        }
        return result;
    }
    // -------------------------------------------------------------------------
    // Serialization helpers
    // -------------------------------------------------------------------------
    /**
     * Produce a summary of all installed extensions suitable for logging or
     * the admin dashboard Extensions page.
     */
    summary() {
        return getInstalledExtensions().map(({ extension, status }) => ({
            id: extension.id,
            name: extension.name,
            version: extension.version,
            status,
            hasLicense: Boolean(extension.marketplace?.licenseKey),
        }));
    }
}
export { loadExtension, enableExtension, disableExtension, bootExtension, unloadExtension, getInstalledExtensions, getExtension, validateExtension, };
//# sourceMappingURL=manager.js.map