import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';
import pkg from '../../../../../package.json';

/**
 * GET /api/settings/installation — real installation details for the
 * Settings → Installation tab. Admin only.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403);
  }

  try {
    let installationId: string | null = null;
    let plan = 'community';
    let dbVersion: string | null = null;
    try {
      const installation = await db.installation.findFirst();
      installationId = installation?.installationId ?? null;
      plan = installation?.plan ?? 'community';
      const rows = (await db.$queryRaw`SELECT version()`) as Array<{ version?: string }>;
      dbVersion = rows[0]?.version?.split(' on ')[0] ?? null;
    } catch {
      // Database unreachable — report what we can
    }

    return json({
      data: {
        version: (pkg as { version?: string }).version ?? 'unknown',
        installationId,
        plan,
        nodeVersion: process.version,
        database: dbVersion ?? 'unavailable',
        environment: process.env.NODE_ENV ?? 'development',
        uptimeSeconds: Math.floor(process.uptime()),
      },
    });
  } catch (err) {
    console.error('[settings/installation GET]', err);
    return internalError();
  }
}
