import { createHmac } from 'node:crypto';
import { db } from '@volqan/core';

export interface WebhookEvent {
  event: string;
  timestamp: string;
  data: unknown;
}

/** Fire all enabled webhooks subscribed to the given event. Non-blocking — errors are logged, not thrown. */
export async function fireWebhooks(event: string, data: unknown): Promise<void> {
  let webhooks: { id: string; url: string; secret: string }[];
  try {
    webhooks = await db.webhook.findMany({
      where: { enabled: true },
      select: { id: true, url: true, secret: true, events: true },
    }) as any;
  } catch {
    return;
  }

  const payload: WebhookEvent = { event, timestamp: new Date().toISOString(), data };
  const body = JSON.stringify(payload);

  await Promise.allSettled(
    webhooks
      .filter((wh: any) => {
        const events: string[] = Array.isArray(wh.events) ? wh.events : [];
        return events.includes(event) || events.includes('*');
      })
      .map(async (wh) => {
        const sig = createHmac('sha256', wh.secret).update(body).digest('hex');
        const status = await deliverWebhook(wh.url, body, sig);
        await db.webhook.update({
          where: { id: wh.id },
          data: { lastStatus: status, lastFiredAt: new Date() },
        }).catch(() => {});
      }),
  );
}

async function deliverWebhook(url: string, body: string, sig: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Volqan-Signature': `sha256=${sig}`,
        'X-Volqan-Event': 'webhook',
        'User-Agent': 'Volqan-Webhook/1.0',
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? 'ok' : `error:${res.status}`;
  } catch (err) {
    console.error('[webhook] delivery failed:', url, err);
    return 'error';
  }
}
