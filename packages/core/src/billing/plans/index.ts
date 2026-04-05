/**
 * @file billing/plans/index.ts
 * @description Barrel export for the Volqan Support Plans module.
 *
 * @example
 * ```ts
 * import {
 *   buildPlans,
 *   createCheckoutSession,
 *   activateSubscription,
 *   type Plan,
 *   type Subscription,
 * } from '@volqan/core/billing/plans';
 * ```
 */

// Types
export type {
  Plan,
  Subscription,
  SubscriptionStatus,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  CheckoutSession,
} from './types.js';

// Plan definitions & helpers
export {
  buildPlans,
  buildSupportYearlyPlan,
  buildSupportMonthlyPlan,
  calculatePrice,
  SUPPORT_PLAN_FEATURES,
  PLAN_ID_SUPPORT_YEARLY,
  PLAN_ID_SUPPORT_MONTHLY,
  ALL_PLAN_IDS,
} from './plans.js';

export type { PlanId } from './plans.js';

// Checkout
export {
  createCheckoutSession,
  createCustomerPortalSession,
} from './checkout.js';

export type { CheckoutOptions } from './checkout.js';

// Subscription lifecycle
export {
  getSubscription,
  getSubscriptionByStripeId,
  activateSubscription,
  cancelSubscription,
  reactivateSubscription,
  handleRenewal,
  handlePaymentFailed,
  handleCancellation,
  isAttributionRemoved,
  recordInvoice,
  getInvoiceHistory,
} from './subscription-manager.js';

export type { SubscriptionStore } from './subscription-manager.js';
