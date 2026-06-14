import type { NextRequest } from 'next/server';
import { ContentRepository } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';
import { audit } from '@/lib/audit';
import { fireWebhooks } from '@/lib/webhook';
import { cacheFlush } from '@/lib/cache';

const repo = new ContentRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { type, id } = await params;
  try {
    const entry = await repo.findById(type, id);
    if (!entry) return notFound('Entry not found.');
    return json({ data: entry });
  } catch (err) {
    console.error(`[content/${type}/${id} GET]`, err);
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  const { type, id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const entry = await repo.getById(type, id);
    if (!entry) return notFound('Entry not found.');

    // EDITOR can only update own entries
    if (user.role === 'EDITOR' && (entry as any).authorId !== user.id) {
      return json({ error: 'Forbidden' }, 403);
    }

    const updated = await repo.update(type, id, body);
    const status = (updated as any).status;
    const action = status === 'PUBLISHED' ? 'content.published' : 'content.updated';
    await cacheFlush(`content:${type}:`);
    await audit({ userId: user.id, action, resource: type, resourceId: id });
    await fireWebhooks(action, { id, type, status }).catch(() => {});
    return json({ data: updated });
  } catch (err: any) {
    if (err?.name === 'ContentValidationError') return json({ error: err.message, fields: err.fields }, 422);
    console.error(`[content/${type}/${id} PATCH]`, err);
    return internalError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  const { type, id } = await params;
  try {
    const entry = await repo.getById(type, id);
    if (!entry) return notFound('Entry not found.');

    if (user.role === 'EDITOR' && (entry as any).authorId !== user.id) {
      return json({ error: 'Forbidden' }, 403);
    }

    await repo.delete(type, id);
    await cacheFlush(`content:${type}:`);
    await audit({ userId: user.id, action: 'content.deleted', resource: type, resourceId: id });
    await fireWebhooks('content.deleted', { id, type }).catch(() => {});
    return json({ ok: true });
  } catch (err) {
    console.error(`[content/${type}/${id} DELETE]`, err);
    return internalError();
  }
}
