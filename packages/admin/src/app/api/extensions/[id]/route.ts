import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403);
  }

  const { id } = await params;

  let body: { enabled?: boolean; settings?: Record<string, unknown> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const ext = await db.extension.findUnique({ where: { id } });
    if (!ext) return notFound('Extension not found.');

    const updated = await db.extension.update({
      where: { id },
      data: {
        ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
        ...(body.settings !== undefined
          ? { settings: body.settings as import('@prisma/client').Prisma.InputJsonValue }
          : {}),
      },
    });
    return json({ data: updated });
  } catch (err) {
    console.error('[extensions/:id PATCH]', err);
    return internalError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403);
  }

  const { id } = await params;
  try {
    const ext = await db.extension.findUnique({ where: { id } });
    if (!ext) return notFound('Extension not found.');

    await db.extension.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    console.error('[extensions/:id DELETE]', err);
    return internalError();
  }
}
