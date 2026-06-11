import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403);
  }

  const { searchParams } = request.nextUrl;
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days') ?? '30', 10)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [
      apiRequests,
      newUsers,
      newContent,
      newMedia,
      topActions,
      dailyActivity,
    ] = await Promise.all([
      db.auditLog.count({ where: { createdAt: { gte: since } } }),
      db.user.count({ where: { createdAt: { gte: since } } }),
      db.contentEntry.count({ where: { createdAt: { gte: since } } }),
      db.media.count({ where: { createdAt: { gte: since } } }),
      db.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      db.auditLog.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Bucket daily activity by date string
    const buckets: Record<string, number> = {};
    for (const row of dailyActivity) {
      const date = row.createdAt.toISOString().slice(0, 10);
      buckets[date] = (buckets[date] ?? 0) + row._count.createdAt;
    }

    return json({
      data: {
        period: { days, since: since.toISOString() },
        totals: { apiRequests, newUsers, newContent, newMedia },
        topActions: topActions.map((a) => ({ action: a.action, count: a._count.action })),
        dailyActivity: Object.entries(buckets).map(([date, count]) => ({ date, count })),
      },
    });
  } catch (err) {
    console.error('[analytics GET]', err);
    return internalError();
  }
}
