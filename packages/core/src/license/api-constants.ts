/**
 * @file license/api-constants.ts
 * @description Shared constants for the Volqan License API.
 */

/**
 * Features unlocked by an active Support Plan.
 * Returned by the license check API when attribution removal is active.
 */
export const SUPPORT_PLAN_FEATURES: string[] = [
  'Priority email support',
  'Attribution removal',
  'Early access to new features',
  'Direct access to maintainer',
];
