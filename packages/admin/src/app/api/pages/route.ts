import type { NextRequest } from 'next/server';
import { pageRepository as repo } from '@volqan/core';
import type { CreatePageInput } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(100, parseInt(searchParams.get('perPage') ?? '20', 10));
  const status = searchParams.get('status') as 'draft' | 'published' | 'scheduled' | 'archived' | null ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  try {
    const result = await repo.list({ page, perPage, status, search });
    return json({
      data: result.items,
      meta: { page: result.page, perPage: result.perPage, total: result.total, totalPages: result.totalPages },
    });
  } catch (err) {
    console.error('[pages GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  let body: Partial<CreatePageInput>;
  try {
    body = (await request.json()) as Partial<CreatePageInput>;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.title || typeof body.title !== 'string') return badRequest('title is required.');
  if (!body.slug || typeof body.slug !== 'string') return badRequest('slug is required.');

  try {
    const newPage = await repo.create({ ...body, title: body.title, slug: body.slug, authorId: user.id });
    return json({ data: newPage }, 201);
  } catch (err) {
    console.error('[pages POST]', err);
    return internalError();
  }
}
