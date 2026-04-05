/**
 * @file license/index.ts
 * @description Barrel export for the Volqan License module.
 *
 * Import from this module in the admin package and anywhere else that needs
 * to check license status:
 * ```ts
 * import {
 *   checkLicenseStatus,
 *   handleLicenseCheck,
 *   PROJECT_NAME,
 *   PROJECT_URL,
 * } from '@volqan/core/license';
 * ```
 */

// License checker (client-side framework call)
export {
  checkLicenseStatus,
  getInstallationId,
  invalidateLicenseCache,
  seedLicenseCache,
  licenseCache,
  LICENSE_API_URL,
  PROJECT_URL,
  PROJECT_NAME,
} from './checker.js';

export type { LicenseStatus } from './checker.js';

// License API handlers (server-side Bazarix API)
export {
  handleLicenseCheck,
  handleLicenseActivate,
  handleLicenseDeactivate,
} from './api.js';

export type {
  LicenseCheckResponse,
  LicenseApiError,
  LicenseSubscriptionResolver,
} from './api.js';

// Installation management
export {
  registerInstallation,
  getInstallation,
  linkToSubscription,
  unlinkSubscription,
  validateInstallation,
  isValidInstallationIdFormat,
} from './installation.js';

export type { Installation, InstallationStore } from './installation.js';

// Shared constants
export { SUPPORT_PLAN_FEATURES } from './api-constants.js';
