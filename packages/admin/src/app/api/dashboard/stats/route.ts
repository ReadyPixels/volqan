import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';

const STORAGE_CATEGORIES = [
  { label: 'Images', prefix: 'image/' },
  { label: 'Videos', prefix: 'video/' },
  { label: 'Documents', prefix: 'application/' },
  { label: 'Audio', prefix: 'audio/' },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Percent change from `previous` to `current`, rounded; null when there's no prior baseline. */
function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS);

    const [
      contentCount,
      mediaCount,
      userCount,
      extensionCount,
      recentEntries,
      recentActivity,
      storageByCategory,
      contentLast7,
      contentPrev7,
      mediaLast7,
      mediaPrev7,
      usersLast7,
      usersPrev7,
    ] = await Promise.all([
      db.contentEntry.count(),
      db.media.count(),
      db.user.count(),
      db.extension.count({ where: { enabled: true } }),
      db.contentEntry.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          contentType: { select: { name: true, slug: true } },
          author: { select: { name: true, email: true } },
        },
      }),
      db.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      Promise.all(
        STORAGE_CATEGORIES.map(({ label, prefix }) =>
          db.media
            .aggregate({ _sum: { size: true }, where: { mimeType: { startsWith: prefix } } })
            .then((r) => ({ label, bytes: r._sum.size ?? 0 })),
        ),
      ),
      db.contentEntry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.contentEntry.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      db.media.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.media.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.user.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    ]);

    const totalStorageBytes = storageByCategory.reduce((sum, c) => sum + c.bytes, 0);

    return json({
      data: {
        contentEntries: contentCount,
        mediaFiles: mediaCount,
        users: userCount,
        activeExtensions: extensionCount,
        totalStorageBytes,
        storageByCategory,
        recentEntries,
        recentActivity,
        trends: {
          contentEntries: percentChange(contentLast7, contentPrev7),
          mediaFiles: percentChange(mediaLast7, mediaPrev7),
          users: percentChange(usersLast7, usersPrev7),
        },
      },
    });
  } catch (err) {
    console.error('[dashboard/stats GET]', err);
    return internalError();
  }
}
