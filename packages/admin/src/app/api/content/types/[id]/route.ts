import type { NextRequest } from 'next/server';
import { SchemaBuilder } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';

const schemaBuilder = new SchemaBuilder();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  try {
    const type = await schemaBuilder.getContentType(id);
    if (!type) return notFound('Content type not found.');
    return json({ data: type });
  } catch (err) {
    console.error('[content/types/:id GET]', err);
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER' || user.role === 'EDITOR') return json({ error: 'Forbidden' }, 403);

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const updated = await schemaBuilder.updateContentType(id, body as any);
    return json({ data: updated });
  } catch (err) {
    console.error('[content/types/:id PATCH]', err);
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
    await schemaBuilder.deleteContentType(id);
    return json({ ok: true });
  } catch (err) {
    console.error('[content/types/:id DELETE]', err);
    return internalError();
  }
}
