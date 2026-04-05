/**
 * @file billing/plans/plans.ts
 * @description Support Plan definitions for the Volqan framework.
 *
 * Plan configuration is driven by the owner-set yearly price stored in the
 * Settings table. Call `buildPlans(yearlyPriceCents)` at runtime once you
 * have retrieved the configured price.
 *
 * Pricing rules (from the Volqan Fee Disclosure policy):
 *   Monthly Price = (Yearly Price ÷ 12) × 1.25
 *
 * The Platform Service Fee is NOT included in these prices — it is added as
 * a separate line item at checkout via fee-calculator.ts.
 */

import { calculateMonthlyPrice } from '../fee-calculator.js';
import type { Plan } from './types.js';

// ---------------------------------------------------------------------------
// Feature lists
// ---------------------------------------------------------------------------

/** Features included in all Support Plans (yearly and monthly). */
export const SUPPORT_PLAN_FEATURES: string[] = [
  'Priority email support',
  'Attribution removal',
  'Early access to new features',
  'Direct access to maintainer',
];

// ---------------------------------------------------------------------------
// Plan ID constants
// ---------------------------------------------------------------------------

export const PLAN_ID_SUPPORT_YEARLY = 'support-yearly';
export const PLAN_ID_SUPPORT_MONTHLY = 'support-monthly';

// ---------------------------------------------------------------------------
// Plan builders
// ---------------------------------------------------------------------------

/**
 * Build the Support Plan — Yearly definition from the configured yearly price.
 *
 * The `stripePriceId` must be supplied at runtime from environment variables
 * or the Settings table. Pass an empty string if not yet configured — the
 * checkout flow will throw a clear error before creating a session.
 *
 * @param yearlyPriceCents  - Owner-configured yearly price in cents.
 * @param stripePriceId     - Stripe Price ID for the yearly price object.
 */
export function buildSupportYearlyPlan(
  yearlyPriceCents: number,
  stripePriceId: string,
): Plan {
  return {
    id: PLAN_ID_SUPPORT_YEARLY,
    name: 'Support Plan — Yearly',
    description:
      'Annual subscription. Best value — save 17% compared to monthly billing.',
    interval: 'yearly',
    price: yearlyPriceCents,
    currency: 'usd',
    stripePriceId,
    features: SUPPORT_PLAN_FEATURES,
  };
}

/**
 * Build the Support Plan — Monthly definition, deriving its price from the
 * yearly price using the Volqan monthly uplift formula.
 *
 * @param yearlyPriceCents  - Owner-configured yearly price in cents.
 * @param stripePriceId     - Stripe Price ID for the monthly price object.
 */
export function buildSupportMonthlyPlan(
  yearlyPriceCents: number,
  stripePriceId: string,
): Plan {
  return {
    id: PLAN_ID_SUPPORT_MONTHLY,
    name: 'Support Plan — Monthly',
    description:
      'Month-to-month subscription. Cancel anytime.',
    interval: 'monthly',
    price: calculateMonthlyPrice(yearlyPriceCents),
    currency: 'usd',
    stripePriceId,
    features: SUPPORT_PLAN_FEATURES,
  };
}

/**
 * Build both Support Plans from a single yearly price configuration.
 *
 * @param yearlyPriceCents       - Owner-configured yearly price in cents.
 * @param yearlyStripePriceId    - Stripe Price ID for the yearly plan.
 * @param monthlyStripePriceId   - Stripe Price ID for the monthly plan.
 * @returns An object with both plan definitions.
 *
 * @example
 * const plans = buildPlans(4800, 'price_yearly_xxx', 'price_monthly_xxx');
 * // plans.yearly.price  === 4800   ($48.00/year)
 * // plans.monthly.price === 500    ($5.00/month)
 */
export function buildPlans(
  yearlyPriceCents: number,
  yearlyStripePriceId: string,
  monthlyStripePriceId: string,
): { yearly: Plan; monthly: Plan } {
  return {
    yearly: buildSupportYearlyPlan(yearlyPriceCents, yearlyStripePriceId),
    monthly: buildSupportMonthlyPlan(yearlyPriceCents, monthlyStripePriceId),
  };
}

/**
 * Calculate the price for a given interval from the owner-set yearly price.
 *
 * @param yearlyPriceCents - Owner-configured yearly price in cents.
 * @param interval         - "yearly" or "monthly".
 * @returns Price in cents for that interval.
 */
export function calculatePrice(
  yearlyPriceCents: number,
  interval: 'yearly' | 'monthly',
): number {
  if (interval === 'yearly') {
    return yearlyPriceCents;
  }
  return calculateMonthlyPrice(yearlyPriceCents);
}

/**
 * Get all available plan IDs.
 */
export const ALL_PLAN_IDS = [
  PLAN_ID_SUPPORT_YEARLY,
  PLAN_ID_SUPPORT_MONTHLY,
] as const;

export type PlanId = (typeof ALL_PLAN_IDS)[number];
