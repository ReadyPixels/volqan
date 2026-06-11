import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return json({ error: 'Forbidden' }, 403);

  const { id } = await params;
  let body: { name?: string; url?: string; events?: string[]; enabled?: boolean; secret?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (body.url) {
    try {
      const u = new URL(body.url);
      if (u.protocol !== 'https:') return badRequest('url must use HTTPS.');
    } catch {
      return badRequest('url must be a valid URL.');
    }
  }

  try {
    const webhook = await db.webhook.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.url !== undefined ? { url: body.url } : {}),
        ...(body.events !== undefined ? { events: body.events } : {}),
        ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
        ...(body.secret !== undefined ? { secret: body.secret } : {}),
      },
      select: { id: true, name: true, url: true, events: true, enabled: true, lastStatus: true, createdAt: true },
    });
    return json({ data: webhook });
  } catch (err: any) {
    if (err?.code === 'P2025') return json({ error: 'Webhook not found.' }, 404);
    console.error('[webhooks PATCH]', err);
    return internalError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return json({ error: 'Forbidden' }, 403);

  const { id } = await params;
  try {
    await db.webhook.delete({ where: { id } });
    return json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') return json({ error: 'Webhook not found.' }, 404);
    console.error('[webhooks DELETE]', err);
    return internalError();
  }
}
