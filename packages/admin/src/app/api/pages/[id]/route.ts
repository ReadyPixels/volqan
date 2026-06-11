import type { NextRequest } from 'next/server';
import { pageRepository as repo } from '@volqan/core';
import type { UpdatePageInput } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  try {
    const page = await repo.getById(id);
    if (!page) return notFound('Page not found.');
    return json({ data: page });
  } catch (err) {
    console.error('[pages/:id GET]', err);
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  const { id } = await params;

  let body: Partial<UpdatePageInput>;
  try {
    body = (await request.json()) as Partial<UpdatePageInput>;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const existing = await repo.getById(id);
    if (!existing) return notFound('Page not found.');

    const updated = await repo.update(id, body);
    return json({ data: updated });
  } catch (err) {
    console.error('[pages/:id PATCH]', err);
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
    const existing = await repo.getById(id);
    if (!existing) return notFound('Page not found.');

    await repo.delete(id);
    return json({ ok: true });
  } catch (err) {
    console.error('[pages/:id DELETE]', err);
    return internalError();
  }
}
