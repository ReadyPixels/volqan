/**
 * @file billing/plans/subscription-manager.ts
 * @description Subscription lifecycle management for Volqan Support Plans.
 *
 * This module provides the full subscription state machine:
 *   purchase → active → (renew | payment_fail | cancel | pause | resume)
 *
 * All persistence is delegated to a SubscriptionStore interface so this
 * module stays database-agnostic. Implement SubscriptionStore against your
 * ORM (Prisma, Drizzle, etc.) and inject it at call sites.
 *
 * Attribution removal follows subscription status:
 *   active    → attribution removed
 *   past_due  → attribution removed (7-day grace period from webhook)
 *   paused    → attribution shown
 *   canceled  → attribution shown, license revoked
 */
import type { Subscription, SubscriptionStatus, Invoice, InvoiceItem } from './types.js';
/**
 * Persistence interface for subscription state.
 *
 * Implement this against your database. All methods are async and throw on
 * unrecoverable errors (connection failures, constraint violations, etc.).
 */
export interface SubscriptionStore {
    /**
     * Get the active subscription for a user.
     * Returns null if the user has no subscription.
     */
    getSubscriptionByUserId(userId: string): Promise<Subscription | null>;
    /**
     * Get a subscription by its Stripe subscription ID.
     * Returns null if not found.
     */
    getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null>;
    /**
     * Create a new subscription record.
     * Called when `checkout.session.completed` or
     * `customer.subscription.created` fires for the first time.
     */
    createSubscription(data: {
        userId: string;
        planId: string;
        stripeSubscriptionId: string;
        stripeCustomerId: string;
        status: SubscriptionStatus;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
    }): Promise<Subscription>;
    /**
     * Update an existing subscription record.
     * Partial updates — only provided fields are changed.
     */
    updateSubscription(stripeSubscriptionId: string, patch: Partial<Pick<Subscription, 'status' | 'planId' | 'currentPeriodStart' | 'currentPeriodEnd' | 'cancelAtPeriodEnd'>>): Promise<Subscription>;
    /**
     * Record an invoice for a subscription.
     */
    createInvoice(data: {
        subscriptionId: string;
        stripeInvoiceId: string;
        amount: number;
        serviceFee: number;
        total: number;
        currency: string;
        status: 'paid' | 'open' | 'void' | 'uncollectible';
        paidAt: Date | null;
        items: InvoiceItem[];
    }): Promise<Invoice>;
    /**
     * Get all invoices for a subscription (most recent first).
     */
    getInvoicesBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
    /**
     * Remove (or mark as inactive) the attribution removal entitlement for a user.
     */
    revokeAttributionRemoval(userId: string): Promise<void>;
    /**
     * Restore the attribution removal entitlement for a user.
     */
    grantAttributionRemoval(userId: string): Promise<void>;
}
/**
 * Get the active subscription for a user.
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns The user's active Subscription, or null.
 */
export declare function getSubscription(store: SubscriptionStore, userId: string): Promise<Subscription | null>;
/**
 * Get a subscription by its Stripe subscription ID.
 *
 * @param store                  - Subscription store implementation.
 * @param stripeSubscriptionId   - Stripe subscription ID.
 * @returns The Subscription record, or null.
 */
export declare function getSubscriptionByStripeId(store: SubscriptionStore, stripeSubscriptionId: string): Promise<Subscription | null>;
/**
 * Activate a new subscription from Stripe webhook data.
 *
 * Called after `checkout.session.completed` or
 * `customer.subscription.created`. Creates the subscription record and
 * grants attribution removal.
 *
 * @param store      - Subscription store implementation.
 * @param userId     - Volqan user ID (from Stripe metadata).
 * @param stripeData - Stripe subscription fields.
 * @returns The newly created Subscription.
 */
export declare function activateSubscription(store: SubscriptionStore, userId: string, stripeData: {
    planId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}): Promise<Subscription>;
/**
 * Cancel a subscription at the end of the current billing period.
 *
 * Attribution removal remains active until the period ends. The actual
 * revocation happens when `customer.subscription.deleted` fires.
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns The updated Subscription.
 */
export declare function cancelSubscription(store: SubscriptionStore, userId: string): Promise<Subscription>;
/**
 * Reactivate a subscription that was scheduled for cancellation.
 *
 * Clears the `cancel_at_period_end` flag. The subscription continues as
 * normal at the next renewal date.
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns The updated Subscription.
 */
export declare function reactivateSubscription(store: SubscriptionStore, userId: string): Promise<Subscription>;
/**
 * Update period dates after a successful renewal.
 *
 * Called when `customer.subscription.updated` fires after a successful
 * invoice payment and the period dates have advanced.
 *
 * @param store                  - Subscription store implementation.
 * @param stripeSubscriptionId   - Stripe subscription ID.
 * @param newPeriodStart         - New billing period start.
 * @param newPeriodEnd           - New billing period end.
 * @returns The updated Subscription.
 */
export declare function handleRenewal(store: SubscriptionStore, stripeSubscriptionId: string, newPeriodStart: Date, newPeriodEnd: Date): Promise<Subscription>;
/**
 * Mark a subscription as past_due after a failed payment.
 *
 * Attribution removal remains active during the 7-day grace period
 * (managed by the webhook handler via the license cache).
 *
 * @param store                  - Subscription store implementation.
 * @param stripeSubscriptionId   - Stripe subscription ID.
 * @returns The updated Subscription.
 */
export declare function handlePaymentFailed(store: SubscriptionStore, stripeSubscriptionId: string): Promise<Subscription>;
/**
 * Handle subscription deletion / cancellation from Stripe.
 *
 * Sets status to canceled and immediately revokes attribution removal for
 * the subscription owner.
 *
 * @param store                  - Subscription store implementation.
 * @param stripeSubscriptionId   - Stripe subscription ID.
 * @returns The updated Subscription.
 */
export declare function handleCancellation(store: SubscriptionStore, stripeSubscriptionId: string): Promise<Subscription>;
/**
 * Check whether a user has an active Support Plan that permits attribution removal.
 *
 * Attribution is considered removed when:
 *   - The subscription status is "active", OR
 *   - The subscription status is "past_due" (7-day grace period)
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns true if attribution removal is currently permitted.
 */
export declare function isAttributionRemoved(store: SubscriptionStore, userId: string): Promise<boolean>;
/**
 * Record an invoice for a subscription (called on invoice.payment_succeeded).
 *
 * @param store          - Subscription store implementation.
 * @param subscriptionId - Internal subscription ID.
 * @param invoiceData    - Invoice fields from the Stripe webhook payload.
 */
export declare function recordInvoice(store: SubscriptionStore, subscriptionId: string, invoiceData: {
    stripeInvoiceId: string;
    amount: number;
    serviceFee: number;
    total: number;
    currency: string;
    paidAt: Date | null;
    items: InvoiceItem[];
}): Promise<Invoice>;
/**
 * Get the invoice history for a user's subscription.
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns Array of invoices, most recent first. Empty array if no subscription.
 */
export declare function getInvoiceHistory(store: SubscriptionStore, userId: string): Promise<Invoice[]>;
//# sourceMappingURL=subscription-manager.d.ts.map