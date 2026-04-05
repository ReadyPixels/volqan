/**
 * @file index.ts
 * @description Root barrel export for the @volqan/core package.
 *
 * Consumers can import anything from the top-level package entry:
 * ```ts
 * import {
 *   VolqanExtension,
 *   ExtensionManager,
 *   VolqanTheme,
 *   applyTheme,
 *   checkLicenseStatus,
 *   calculateServiceFee,
 *   createWebhookHandler,
 * } from '@volqan/core';
 * ```
 *
 * Or import from subpath exports for better tree-shaking:
 * ```ts
 * import { ExtensionManager } from '@volqan/core/extensions';
 * import { loadTheme }        from '@volqan/core/themes';
 * import { checkLicenseStatus } from '@volqan/core/license';
 * import { calculateServiceFee } from '@volqan/core/billing';
 * ```
 */

// ---------------------------------------------------------------------------
// Extensions
// ---------------------------------------------------------------------------
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
  LoadedExtension,
  ExtensionStatus,
  ExtensionManagerOptions,
  LicenseValidationResult,
} from './extensions/index.js';

export {
  ExtensionManager,
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
  BAZARIX_MARKETPLACE_URL,
  BAZARIX_EXTENSIONS_URL,
  BAZARIX_THEMES_URL,
} from './extensions/index.js';

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------
export type { VolqanTheme, ComponentOverride } from './themes/index.js';

export {
  loadTheme,
  applyTheme,
  loadAndApplyTheme,
  getActiveTheme,
  listThemes,
  getTheme,
  unloadTheme,
  generateThemeCss,
  getComponentOverride,
  mergeComponentStyle,
  validateTheme,
  ThemeValidationError,
} from './themes/index.js';

// ---------------------------------------------------------------------------
// License
// ---------------------------------------------------------------------------
export type { LicenseStatus } from './license/index.js';

export {
  checkLicenseStatus,
  getInstallationId,
  invalidateLicenseCache,
  seedLicenseCache,
  licenseCache,
  LICENSE_API_URL,
  PROJECT_URL,
  PROJECT_NAME,
} from './license/index.js';

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------
export type { FeeBreakdown, WebhookRequest, WebhookResponse, LicenseStore } from './billing/index.js';

export {
  calculateServiceFee,
  calculateMonthlyPrice,
  calculateBuyerTotal,
  calculateSellerPayout,
  calculatePlatformRevenue,
  getDetailedFeeBreakdown,
  isValidListingPrice,
  formatUsd,
  createWebhookHandler,
  MIN_LISTING_PRICE_CENTS,
  MAX_LISTING_PRICE_CENTS,
} from './billing/index.js';
