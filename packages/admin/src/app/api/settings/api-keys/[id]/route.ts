import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, internalError } from '@/lib/api-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  try {
    const key = await db.apiKey.findUnique({ where: { id } });
    if (!key) return notFound('API key not found.');

    // Users can only delete their own keys; admins can delete any
    if (key.userId !== user.id && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return json({ error: 'Forbidden' }, 403);
    }

    await db.apiKey.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    console.error('[api-keys/:id DELETE]', err);
    return internalError();
  }
}
