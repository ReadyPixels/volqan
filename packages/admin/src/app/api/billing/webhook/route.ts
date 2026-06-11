import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { json, internalError } from '@/lib/api-helpers';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest): Promise<Response> {
  if (!WEBHOOK_SECRET) {
    console.error('[billing/webhook] STRIPE_WEBHOOK_SECRET not set');
    return json({ error: 'Webhook not configured.' }, 503);
  }

  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return json({ error: 'Missing stripe-signature header.' }, 400);
  }

  // Verify webhook signature (manual HMAC since we avoid importing stripe SDK)
  try {
    const isValid = await verifyStripeSignature(rawBody, signature, WEBHOOK_SECRET);
    if (!isValid) {
      return json({ error: 'Invalid webhook signature.' }, 400);
    }
  } catch {
    return json({ error: 'Signature verification failed.' }, 400);
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          customer?: string;
          subscription?: string;
          metadata?: { userId?: string; planId?: string };
        };
        if (session.subscription && session.customer) {
          await db.installation.updateMany({
            data: {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              planId: session.metadata?.planId ?? null,
              licenseStatus: 'active',
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as {
          id: string;
          status: string;
          cancel_at_period_end: boolean;
          metadata?: { planId?: string };
        };
        await db.installation.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            licenseStatus: ['active', 'past_due'].includes(sub.status) ? 'active' : sub.status,
            planId: sub.metadata?.planId ?? undefined,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as { id: string };
        await db.installation.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { licenseStatus: 'canceled' },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const inv = event.data.object as { subscription?: string };
        if (inv.subscription) {
          await db.installation.updateMany({
            where: { stripeSubscriptionId: inv.subscription },
            data: { licenseStatus: 'active' },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as { subscription?: string };
        if (inv.subscription) {
          await db.installation.updateMany({
            where: { stripeSubscriptionId: inv.subscription },
            data: { licenseStatus: 'past_due' },
          });
        }
        break;
      }

      default:
        // Unhandled event — acknowledge receipt
        break;
    }

    return json({ received: true });
  } catch (err) {
    console.error('[billing/webhook handler]', err);
    return internalError();
  }
}

async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  // Parse the stripe-signature header: t=timestamp,v1=sig1,v1=sig2...
  const parts: Record<string, string[]> = {};
  for (const part of header.split(',')) {
    const [key, val] = part.split('=');
    if (!key || !val) continue;
    if (!parts[key]) parts[key] = [];
    parts[key].push(val);
  }

  const timestamp = parts['t']?.[0];
  const signatures = parts['v1'] ?? [];
  if (!timestamp || signatures.length === 0) return false;

  // Tolerance: reject events older than 5 minutes
  const tolerance = 5 * 60;
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > tolerance) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(signedPayload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const expectedSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return signatures.some((sig) => sig === expectedSig);
}
