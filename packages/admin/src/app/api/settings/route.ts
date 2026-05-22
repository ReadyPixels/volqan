import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER' || user.role === 'EDITOR') return json({ error: 'Forbidden' }, 403);

  try {
    const rows = await db.setting.findMany({ orderBy: { key: 'asc' } });
    // Convert array of {key,value} rows to a flat object
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return json({ data: settings });
  } catch (err) {
    console.error('[settings GET]', err);
    return internalError();
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER' || user.role === 'EDITOR') return json({ error: 'Forbidden' }, 403);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    // Upsert each key-value pair
    const ops = Object.entries(body).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      }),
    );
    await Promise.all(ops);
    return json({ ok: true });
  } catch (err) {
    console.error('[settings PATCH]', err);
    return internalError();
  }
}
