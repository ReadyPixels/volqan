import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const [contentCount, mediaCount, userCount, extensionCount, recentEntries, recentActivity, storageResult] = await Promise.all([
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
      db.media.aggregate({ _sum: { size: true } }),
    ]);

    return json({
      data: {
        contentEntries: contentCount,
        mediaFiles: mediaCount,
        users: userCount,
        activeExtensions: extensionCount,
        totalStorageBytes: storageResult._sum.size ?? 0,
        recentEntries,
        recentActivity,
      },
    });
  } catch (err) {
    console.error('[dashboard/stats GET]', err);
    return internalError();
  }
}
