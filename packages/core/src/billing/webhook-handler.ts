/**
 * @file billing/webhook-handler.ts
 * @description Stripe Webhook Handler for the Volqan subscription billing system.
 *
 * Handles subscription lifecycle events from Stripe and automatically manages
 * license state so that no manual intervention is ever required to activate,
 * refresh, or revoke attribution removal entitlement.
 *
 * Supported events:
 *   customer.subscription.created  → activateLicense
 *   customer.subscription.updated  → refreshLicense
 *   customer.subscription.deleted  → revokeLicense
 *   invoice.payment_failed         → startGracePeriod (7 days)
 *   invoice.payment_succeeded      → extendLicense
 *
 * Stripe signature verification is performed on every incoming request.
 * Unverified requests are rejected with HTTP 400.
 */

import type Stripe from 'stripe';
import { invalidateLicenseCache, seedLicenseCache, type LicenseStatus } from '../license/checker.js';

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
// Constants
// ---------------------------------------------------------------------------

/** Grace period granted when a payment fails (days). */
const GRACE_PERIOD_DAYS = 7;

// ---------------------------------------------------------------------------
// Webhook handler factory
// ---------------------------------------------------------------------------

/**
 * Create a Stripe webhook handler bound to a specific Stripe instance and
 * license store implementation.
 *
 * @example
 * ```ts
 * // app/api/billing/stripe/route.ts  (Next.js App Router)
 * import Stripe from 'stripe';
 * import { createWebhookHandler } from '@volqan/core/billing';
 * import { prismaLicenseStore } from '@/lib/license-store';
 *
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 * const handler = createWebhookHandler(stripe, prismaLicenseStore);
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
  stripe: Pick<Stripe, 'webhooks'>,
  licenseStore: LicenseStore,
) {
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
      await routeStripeEvent(event, licenseStore);
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
): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(
        event.data.object as Stripe.Subscription,
        store,
      );
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
        store,
      );
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
        store,
      );
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(
        event.data.object as Stripe.Invoice,
        store,
      );
      break;

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(
        event.data.object as Stripe.Invoice,
        store,
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
 * customer.subscription.created → activateLicense
 *
 * A new subscriber has purchased a Support Plan.
 * Create the license record and seed the cache with active status.
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  store: LicenseStore,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);
  const plan = resolveInterval(subscription);
  const expiresAt = resolveExpiresAt(subscription);

  console.info(
    `[volqan/billing] Activating license for customer ${customerId} (plan: ${plan})`,
  );

  const { installationId } = await store.activateLicense(
    customerId,
    subscription.id,
    plan,
    expiresAt,
  );

  await updateLicenseCache(installationId, {
    attributionRemoved: true,
    plan,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: 'active',
  });
}

/**
 * customer.subscription.updated → refreshLicense
 *
 * Subscription was modified (e.g. plan change, renewal date shift).
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  store: LicenseStore,
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

  await updateLicenseCache(installationId, {
    attributionRemoved: isActive,
    plan,
    expiresAt: expiresAt?.toISOString() ?? null,
    licenseState: subscription.status,
  });
}

/**
 * customer.subscription.deleted → revokeLicense
 *
 * Subscription has been cancelled and has expired.
 * Attribution removal entitlement is immediately revoked.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  store: LicenseStore,
): Promise<void> {
  const customerId = resolveCustomerId(subscription.customer);

  console.info(
    `[volqan/billing] Revoking license for customer ${customerId}`,
  );

  const { installationId } = await store.revokeLicense(
    customerId,
    subscription.id,
  );

  await updateLicenseCache(installationId, {
    attributionRemoved: false,
    licenseState: 'revoked',
  });
}

/**
 * invoice.payment_failed → startGracePeriod (7 days)
 *
 * Payment failed. Grant a 7-day grace period before revoking attribution
 * removal, giving the customer time to update their payment method.
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  store: LicenseStore,
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
 * invoice.payment_succeeded → extendLicense
 *
 * Successful renewal payment. Extend the license through the next period.
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  store: LicenseStore,
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
