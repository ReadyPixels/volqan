/**
 * @file billing/plans/types.ts
 * @description Type definitions for the Volqan Support Plan subscription system.
 *
 * These types model the full subscription lifecycle: plans, subscriptions,
 * invoices, and checkout sessions, all mapped to Stripe data structures.
 */

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

/**
 * A billable support plan offered by the framework owner.
 */
export interface Plan {
  /** Stable internal plan identifier (e.g. "support-yearly"). */
  id: string;

  /** Human-readable plan name (e.g. "Support Plan — Yearly"). */
  name: string;

  /** Short description shown in plan selection UI. */
  description: string;

  /** Billing interval. */
  interval: 'yearly' | 'monthly';

  /**
   * Plan price in cents.
   * For monthly, this is the computed monthly price.
   * For yearly, this is the full annual price.
   */
  price: number;

  /** ISO 4217 currency code, always "usd". */
  currency: string;

  /**
   * Stripe Price ID (e.g. "price_XXXXXXXXXX").
   * Populated at runtime from environment / settings.
   */
  stripePriceId: string;

  /** Ordered list of feature strings displayed on plan cards. */
  features: string[];
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/** Possible Stripe subscription statuses. */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'paused';

/**
 * A subscriber's active (or historical) subscription record.
 */
export interface Subscription {
  /** Internal database ID. */
  id: string;

  /** ID of the Volqan user who holds this subscription. */
  userId: string;

  /** Internal plan ID (e.g. "support-yearly"). */
  planId: string;

  /** Stripe Subscription ID (e.g. "sub_XXXXXXXXXX"). */
  stripeSubscriptionId: string;

  /** Stripe Customer ID (e.g. "cus_XXXXXXXXXX"). */
  stripeCustomerId: string;

  /** Current subscription status. */
  status: SubscriptionStatus;

  /** Start of the current billing period (UTC). */
  currentPeriodStart: Date;

  /** End of the current billing period (UTC). */
  currentPeriodEnd: Date;

  /** If true, subscription will not renew at period end. */
  cancelAtPeriodEnd: boolean;

  /** When the subscription record was first created (UTC). */
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

/** Possible Stripe invoice statuses. */
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

/**
 * A single line item on an invoice.
 */
export interface InvoiceItem {
  /** Human-readable line item description. */
  description: string;

  /** Amount in cents. */
  amount: number;

  /** Quantity multiplier. */
  quantity: number;
}

/**
 * A billing invoice associated with a subscription.
 */
export interface Invoice {
  /** Internal database ID. */
  id: string;

  /** ID of the subscription this invoice belongs to. */
  subscriptionId: string;

  /** Stripe Invoice ID (e.g. "in_XXXXXXXXXX"). */
  stripeInvoiceId: string;

  /** Plan / subscription subtotal in cents (before service fee). */
  amount: number;

  /** Platform Service Fee charged on this invoice, in cents. */
  serviceFee: number;

  /** Total amount charged (amount + serviceFee), in cents. */
  total: number;

  /** ISO 4217 currency code. */
  currency: string;

  /** Invoice status. */
  status: InvoiceStatus;

  /** When the invoice was paid (UTC). null if unpaid. */
  paidAt: Date | null;

  /** Ordered list of line items. */
  items: InvoiceItem[];
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Result of creating a Stripe Checkout Session.
 */
export interface CheckoutSession {
  /** Stripe-hosted checkout URL to redirect the user to. */
  url: string;

  /** Stripe Checkout Session ID (e.g. "cs_XXXXXXXXXX"). */
  sessionId: string;
}
