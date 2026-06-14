import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { json, internalError } from '@/lib/api-helpers';
import { fireWebhooks } from '@/lib/webhook';

/** Called by a cron job (e.g. Vercel cron, external scheduler) every minute.
 *  Protected by a shared secret via Authorization header. */
export async function POST(request: NextRequest): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return json({ error: 'Cron endpoint is not configured. Set CRON_SECRET environment variable.' }, 503);
  }
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const now = new Date();

  try {
    // Publish entries whose scheduledAt has passed
    const toPublish = await db.contentEntry.findMany({
      where: {
        status: 'DRAFT',
        scheduledAt: { lte: now },
      },
      select: { id: true, contentTypeId: true, slug: true },
    });

    if (toPublish.length > 0) {
      await db.contentEntry.updateMany({
        where: { id: { in: toPublish.map((e) => e.id) } },
        data: { status: 'PUBLISHED', publishedAt: now, scheduledAt: null },
      });
      for (const entry of toPublish) {
        await fireWebhooks('content.published', entry).catch(() => {});
      }
    }

    // Unpublish entries whose unpublishAt has passed
    const toUnpublish = await db.contentEntry.findMany({
      where: {
        status: 'PUBLISHED',
        unpublishAt: { lte: now },
      },
      select: { id: true, contentTypeId: true, slug: true },
    });

    if (toUnpublish.length > 0) {
      await db.contentEntry.updateMany({
        where: { id: { in: toUnpublish.map((e) => e.id) } },
        data: { status: 'ARCHIVED', unpublishAt: null },
      });
      for (const entry of toUnpublish) {
        await fireWebhooks('content.archived', entry).catch(() => {});
      }
    }

    return json({
      published: toPublish.length,
      unpublished: toUnpublish.length,
      processedAt: now.toISOString(),
    });
  } catch (err) {
    console.error('[cron/content-scheduler]', err);
    return internalError();
  }
}
