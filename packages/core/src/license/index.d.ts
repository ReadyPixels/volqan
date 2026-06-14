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
export { checkLicenseStatus, getInstallationId, invalidateLicenseCache, seedLicenseCache, licenseCache, LICENSE_API_URL, PROJECT_URL, PROJECT_NAME, } from './checker.js';
export type { LicenseStatus } from './checker.js';
export { handleLicenseCheck, handleLicenseActivate, handleLicenseDeactivate, } from './api.js';
export type { LicenseCheckResponse, LicenseApiError, LicenseSubscriptionResolver, } from './api.js';
export { registerInstallation, getInstallation, linkToSubscription, unlinkSubscription, validateInstallation, isValidInstallationIdFormat, } from './installation.js';
export type { Installation, InstallationStore } from './installation.js';
export { SUPPORT_PLAN_FEATURES } from './api-constants.js';
//# sourceMappingURL=index.d.ts.map