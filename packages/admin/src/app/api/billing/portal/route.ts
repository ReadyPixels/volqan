import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe is not configured on this installation.' }, 503);
  }

  try {
    const installation = await db.installation.findFirst();

    if (!installation?.stripeCustomerId) {
      return json({ error: 'No active subscription found.' }, 404);
    }

    const origin = new URL(request.url).origin;

    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: installation.stripeCustomerId,
        return_url: `${origin}/billing`,
      }),
    });

    if (!portalRes.ok) {
      const errData = (await portalRes.json()) as { error?: { message?: string } };
      console.error('[billing/portal Stripe error]', errData);
      return json({ error: errData?.error?.message ?? 'Failed to create billing portal session.' }, 502);
    }

    const session = (await portalRes.json()) as { url?: string };
    if (!session.url) return json({ error: 'No portal URL returned by Stripe.' }, 502);

    return json({ url: session.url });
  } catch (err) {
    console.error('[billing/portal POST]', err);
    return internalError();
  }
}
