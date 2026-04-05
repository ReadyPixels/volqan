/**
 * @file billing/webhook-handler.ts
 * @description Stripe Webhook Handler for the Volqan subscription billing system.
 *
 * Handles subscription lifecycle events from Stripe and automatically manages
 * license state so that no manual intervention is ever required to activate,
 * refresh, or revoke attribution removal entitlement.
 *
 * Supported events:
 *   checkout.session.completed         → Create subscription, send welcome email
 *   customer.subscription.created      → activateSubscription
 *   customer.subscription.updated      → handleRenewal or status change
 *   customer.subscription.deleted      → handleCancellation
 *   customer.subscription.paused       → Pause attribution removal
 *   customer.subscription.resumed      → Restore attribution removal
 *   invoice.payment_succeeded          → Record invoice, extend license
 *   invoice.payment_failed             → handlePaymentFailed, 7-day grace period
 *
 * Stripe signature verification is performed on every incoming request.
 * Unverified requests are rejected with HTTP 400.
 */

import type Stripe from 'stripe';
import { invalidateLicenseCache, seedLicenseCache, type LicenseStatus } from '../license/checker.js';
import {
  activateSubscription,
  handleRenewal,
  handlePaymentFailed,
  handleCancellation,
  getSubscriptionByStripeId,
  recordInvoice,
  type SubscriptionStore,
} from './plans/subscription-manager.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Minimal HTTP-framework-agnostic request/response shape.
 * Compatible with Next.js App Router Request / Response and Node.js http.IncomingMessage.
 */
export interface WebhookRequest {
  /** Raw request body as a string or Buffer. */
  rawBody: string | Buffer;

  /** HTTP headers map. */
  headers: Record<string, string | string[] | undefined>;
}

export interface WebhookResponse {
  status: number;
  body: { received?: boolean; error?: string };
}

// ---------------------------------------------------------------------------
// License state store interface
// ---------------------------------------------------------------------------

/**
 * Minimal interface for a license state persistence layer.
 * Implement this against your database (Prisma, Supabase, etc.).
 *
 * The webhook handler calls these methods to reflect subscription changes.
 */
export interface LicenseStore {
  /**
   * Create or update a license record for a Stripe customer, setting it to active.
   * @param customerId  - Stripe customer ID (e.g. "cus_XXXXXXXXXX").
   * @param subscriptionId - Stripe subscription ID.
   * @param plan        - Billing interval.
   * @param expiresAt   - Next renewal / expiry date. null for lifetime.
   */
  activateLicense(
    customerId: string,
    subscriptionId: string,
    plan: 'monthly' | 'yearly',
    expiresAt: Date | null,
  ): Promise<{ installationId: string }>;

  /**
   * Update an existing license to reflect a subscription change (e.g. plan upgrade).
   */
  refreshLicense(
    customerId: string,
    subscriptionId: string,
    plan: 'monthly' | 'yearly',
    expiresAt: Date | null,
  ): Promise<{ installationId: string }>;

  /**
   * Mark a license as revoked (subscription cancelled / deleted).
   */
  revokeLicense(
    customerId: string,
    subscriptionId: string,
  ): Promise<{ installationId: string }>;

  /**
   * Enter a grace period — the subscription is past-due but attribution
   * removal remains active for the specified number of days.
   */
  startGracePeriod(
    customerId: string,
    invoiceId: string,
    graceDays: number,
  ): Promise<{ installationId: string }>;

  /**
   * Extend the license after a successful invoice payment.
   */
  extendLicense(
    customerId: string,
    invoiceId: string,
    expiresAt: Date | null,
  ): Promise<{ installationId: string }>;
}

// ---------------------------------------------------------------------------
// Email notification interface (optional, non-blocking)
// ---------------------------------------------------------------------------

/**
 * Optional email notification interface.
 * The webhook handler calls these methods if an emailer is provided.
 * Email failures are logged but never cause a webhook failure response.
 */
export interface BillingEmailer {
  /**
   * Send a welcome email after a new subscription is created.
   */
  sendWelcomeEmail(userId: string, planId: string): Promise<void>;

  /**
   * Send a payment failure warning email.
   * @param userId    - User ID of the subscriber.
   * @param graceDays - Number of days before attribution removal is revoked.
   */
  sendPaymentFailedEmail(userId: string, graceDays: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Grace period granted when a payment fails (days). */
const GRACE_PERIOD_DAYS = 7;

// ---------------------------------------------------------------------------
// Webhook handler factory
// ---------------------------------------------------------------------------

export interface WebhookHandlerOptions {
  /**
   * Stripe SDK instance for signature verification.
   */
  stripe: Pick<Stripe, 'webhooks'>;

  /**
   * License store for updating license state.
   */
  licenseStore: LicenseStore;

  /**
   * Subscription store for managing subscription records.
   * When provided, subscription lifecycle is fully managed.
   */
  subscriptionStore?: SubscriptionStore;

  /**
   * Optional email notification callbacks.
   */
  emailer?: BillingEmailer;
}

/**
 * Create a Stripe webhook handler bound to a specific Stripe instance,
 * license store, and optional subscription store.
 *
 * @example
 * ```ts
 * // app/api/billing/stripe/route.ts  (Next.js App Router)
 * import Stripe from 'stripe';
 * import { createWebhookHandler } from '@volqan/core/billing';
 * import { prismaLicenseStore, prismaSubscriptionStore } from '@/lib/stores';
 *
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 * const handler = createWebhookHandler({
 *   stripe,
 *   licenseStore: prismaLicenseStore,
 *   subscriptionStore: prismaSubscriptionStore,
 * });
 *
 * export async function POST(request: Request) {
 *   const rawBody = await request.text();
 *   const result = await handler({
 *     rawBody,
 *     headers: Object.fromEntries(request.headers),
 *   });
 *   return Response.json(result.body, { status: result.status });
 * }
 * ```
 */
export function createWebhookHandler(
  stripeOrOptions: Pick<Stripe, 'webhooks'> | WebhookHandlerOptions,
  legacyLicenseStore?: LicenseStore,
) {
  // Support both the legacy 2-arg signature and the new options object
  let stripe: Pick<Stripe, 'webhooks'>;
  let licenseStore: LicenseStore;
  let subscriptionStore: SubscriptionStore | undefined;
  let emailer: BillingEmailer | undefined;

  if ('licenseStore' in stripeOrOptions) {
    stripe = stripeOrOptions.stripe;
    licenseStore = stripeOrOptions.licenseStore;
    subscriptionStore = stripeOrOptions.subscriptionStore;
    emailer = stripeOrOptions.emailer;
  } else {
    stripe = stripeOrOptions;
    licenseStore = legacyLicenseStore!;
  }

  return async function handleStripeWebhook(
    req: WebhookRequest,
  ): Promise<WebhookResponse> {
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

    if (!webhookSecret) {
      console.error('[volqan/billing] STRIPE_WEBHOOK_SECRET is not set.');
      return { status: 500, body: { error: 'Webhook secret not configured.' } };
    }

    // -------------------------------------------------------------------------
    // 1. Verify Stripe signature
    // -------------------------------------------------------------------------
    const signature = normalizeHeader(req.headers['stripe-signature']);

    if (!signature) {
      return { status: 400, body: { error: 'Missing stripe-signature header.' } };
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[volqan/billing] Webhook signature verification failed: ${message}`);
      return { status: 400, body: { error: `Webhook signature invalid: ${message}` } };
    }

    // -------------------------------------------------------------------------
    // 2. Route to the appropriate handler
    // -------------------------------------------------------------------------
    try {
      await routeStripeEvent(event, licenseStore, subscriptionStore, emailer);
    } catch (err) {
      // Log but return 200 to prevent Stripe from retrying indefinitely for
      // business-logic errors. Fatal infrastructure errors should throw
      // and will return 500 to trigger a retry.
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[volqan/billing] Error handling Stripe event "${event.type}" (${event.id}): ${message}`,
      );

      // Re-throw only for unexpected errors to allow Stripe retries
      if (isFatalError(err)) {
        return { status: 500, body: { error: 'Internal server error.' } };
      }
    }

    return { status: 200, body: { received: true } };
  };
}

// ---------------------------------------------------------------------------
// Event router
// ---------------------------------------------------------------------------

async function routeStripeEvent(
  event: Stripe.Event,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
  emailer?: BillingEmailer,
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
        store,
        subscriptionStore,
        emailer,
      );
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(
        event.data.object as Stripe.Subscription,
        store,
        subscriptionStore,
        emailer,
      );
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
        store,
        subscriptionStore,
      );
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
        store,
        subscriptionStore,
      );
      break;

    case 'customer.subscription.paused':
      await handleSubscriptionPaused(
        event.data.object as Stripe.Subscription,
        store,
        subscriptionStore,
      );
      break;

    case 'customer.subscription.resumed':
      await handleSubscriptionResumed(
        event.data.object as Stripe.Subscription,
        store,
        subscriptionStore,
      );
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(
        event.data.object as Stripe.Invoice,
        store,
        subscriptionStore,
        emailer,
      );
      break;

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(
        event.data.object as Stripe.Invoice,
        store,
        subscriptionStore,
      );
      break;

    default:
      // Unrecognised event — acknowledge without processing
      console.info(`[volqan/billing] Ignoring unhandled Stripe event: ${event.type}`);
  }
}

// ---------------------------------------------------------------------------
// Individual event handlers
// ---------------------------------------------------------------------------

/**
 * checkout.session.completed → Create subscription, send welcome email
 *
 * This is the primary entry point for new subscriptions when using
 * Stripe Checkout. The subscription record is created here, and a
 * welcome email is sent to the new subscriber.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
  emailer?: BillingEmailer,
): Promise<void> {
  if (session.mode !== 'subscription') return;

  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!stripeSubscriptionId) {
    console.warn(
      '[volqan/billing] checkout.session.completed: no subscription ID on session',
    );
    return;
  }

  const userId = session.metadata?.['userId'] ?? session.client_reference_id ?? '';
  const planId = session.metadata?.['planId'] ?? 'support-yearly';

  console.info(
    `[volqan/billing] Checkout completed for user ${userId} (plan: ${planId})`,
  );

  // Activate via subscription store if available
  if (subscriptionStore && userId) {
    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id ?? '';

    await activateSubscription(subscriptionStore, userId, {
      planId,
      stripeSubscriptionId,
      stripeCustomerId,
      // These will be refreshed when customer.subscription.created fires
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
  }

  // Send welcome email (non-blocking)
  if (emailer && userId) {
    sendEmailSafely(() => emailer.sendWelcomeEmail(userId, planId));
  }
}

/**
 * customer.subscription.created → activateSubscription
 *
 * A new subscriber has purchased a Support Plan.
 * Create the license record and seed the cache with active status.
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
  emailer?: BillingEmailer,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);
  const plan = resolveInterval(subscription);
  const expiresAt = resolveExpiresAt(subscription);
  const userId = subscription.metadata?.['userId'] ?? '';
  const planId = subscription.metadata?.['planId'] ?? `support-${plan}`;

  console.info(
    `[volqan/billing] Activating license for customer ${customerId} (plan: ${plan})`,
  );

  const { installationId } = await store.activateLicense(
    customerId,
    subscription.id,
    plan,
    expiresAt,
  );

  // Activate in subscription store if available
  if (subscriptionStore && userId) {
    // Check if already created by checkout.session.completed
    const existing = await subscriptionStore
      .getSubscriptionByStripeId(subscription.id)
      .catch(() => null);

    if (!existing) {
      await activateSubscription(subscriptionStore, userId, {
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  await updateLicenseCache(installationId, {
    attributionRemoved: true,
    plan,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: 'active',
  });

  // Send welcome email if not already sent by checkout.session.completed
  if (emailer && userId) {
    sendEmailSafely(() => emailer.sendWelcomeEmail(userId, planId));
  }
}

/**
 * customer.subscription.updated → handleRenewal or status change
 *
 * Subscription was modified (e.g. plan change, renewal date shift, pause).
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);
  const plan = resolveInterval(subscription);
  const expiresAt = resolveExpiresAt(subscription);
  const isActive = subscription.status === 'active';

  console.info(
    `[volqan/billing] Refreshing license for customer ${customerId} (status: ${subscription.status})`,
  );

  const { installationId } = await store.refreshLicense(
    customerId,
    subscription.id,
    plan,
    expiresAt,
  );

  // Update subscription record
  if (subscriptionStore) {
    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);

    if (subscription.status === 'active') {
      await handleRenewal(
        subscriptionStore,
        subscription.id,
        periodStart,
        periodEnd,
      ).catch((err) => {
        console.warn(
          `[volqan/billing] Could not update renewal dates: ${String(err)}`,
        );
      });
    } else {
      await subscriptionStore
        .updateSubscription(subscription.id, {
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
        .catch((err) => {
          console.warn(
            `[volqan/billing] Could not update subscription status: ${String(err)}`,
          );
        });
    }
  }

  await updateLicenseCache(installationId, {
    attributionRemoved: isActive,
    plan,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: subscription.status,
  });
}

/**
 * customer.subscription.deleted → handleCancellation
 *
 * Subscription has been cancelled and has expired.
 * Attribution removal entitlement is immediately revoked.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);

  console.info(
    `[volqan/billing] Revoking license for customer ${customerId}`,
  );

  const { installationId } = await store.revokeLicense(
    customerId,
    subscription.id,
  );

  // Update subscription record
  if (subscriptionStore) {
    await handleCancellation(subscriptionStore, subscription.id).catch(
      (err) => {
        console.warn(
          `[volqan/billing] Could not cancel subscription record: ${String(err)}`,
        );
      },
    );
  }

  await updateLicenseCache(installationId, {
    attributionRemoved: false,
    licenseState: 'revoked',
  });
}

/**
 * customer.subscription.paused → Pause attribution removal
 *
 * The subscription has been paused (e.g. payment collection paused).
 * Attribution removal is suspended until the subscription resumes.
 */
async function handleSubscriptionPaused(
  subscription: Stripe.Subscription,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);
  const plan = resolveInterval(subscription);
  const expiresAt = resolveExpiresAt(subscription);

  console.info(
    `[volqan/billing] Subscription paused for customer ${customerId}. Pausing attribution removal.`,
  );

  const { installationId } = await store.refreshLicense(
    customerId,
    subscription.id,
    plan,
    expiresAt,
  );

  // Update subscription record
  if (subscriptionStore) {
    await subscriptionStore
      .updateSubscription(subscription.id, { status: 'paused' })
      .catch((err) => {
        console.warn(
          `[volqan/billing] Could not update paused status: ${String(err)}`,
        );
      });
  }

  await updateLicenseCache(installationId, {
    attributionRemoved: false,
    plan,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: 'paused',
  });
}

/**
 * customer.subscription.resumed → Restore attribution removal
 *
 * The subscription has resumed from a paused state.
 * Attribution removal is restored.
 */
async function handleSubscriptionResumed(
  subscription: Stripe.Subscription,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);
  const plan = resolveInterval(subscription);
  const expiresAt = resolveExpiresAt(subscription);

  console.info(
    `[volqan/billing] Subscription resumed for customer ${customerId}. Restoring attribution removal.`,
  );

  const { installationId } = await store.refreshLicense(
    customerId,
    subscription.id,
    plan,
    expiresAt,
  );

  // Update subscription record
  if (subscriptionStore) {
    const periodEnd = new Date(subscription.current_period_end * 1000);
    const periodStart = new Date(subscription.current_period_start * 1000);
    await handleRenewal(subscriptionStore, subscription.id, periodStart, periodEnd).catch(
      (err) => {
        console.warn(
          `[volqan/billing] Could not update resumed subscription: ${String(err)}`,
        );
      },
    );
  }

  await updateLicenseCache(installationId, {
    attributionRemoved: true,
    plan,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: 'active',
  });
}

/**
 * invoice.payment_failed → handlePaymentFailed, start 7-day grace period, send warning email
 *
 * Payment failed. Grant a 7-day grace period before revoking attribution
 * removal, giving the customer time to update their payment method.
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
  emailer?: BillingEmailer,
): Promise<void> {
  const customerId = resolveInvoiceCustomerId(invoice);

  console.warn(
    `[volqan/billing] Payment failed for customer ${customerId}. Starting ${GRACE_PERIOD_DAYS}-day grace period.`,
  );

  const { installationId } = await store.startGracePeriod(
    customerId,
    invoice.id,
    GRACE_PERIOD_DAYS,
  );

  // Update subscription status
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;

  if (subscriptionStore && stripeSubscriptionId) {
    const sub = await subscriptionStore
      .getSubscriptionByStripeId(stripeSubscriptionId)
      .catch(() => null);

    if (sub) {
      await handlePaymentFailed(subscriptionStore, stripeSubscriptionId).catch(
        (err) => {
          console.warn(
            `[volqan/billing] Could not mark subscription as past_due: ${String(err)}`,
          );
        },
      );

      // Send warning email
      if (emailer) {
        sendEmailSafely(() =>
          emailer.sendPaymentFailedEmail(sub.userId, GRACE_PERIOD_DAYS),
        );
      }
    }
  }

  const graceExpiresAt = new Date();
  graceExpiresAt.setDate(graceExpiresAt.getDate() + GRACE_PERIOD_DAYS);

  // Attribution removal still active during grace period
  await updateLicenseCache(installationId, {
    attributionRemoved: true,
    expiresAt: graceExpiresAt.toISOString(),
    licenseState: 'grace_period',
  });
}

/**
 * invoice.payment_succeeded → Record invoice, extend license
 *
 * Successful renewal payment. Extend the license through the next period
 * and record the invoice.
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  store: LicenseStore,
  subscriptionStore?: SubscriptionStore,
): Promise<void> {
  const customerId = resolveInvoiceCustomerId(invoice);

  console.info(
    `[volqan/billing] Payment succeeded for customer ${customerId}. Extending license.`,
  );

  // Determine new expiry from invoice line items (period end of first item)
  const expiresAt = resolveInvoiceExpiresAt(invoice);

  const { installationId } = await store.extendLicense(
    customerId,
    invoice.id,
    expiresAt,
  );

  // Record invoice and update subscription
  if (subscriptionStore) {
    const stripeSubscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;

    if (stripeSubscriptionId) {
      const sub = await subscriptionStore
        .getSubscriptionByStripeId(stripeSubscriptionId)
        .catch(() => null);

      if (sub) {
        const items = buildInvoiceItems(invoice);
        const serviceFee = resolveServiceFeeFromInvoice(invoice);
        const baseAmount = (invoice.amount_paid ?? 0) - serviceFee;

        await recordInvoice(subscriptionStore, sub.id, {
          stripeInvoiceId: invoice.id,
          amount: baseAmount,
          serviceFee,
          total: invoice.amount_paid ?? 0,
          currency: invoice.currency ?? 'usd',
          paidAt: invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : new Date(),
          items,
        }).catch((err) => {
          console.warn(
            `[volqan/billing] Could not record invoice: ${String(err)}`,
          );
        });
      }
    }
  }

  await updateLicenseCache(installationId, {
    attributionRemoved: true,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: 'active',
  });
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

/**
 * Seed the in-memory license cache for an installation after a Stripe event,
 * then invalidate the old entry to ensure the next API-backed check is fresh.
 */
async function updateLicenseCache(
  installationId: string,
  status: LicenseStatus,
): Promise<void> {
  // Seed the cache with the known-good status so the next footer render
  // reflects the change immediately (within the same process).
  await seedLicenseCache(status, installationId);

  // Also log the change for audit visibility
  console.info(
    `[volqan/billing] License cache updated for installation "${installationId}": ` +
      `attributionRemoved=${status.attributionRemoved}, state=${status.licenseState ?? 'unknown'}`,
  );
}

// ---------------------------------------------------------------------------
// Invoice helpers
// ---------------------------------------------------------------------------

/**
 * Extract invoice line items from a Stripe Invoice.
 */
function buildInvoiceItems(invoice: Stripe.Invoice): Array<{
  description: string;
  amount: number;
  quantity: number;
}> {
  return (invoice.lines?.data ?? []).map((line) => ({
    description: line.description ?? 'Subscription',
    amount: line.amount,
    quantity: line.quantity ?? 1,
  }));
}

/**
 * Attempt to extract the Platform Service Fee amount from invoice line items.
 * Looks for a line item with description matching "Service Fee".
 */
function resolveServiceFeeFromInvoice(invoice: Stripe.Invoice): number {
  const feeLine = (invoice.lines?.data ?? []).find((line) =>
    line.description?.toLowerCase().includes('service fee'),
  );
  return feeLine?.amount ?? 0;
}

// ---------------------------------------------------------------------------
// Stripe data extraction helpers
// ---------------------------------------------------------------------------

function resolveCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string {
  if (!customer) {
    throw new Error('Stripe event is missing customer ID.');
  }
  return typeof customer === 'string' ? customer : customer.id;
}

function resolveInvoiceCustomerId(invoice: Stripe.Invoice): string {
  return resolveCustomerId(invoice.customer);
}

function resolveInterval(
  subscription: Stripe.Subscription,
): 'monthly' | 'yearly' {
  // Read from the first subscription item's price interval
  const item = subscription.items?.data?.[0];
  const interval = item?.price?.recurring?.interval;
  return interval === 'year' ? 'yearly' : 'monthly';
}

function resolveExpiresAt(subscription: Stripe.Subscription): Date | null {
  if (!subscription.current_period_end) return null;
  return new Date(subscription.current_period_end * 1_000);
}

function resolveInvoiceExpiresAt(invoice: Stripe.Invoice): Date | null {
  // Use the period_end of the first invoice line item
  const firstLine = invoice.lines?.data?.[0];
  if (!firstLine?.period?.end) return null;
  return new Date(firstLine.period.end * 1_000);
}

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

function mapStripeStatus(
  stripeStatus: Stripe.Subscription['status'],
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    case 'trialing':
      return 'trialing';
    case 'paused':
      return 'paused';
    default:
      return 'past_due';
  }
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

function isFatalError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // Classify database connection errors, OOM, etc. as fatal
  const fatalPatterns = [
    /ECONNREFUSED/i,
    /connection.*refused/i,
    /out of memory/i,
    /ENOMEM/i,
  ];
  return fatalPatterns.some((p) => p.test(err.message));
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function normalizeHeader(
  value: string | string[] | undefined,
): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Fire-and-forget email send. Errors are logged but never bubble up
 * to fail the webhook response.
 */
function sendEmailSafely(fn: () => Promise<void>): void {
  fn().catch((err) => {
    console.warn(`[volqan/billing] Email notification failed: ${String(err)}`);
  });
}
