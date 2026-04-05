/**
 * @file billing/index.ts
 * @description Barrel export for the Volqan Billing module.
 *
 * Import from this module to access fee calculation utilities and the
 * Stripe webhook handler factory:
 * ```ts
 * import {
 *   calculateServiceFee,
 *   calculateMonthlyPrice,
 *   createWebhookHandler,
 * } from '@volqan/core/billing';
 * ```
 */

// Fee calculator
export {
  calculateServiceFee,
  calculateMonthlyPrice,
  calculateBuyerTotal,
  calculateSellerPayout,
  calculatePlatformRevenue,
  getDetailedFeeBreakdown,
  isValidListingPrice,
  formatUsd,
  MIN_LISTING_PRICE_CENTS,
  MAX_LISTING_PRICE_CENTS,
} from './fee-calculator.js';

export type { FeeBreakdown } from './fee-calculator.js';

// Webhook handler
export { createWebhookHandler } from './webhook-handler.js';

export type {
  WebhookRequest,
  WebhookResponse,
  LicenseStore,
} from './webhook-handler.js';
