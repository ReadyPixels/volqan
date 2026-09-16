import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';
import { getCacheStatus } from '@/lib/cache';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const dbStart = Date.now();
    let dbConnected = true;
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbConnected = false;
    }
    const dbLatencyMs = Date.now() - dbStart;

    const [cache, activeExtensions, totalExtensions] = await Promise.all([
      getCacheStatus(),
      db.extension.count({ where: { enabled: true } }),
      db.extension.count(),
    ]);

    return json({
      data: {
        database: { connected: dbConnected, latencyMs: dbLatencyMs },
        cache,
        extensions: { active: activeExtensions, total: totalExtensions },
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[dashboard/health GET]', err);
    return internalError();
  }
}
