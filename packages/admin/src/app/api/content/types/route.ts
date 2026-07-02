import type { NextRequest } from 'next/server';
import { toSlug } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';
import { schemaBuilder } from '@/lib/content';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const types = await schemaBuilder.listContentTypes();
    return json({ data: types });
  } catch (err) {
    console.error('[content/types GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER' || user.role === 'EDITOR') return json({ error: 'Forbidden' }, 403);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.name || typeof body.name !== 'string') {
    return badRequest('name is required.');
  }

  try {
    const contentType = await schemaBuilder.createContentType({
      name: body.name as string,
      slug: typeof body.slug === 'string' && body.slug ? toSlug(body.slug) : toSlug(body.name as string),
      fields: (body.fields as any[]) ?? [],
      settings: (body.settings as any) ?? {},
    });
    return json({ data: contentType }, 201);
  } catch (err) {
    console.error('[content/types POST]', err);
    return internalError();
  }
}
