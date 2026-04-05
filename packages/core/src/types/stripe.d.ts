/**
 * @file types/stripe.d.ts
 * @description Ambient type declarations for the `stripe` package.
 *
 * Stripe is a runtime-only (optional) dependency used by the billing module.
 * This declaration file provides just enough type coverage for the Volqan
 * checkout and webhook-handler modules to compile without installing the
 * full `@types/stripe` / `stripe` package.
 */

declare module 'stripe' {
  namespace Stripe {
    // -------------------------------------------------------------------
    // Checkout
    // -------------------------------------------------------------------
    namespace Checkout {
      interface SessionCreateParams {
        mode?: string;
        customer?: string;
        customer_email?: string;
        line_items?: Array<{
          price?: string;
          price_data?: {
            currency: string;
            product_data: { name: string; description?: string };
            unit_amount: number;
            recurring?: { interval: string };
          };
          quantity?: number;
        }>;
        subscription_data?: {
          metadata?: Record<string, string>;
          [key: string]: unknown;
        };
        success_url?: string;
        cancel_url?: string;
        allow_promotion_codes?: boolean;
        billing_address_collection?: string;
        metadata?: Record<string, string>;
        [key: string]: unknown;
      }

      interface Session {
        id: string;
        url: string | null;
        mode: string | null;
        metadata: Record<string, string> | null;
        client_reference_id: string | null;
        customer: string | { id: string } | null;
        subscription: string | { id: string } | null;
        [key: string]: unknown;
      }
    }

    // -------------------------------------------------------------------
    // Subscriptions
    // -------------------------------------------------------------------
    interface Subscription {
      id: string;
      status: string;
      metadata: Record<string, string> | null;
      customer: string | Customer | DeletedCustomer | null;
      items: {
        data: Array<{
          price: {
            id: string;
            recurring?: { interval: string } | null;
            [key: string]: unknown;
          };
          [key: string]: unknown;
        }>;
      };
      current_period_start: number;
      current_period_end: number;
      cancel_at_period_end?: boolean;
      [key: string]: unknown;
    }

    // -------------------------------------------------------------------
    // Invoices
    // -------------------------------------------------------------------
    interface Invoice {
      id: string;
      customer: string | Customer | DeletedCustomer | null;
      subscription: string | { id: string } | null;
      amount_paid?: number;
      currency?: string;
      status_transitions?: {
        paid_at?: number | null;
        [key: string]: unknown;
      };
      lines: {
        data: Array<{
          description?: string | null;
          amount: number;
          quantity?: number | null;
          period?: { start: number; end: number };
          [key: string]: unknown;
        }>;
      };
      [key: string]: unknown;
    }

    // -------------------------------------------------------------------
    // Customers
    // -------------------------------------------------------------------
    interface Customer {
      id: string;
      [key: string]: unknown;
    }

    interface DeletedCustomer {
      id: string;
      deleted: true;
      [key: string]: unknown;
    }

    // -------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------
    interface Event {
      id: string;
      type: string;
      data: { object: Record<string, unknown> };
      [key: string]: unknown;
    }

    // -------------------------------------------------------------------
    // Billing Portal
    // -------------------------------------------------------------------
    namespace BillingPortal {
      interface SessionCreateParams {
        customer: string;
        return_url?: string;
        [key: string]: unknown;
      }

      interface Session {
        url: string;
        [key: string]: unknown;
      }
    }

    // -------------------------------------------------------------------
    // Webhook helpers
    // -------------------------------------------------------------------
    interface WebhookEndpointCreateParams {
      [key: string]: unknown;
    }
  }

  class Stripe {
    constructor(apiKey: string, config?: Record<string, unknown>);
    checkout: {
      sessions: {
        create(params: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session>;
      };
    };
    billingPortal: {
      sessions: {
        create(params: Stripe.BillingPortal.SessionCreateParams): Promise<Stripe.BillingPortal.Session>;
      };
    };
    webhooks: {
      constructEvent(body: string | Buffer, sig: string, secret: string): Stripe.Event;
    };
    [key: string]: unknown;
  }

  export default Stripe;
  export { Stripe };
}
