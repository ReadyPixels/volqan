/**
 * @file billing/plans/checkout.ts
 * @description Stripe Checkout Session and Customer Portal session creation
 * for the Volqan Support Plan subscription flow.
 *
 * Compliance notes (per Volqan Terms of Service):
 *   - The Platform Service Fee is added as a SEPARATE line item labeled
 *     "Service Fee" — never bundled into the plan price.
 *   - The fee is displayed before the user confirms checkout (shown on the
 *     Stripe Checkout page as a distinct line item).
 *   - Fee formula: $0.50 flat + 10% of plan price (+ $0.50 if PayPal, but
 *     PayPal is not currently an available payment method for subscriptions).
 */
import type Stripe from 'stripe';
import type { CheckoutSession } from './types.js';
export interface CheckoutOptions {
    /**
     * The Volqan user ID (stored in subscription_data.metadata for webhook
     * attribution and activation).
     */
    userId: string;
    /**
     * Internal plan ID (e.g. "support-yearly" | "support-monthly").
     */
    planId: string;
    /**
     * Stripe Price ID for the plan being purchased.
     */
    stripePriceId: string;
    /**
     * Plan price in cents (used to calculate the service fee).
     */
    planPriceCents: number;
    /**
     * URL to redirect to after a successful payment.
     */
    successUrl: string;
    /**
     * URL to redirect to if the user cancels checkout.
     */
    cancelUrl: string;
    /**
     * Customer email to pre-fill in Stripe Checkout.
     * Typically the logged-in user's email.
     */
    customerEmail?: string;
    /**
     * Installation ID to store in subscription metadata.
     * Used by the webhook handler to seed the license cache.
     */
    installationId?: string;
    /**
     * Existing Stripe Customer ID. When provided, Checkout will be pre-filled
     * with the customer's saved payment methods.
     */
    stripeCustomerId?: string;
}
/**
 * Create a Stripe Checkout Session for a Support Plan subscription.
 *
 * Two line items are created:
 * 1. The plan price (recurring, using the provided Stripe Price ID).
 * 2. The Platform Service Fee as a separate "Service Fee" line item.
 *
 * The service fee is a one-time charge added at the first billing cycle.
 * For recurring subscriptions, Stripe invoices will add the fee via
 * `invoice.payment_succeeded` webhooks.
 *
 * @param stripe  - Stripe SDK instance.
 * @param options - Checkout options.
 * @returns A CheckoutSession with the hosted URL and session ID.
 */
export declare function createCheckoutSession(stripe: Pick<Stripe, 'checkout'>, options: CheckoutOptions): Promise<CheckoutSession>;
/**
 * Create a Stripe Billing Portal session for managing an existing subscription.
 *
 * The portal allows customers to:
 * - Update payment methods
 * - View invoice history
 * - Cancel or reactivate their subscription
 * - Download receipts
 *
 * @param stripe           - Stripe SDK instance.
 * @param stripeCustomerId - The customer's Stripe Customer ID.
 * @param returnUrl        - URL to redirect to after leaving the portal.
 * @returns The Stripe-hosted billing portal URL.
 */
export declare function createCustomerPortalSession(stripe: Pick<Stripe, 'billingPortal'>, stripeCustomerId: string, returnUrl: string): Promise<string>;
//# sourceMappingURL=checkout.d.ts.map