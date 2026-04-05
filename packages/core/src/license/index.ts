/**
 * @file license/index.ts
 * @description Barrel export for the Volqan License Checker.
 *
 * Import from this module in the admin package and anywhere else that needs
 * to check license status:
 * ```ts
 * import { checkLicenseStatus, PROJECT_NAME, PROJECT_URL } from '@volqan/core/license';
 * ```
 */

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
