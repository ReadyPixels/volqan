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
import type { Plan } from './types.js';
/** Features included in all Support Plans (yearly and monthly). */
export declare const SUPPORT_PLAN_FEATURES: string[];
export declare const PLAN_ID_SUPPORT_YEARLY = "support-yearly";
export declare const PLAN_ID_SUPPORT_MONTHLY = "support-monthly";
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
export declare function buildSupportYearlyPlan(yearlyPriceCents: number, stripePriceId: string): Plan;
/**
 * Build the Support Plan — Monthly definition, deriving its price from the
 * yearly price using the Volqan monthly uplift formula.
 *
 * @param yearlyPriceCents  - Owner-configured yearly price in cents.
 * @param stripePriceId     - Stripe Price ID for the monthly price object.
 */
export declare function buildSupportMonthlyPlan(yearlyPriceCents: number, stripePriceId: string): Plan;
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
export declare function buildPlans(yearlyPriceCents: number, yearlyStripePriceId: string, monthlyStripePriceId: string): {
    yearly: Plan;
    monthly: Plan;
};
/**
 * Calculate the price for a given interval from the owner-set yearly price.
 *
 * @param yearlyPriceCents - Owner-configured yearly price in cents.
 * @param interval         - "yearly" or "monthly".
 * @returns Price in cents for that interval.
 */
export declare function calculatePrice(yearlyPriceCents: number, interval: 'yearly' | 'monthly'): number;
/**
 * Get all available plan IDs.
 */
export declare const ALL_PLAN_IDS: readonly ["support-yearly", "support-monthly"];
export type PlanId = (typeof ALL_PLAN_IDS)[number];
//# sourceMappingURL=plans.d.ts.map