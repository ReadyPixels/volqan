import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  if (!STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe is not configured on this installation.' }, 503);
  }

  try {
    // Find the active subscription for this user via the installations/settings table
    const installation = await db.installation.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const subscriptionId = (installation as any)?.stripeSubscriptionId as string | undefined;

    if (!subscriptionId) {
      return json({ error: 'No active subscription found.' }, 404);
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      },
    );

    if (!stripeRes.ok) {
      const errData = (await stripeRes.json()) as { error?: { message?: string } };
      return json({ error: errData?.error?.message ?? 'Failed to cancel subscription.' }, 502);
    }

    return json({ ok: true, message: 'Subscription cancelled. Access continues until the billing period ends.' });
  } catch (err) {
    console.error('[billing/cancel]', err);
    return internalError();
  }
}
