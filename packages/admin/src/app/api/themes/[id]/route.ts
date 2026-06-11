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

  let body: { active?: boolean; tokens?: Record<string, string> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const theme = await db.theme.findUnique({ where: { id } });
    if (!theme) return notFound('Theme not found.');

    if (body.active === true) {
      await db.theme.updateMany({ data: { active: false } });
    }

    const updated = await db.theme.update({
      where: { id },
      data: {
        ...(typeof body.active === 'boolean' ? { active: body.active } : {}),
        ...(body.tokens !== undefined ? { tokens: body.tokens } : {}),
      },
    });
    return json({ data: updated });
  } catch (err) {
    console.error('[themes/:id PATCH]', err);
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
    const theme = await db.theme.findUnique({ where: { id } });
    if (!theme) return notFound('Theme not found.');

    await db.theme.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    console.error('[themes/:id DELETE]', err);
    return internalError();
  }
}
