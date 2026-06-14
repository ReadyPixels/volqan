/**
 * @file extensions/index.ts
 * @description Barrel export for the Volqan Extension Engine.
 *
 * Import from this module to access all extension-related types and functions:
 * ```ts
 * import { VolqanExtension, ExtensionManager } from '@volqan/core/extensions';
 * ```
 */
// Loader
export { loadExtension, validateExtension, enableExtension, disableExtension, bootExtension, unloadExtension, getInstalledExtensions, getExtension, collectMenuItems, collectAdminPages, collectWidgets, collectSettings, collectApiRoutes, collectContentHooks, collectMigrations, setInstallationId, ExtensionValidationError, ExtensionLifecycleError, } from './loader.js';
// Manager
export { ExtensionManager, BAZARIX_MARKETPLACE_URL, BAZARIX_EXTENSIONS_URL, BAZARIX_THEMES_URL, } from './manager.js';
// Deep link utilities
export { BAZARIX_BASE_URL, BAZARIX_EXTENSIONS_BROWSE_URL, BAZARIX_THEMES_BROWSE_URL, buildMarketplaceURL, parseInstallURL, } from './deep-link.js';
//# sourceMappingURL=index.js.map