import type { NextRequest } from 'next/server';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const PLAN_PRICE_IDS: Record<string, string> = {
  'support-yearly': process.env.STRIPE_PRICE_YEARLY ?? '',
  'support-monthly': process.env.STRIPE_PRICE_MONTHLY ?? '',
};

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  if (!STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe is not configured on this installation.' }, 503);
  }

  let body: { planId?: string; successUrl?: string; cancelUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const { planId, successUrl, cancelUrl } = body;

  if (!planId || !PLAN_PRICE_IDS[planId]) {
    return badRequest('Invalid planId. Must be "support-yearly" or "support-monthly".');
  }

  const priceId = PLAN_PRICE_IDS[planId];
  if (!priceId) {
    return json({ error: 'Stripe price ID for this plan is not configured.' }, 503);
  }

  const origin = new URL(request.url).origin;
  const safeSuccessUrl = (successUrl?.startsWith(origin)) ? successUrl : `${origin}/billing?checkout=success`;
  const safeCancelUrl = (cancelUrl?.startsWith(origin)) ? cancelUrl : `${origin}/billing/checkout`;

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': safeSuccessUrl,
        'cancel_url': safeCancelUrl,
        'customer_email': user.email,
        'metadata[userId]': user.id,
        'metadata[planId]': planId,
      }),
    });

    if (!stripeRes.ok) {
      const errData = (await stripeRes.json()) as { error?: { message?: string } };
      console.error('[billing/checkout Stripe error]', errData);
      return json({ error: errData?.error?.message ?? 'Stripe checkout failed.' }, 502);
    }

    const session = (await stripeRes.json()) as { url?: string };
    if (!session.url) return json({ error: 'No checkout URL returned by Stripe.' }, 502);

    return json({ url: session.url });
  } catch (err) {
    console.error('[billing/checkout]', err);
    return internalError();
  }
}
