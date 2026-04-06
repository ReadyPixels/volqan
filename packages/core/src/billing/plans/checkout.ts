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
import { calculateServiceFee } from '../fee-calculator.js';
import type { CheckoutSession } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Checkout session creation
// ---------------------------------------------------------------------------

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
export async function createCheckoutSession(
  stripe: Pick<Stripe, 'checkout'>,
  options: CheckoutOptions,
): Promise<CheckoutSession> {
  const {
    userId,
    planId,
    stripePriceId,
    planPriceCents,
    successUrl,
    cancelUrl,
    customerEmail,
    installationId,
    stripeCustomerId,
  } = options;

  if (!stripePriceId) {
    throw new Error(
      `[volqan/checkout] No Stripe Price ID configured for plan "${planId}". ` +
        'Set the price ID in your Volqan settings.',
    );
  }

  // Calculate the Platform Service Fee (subscription billing → label: "Service Fee")
  const serviceFeeCents = calculateServiceFee(planPriceCents, false);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',

    line_items: [
      // 1. The plan itself (recurring)
      {
        price: stripePriceId,
        quantity: 1,
      },
      // 2. Platform Service Fee — separate line item as required by ToS
      // Uses a one-time price so it appears on the first invoice.
      // Recurring fees are recorded via webhook after each renewal.
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service Fee',
            description:
              'Platform Service Fee — $0.50 flat + 10% of plan price. ' +
              'See volqan.link/terms for full fee disclosure.',
          },
          unit_amount: serviceFeeCents,
          recurring: {
            interval:
              planId === 'support-yearly' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],

    subscription_data: {
      metadata: {
        userId,
        planId,
        ...(installationId ? { installationId } : {}),
      },
    },

    success_url: successUrl,
    cancel_url: cancelUrl,

    // Pre-fill customer info
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : customerEmail
        ? { customer_email: customerEmail }
        : {}),

    // Allow promotion codes
    allow_promotion_codes: true,

    // Billing address collection for tax purposes
    billing_address_collection: 'auto',
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error(
      '[volqan/checkout] Stripe returned a checkout session without a URL.',
    );
  }

  return {
    url: session.url,
    sessionId: session.id,
  };
}

// ---------------------------------------------------------------------------
// Customer portal session
// ---------------------------------------------------------------------------

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
export async function createCustomerPortalSession(
  stripe: Pick<Stripe, 'billingPortal'>,
  stripeCustomerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}
