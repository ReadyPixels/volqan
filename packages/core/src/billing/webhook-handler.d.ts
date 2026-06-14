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
import { type SubscriptionStore } from './plans/subscription-manager.js';
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
    body: {
        received?: boolean;
        error?: string;
    };
}
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
    activateLicense(customerId: string, subscriptionId: string, plan: 'monthly' | 'yearly', expiresAt: Date | null): Promise<{
        installationId: string;
    }>;
    /**
     * Update an existing license to reflect a subscription change (e.g. plan upgrade).
     */
    refreshLicense(customerId: string, subscriptionId: string, plan: 'monthly' | 'yearly', expiresAt: Date | null): Promise<{
        installationId: string;
    }>;
    /**
     * Mark a license as revoked (subscription cancelled / deleted).
     */
    revokeLicense(customerId: string, subscriptionId: string): Promise<{
        installationId: string;
    }>;
    /**
     * Enter a grace period — the subscription is past-due but attribution
     * removal remains active for the specified number of days.
     */
    startGracePeriod(customerId: string, invoiceId: string, graceDays: number): Promise<{
        installationId: string;
    }>;
    /**
     * Extend the license after a successful invoice payment.
     */
    extendLicense(customerId: string, invoiceId: string, expiresAt: Date | null): Promise<{
        installationId: string;
    }>;
}
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
export declare function createWebhookHandler(stripeOrOptions: Pick<Stripe, 'webhooks'> | WebhookHandlerOptions, legacyLicenseStore?: LicenseStore): (req: WebhookRequest) => Promise<WebhookResponse>;
//# sourceMappingURL=webhook-handler.d.ts.map