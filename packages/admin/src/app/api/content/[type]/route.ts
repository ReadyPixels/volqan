import type { NextRequest } from 'next/server';
import type { SchemaBuilder } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';
import { audit } from '@/lib/audit';
import { fireWebhooks } from '@/lib/webhook';
import { cached, cacheFlush } from '@/lib/cache';
import { checkContentLength } from '@/lib/body-limit';
import { contentRepo as repo, schemaBuilder } from '@/lib/content';

/** System columns that are always valid for orderBy */
const SYSTEM_ORDERABLE_COLUMNS = new Set([
  'createdAt',
  'updatedAt',
  'status',
  'publishedAt',
  'scheduledAt',
  'unpublishAt',
]);

/**
 * Validates orderBy against the content type's field names plus system columns.
 * Returns the sanitized orderBy field name, or null if invalid.
 */
function validateOrderBy(
  orderBy: string,
  contentType: Awaited<ReturnType<SchemaBuilder['getContentType']>>,
): string | null {
  if (SYSTEM_ORDERABLE_COLUMNS.has(orderBy)) return orderBy;
  if (contentType && contentType.fields.some((f) => f.name === orderBy && f.sortable !== false)) {
    return orderBy;
  }
  return null;
}

function validateDirection(direction: string): 'asc' | 'desc' {
  return direction === 'asc' || direction === 'desc' ? direction : 'desc';
}

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
  const rawOrderBy = searchParams.get('orderBy') ?? 'createdAt';
  const rawDirection = searchParams.get('direction') ?? 'desc';

  let contentType: Awaited<ReturnType<SchemaBuilder['getContentType']>> | null = null;

  try {
    contentType = await schemaBuilder.getContentType(type);
    if (!contentType) return notFound(`Content type "${type}" not found.`);
  } catch (err: any) {
    if (err?.name === 'ContentTypeNotFoundError') return notFound(`Content type "${type}" not found.`);
    console.error(`[content/${type} GET]`, err);
    return internalError();
  }

  const orderBy = validateOrderBy(rawOrderBy, contentType);
  if (!orderBy) {
    return badRequest(`Invalid orderBy field: "${rawOrderBy}". Must be a valid content type field or system column.`);
  }
  const direction = validateDirection(rawDirection);

  try {
    const cacheKey = `content:${type}:${page}:${perPage}:${status ?? ''}:${search ?? ''}:${orderBy}:${direction}`;
    const result = await cached(cacheKey, () =>
      repo.findMany(type, {
        page,
        perPage,
        where: status ? { status } : undefined,
        orderBy: [{ field: orderBy, direction }],
      }),
    );

    // Search is applied to the current page (data is a JSON column; no full-text index yet)
    if (search) {
      const needle = search.toLowerCase();
      result.data = result.data.filter((entry) =>
        JSON.stringify(entry.data ?? {}).toLowerCase().includes(needle),
      );
    }

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

  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  try {
    const entry = await repo.create(type, { ...body, authorId: user.id } as Record<string, unknown>, user.id);
    await cacheFlush(`content:${type}:`);
    await audit({ userId: user.id, action: 'content.created', resource: type, resourceId: (entry as any).id });
    await fireWebhooks('content.created', { id: (entry as any).id, type }).catch(() => {});
    return json({ data: entry }, 201);
  } catch (err: any) {
    if (err?.name === 'ContentValidationError') return json({ error: err.message, fields: err.fields }, 422);
    console.error(`[content/${type} POST]`, err);
    return internalError();
  }
}
