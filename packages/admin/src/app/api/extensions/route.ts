import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const extensions = await db.extension.findMany({
      orderBy: { installedAt: 'desc' },
    });
    return json({ data: extensions });
  } catch (err) {
    console.error('[extensions GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403);
  }

  let body: { extensionId?: string; name?: string; version?: string; settings?: Record<string, unknown> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.extensionId || typeof body.extensionId !== 'string') return badRequest('extensionId is required.');
  if (!body.name || typeof body.name !== 'string') return badRequest('name is required.');

  try {
    const existing = await db.extension.findUnique({ where: { extensionId: body.extensionId } });
    if (existing) return json({ error: 'Extension already installed.' }, 409);

    const ext = await db.extension.create({
      data: {
        extensionId: body.extensionId,
        name: body.name,
        version: body.version ?? '1.0.0',
        enabled: false,
        settings: (body.settings ?? {}) as import('@prisma/client').Prisma.InputJsonValue,
      },
    });
    return json({ data: ext }, 201);
  } catch (err) {
    console.error('[extensions POST]', err);
    return internalError();
  }
}
