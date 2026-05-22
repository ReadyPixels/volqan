import type { NextRequest } from 'next/server';
import { ContentRepository, SchemaBuilder } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';

const repo = new ContentRepository();
const schemaBuilder = new SchemaBuilder();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { type } = await params;
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') ?? '20', 10)));
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const orderBy = searchParams.get('orderBy') ?? 'createdAt';
  const direction = (searchParams.get('direction') ?? 'desc') as 'asc' | 'desc';

  try {
    const contentType = await schemaBuilder.getContentType(type);
    if (!contentType) return notFound(`Content type "${type}" not found.`);

    const result = await repo.list(type, {
      page,
      perPage,
      status: status as any,
      search,
      orderBy: [{ field: orderBy, direction }],
    });

    return json(result);
  } catch (err) {
    console.error(`[content/${type} GET]`, err);
    return internalError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  const { type } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const entry = await repo.create(type, { ...body, authorId: user.id });
    return json({ data: entry }, 201);
  } catch (err: any) {
    if (err?.name === 'ContentValidationError') return json({ error: err.message, fields: err.fields }, 422);
    console.error(`[content/${type} POST]`, err);
    return internalError();
  }
}
