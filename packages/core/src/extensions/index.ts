/**
 * @file extensions/index.ts
 * @description Barrel export for the Volqan Extension Engine.
 *
 * Import from this module to access all extension-related types and functions:
 * ```ts
 * import { VolqanExtension, ExtensionManager } from '@volqan/core/extensions';
 * ```
 */

// Types
export type {
  VolqanExtension,
  ExtensionContext,
  MenuItem,
  AdminPage,
  Widget,
  SettingField,
  RouteDefinition,
  ExtensionRequest,
  ExtensionResponse,
  ContentHook,
  ContentHookPayload,
  Migration,
} from './types.js';

// Loader
export {
  loadExtension,
  validateExtension,
  enableExtension,
  disableExtension,
  bootExtension,
  unloadExtension,
  getInstalledExtensions,
  getExtension,
  collectMenuItems,
  collectAdminPages,
  collectWidgets,
  collectSettings,
  collectApiRoutes,
  collectContentHooks,
  collectMigrations,
  setInstallationId,
  ExtensionValidationError,
  ExtensionLifecycleError,
} from './loader.js';

export type { LoadedExtension, ExtensionStatus } from './loader.js';

// Manager
export {
  ExtensionManager,
  BAZARIX_MARKETPLACE_URL,
  BAZARIX_EXTENSIONS_URL,
  BAZARIX_THEMES_URL,
} from './manager.js';

export type {
  ExtensionManagerOptions,
  LicenseValidationResult,
} from './manager.js';
