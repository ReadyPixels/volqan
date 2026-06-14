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
// ---------------------------------------------------------------------------
// Subscription manager
// ---------------------------------------------------------------------------
/**
 * Get the active subscription for a user.
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns The user's active Subscription, or null.
 */
export async function getSubscription(store, userId) {
    return store.getSubscriptionByUserId(userId);
}
/**
 * Get a subscription by its Stripe subscription ID.
 *
 * @param store                  - Subscription store implementation.
 * @param stripeSubscriptionId   - Stripe subscription ID.
 * @returns The Subscription record, or null.
 */
export async function getSubscriptionByStripeId(store, stripeSubscriptionId) {
    return store.getSubscriptionByStripeId(stripeSubscriptionId);
}
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
export async function activateSubscription(store, userId, stripeData) {
    const subscription = await store.createSubscription({
        userId,
        planId: stripeData.planId,
        stripeSubscriptionId: stripeData.stripeSubscriptionId,
        stripeCustomerId: stripeData.stripeCustomerId,
        status: 'active',
        currentPeriodStart: stripeData.currentPeriodStart,
        currentPeriodEnd: stripeData.currentPeriodEnd,
        cancelAtPeriodEnd: false,
    });
    await store.grantAttributionRemoval(userId);
    console.info(`[volqan/subscription] Activated subscription ${stripeData.stripeSubscriptionId} for user ${userId}`);
    return subscription;
}
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
export async function cancelSubscription(store, userId) {
    const subscription = await store.getSubscriptionByUserId(userId);
    if (!subscription) {
        throw new Error(`[volqan/subscription] Cannot cancel: no subscription found for user ${userId}`);
    }
    const updated = await store.updateSubscription(subscription.stripeSubscriptionId, { cancelAtPeriodEnd: true });
    console.info(`[volqan/subscription] Scheduled cancellation at period end for user ${userId}`);
    return updated;
}
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
export async function reactivateSubscription(store, userId) {
    const subscription = await store.getSubscriptionByUserId(userId);
    if (!subscription) {
        throw new Error(`[volqan/subscription] Cannot reactivate: no subscription found for user ${userId}`);
    }
    const updated = await store.updateSubscription(subscription.stripeSubscriptionId, { cancelAtPeriodEnd: false, status: 'active' });
    console.info(`[volqan/subscription] Reactivated subscription for user ${userId}`);
    return updated;
}
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
export async function handleRenewal(store, stripeSubscriptionId, newPeriodStart, newPeriodEnd) {
    const updated = await store.updateSubscription(stripeSubscriptionId, {
        status: 'active',
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        cancelAtPeriodEnd: false,
    });
    console.info(`[volqan/subscription] Renewal processed for subscription ${stripeSubscriptionId}. ` +
        `New period ends: ${newPeriodEnd.toISOString()}`);
    return updated;
}
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
export async function handlePaymentFailed(store, stripeSubscriptionId) {
    const updated = await store.updateSubscription(stripeSubscriptionId, {
        status: 'past_due',
    });
    console.warn(`[volqan/subscription] Payment failed for subscription ${stripeSubscriptionId}. Status: past_due.`);
    return updated;
}
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
export async function handleCancellation(store, stripeSubscriptionId) {
    const subscription = await store.getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
        throw new Error(`[volqan/subscription] Cannot cancel: subscription ${stripeSubscriptionId} not found`);
    }
    const updated = await store.updateSubscription(stripeSubscriptionId, {
        status: 'canceled',
        cancelAtPeriodEnd: false,
    });
    // Immediately revoke attribution removal
    await store.revokeAttributionRemoval(subscription.userId);
    console.info(`[volqan/subscription] Subscription ${stripeSubscriptionId} canceled. ` +
        `Attribution removal revoked for user ${subscription.userId}.`);
    return updated;
}
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
export async function isAttributionRemoved(store, userId) {
    const subscription = await store.getSubscriptionByUserId(userId);
    if (!subscription)
        return false;
    return (subscription.status === 'active' || subscription.status === 'past_due');
}
/**
 * Record an invoice for a subscription (called on invoice.payment_succeeded).
 *
 * @param store          - Subscription store implementation.
 * @param subscriptionId - Internal subscription ID.
 * @param invoiceData    - Invoice fields from the Stripe webhook payload.
 */
export async function recordInvoice(store, subscriptionId, invoiceData) {
    return store.createInvoice({
        subscriptionId,
        ...invoiceData,
        status: 'paid',
    });
}
/**
 * Get the invoice history for a user's subscription.
 *
 * @param store  - Subscription store implementation.
 * @param userId - Volqan user ID.
 * @returns Array of invoices, most recent first. Empty array if no subscription.
 */
export async function getInvoiceHistory(store, userId) {
    const subscription = await store.getSubscriptionByUserId(userId);
    if (!subscription)
        return [];
    return store.getInvoicesBySubscriptionId(subscription.id);
}
//# sourceMappingURL=subscription-manager.js.map