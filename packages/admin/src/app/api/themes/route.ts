import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const themes = await db.theme.findMany({
      orderBy: { installedAt: 'desc' },
    });
    return json({ data: themes });
  } catch (err) {
    console.error('[themes GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403);
  }

  let body: { themeId?: string; name?: string; version?: string; tokens?: Record<string, string>; activate?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.themeId || typeof body.themeId !== 'string') return badRequest('themeId is required.');
  if (!body.name || typeof body.name !== 'string') return badRequest('name is required.');

  try {
    const existing = await db.theme.findUnique({ where: { themeId: body.themeId } });
    if (existing) return json({ error: 'Theme already installed.' }, 409);

    if (body.activate) {
      await db.theme.updateMany({ data: { active: false } });
    }

    const theme = await db.theme.create({
      data: {
        themeId: body.themeId,
        name: body.name,
        version: body.version ?? '1.0.0',
        active: body.activate ?? false,
        tokens: body.tokens ?? {},
      },
    });
    return json({ data: theme }, 201);
  } catch (err) {
    console.error('[themes POST]', err);
    return internalError();
  }
}
