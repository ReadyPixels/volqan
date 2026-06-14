/**
 * @file api/rest/query-parser.ts
 * @description URL query string parser that converts Next.js request params
 * into Volqan QueryOptions.
 *
 * Supported query string conventions:
 * - Filtering:  ?filter[status]=published&filter[authorId]=abc123
 * - Sorting:    ?sort=-createdAt,title  (prefix - = descending)
 * - Pagination: ?page=2&perPage=20
 * - Projection: ?fields=title,slug,status
 * - Relations:  ?include=author,category
 *
 * @example
 * ```
 * GET /api/content/blog-post?filter[status]=PUBLISHED&sort=-publishedAt&page=1&perPage=10&fields=title,slug
 * ```
 * Produces:
 * ```ts
 * {
 *   where: { status: 'PUBLISHED' },
 *   orderBy: [{ field: 'publishedAt', direction: 'desc' }],
 *   page: 1,
 *   perPage: 10,
 *   select: ['title', 'slug'],
 * }
 * ```
 */

import type { QueryOptions, OrderByOption } from '../../content/types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parses the query parameters of a Next.js App Router request into a
 * Volqan QueryOptions object.
 *
 * @param request The incoming NextRequest.
 * @returns A fully populated QueryOptions object.
 */
export function parseQueryOptions(request: Request): QueryOptions {
  const { searchParams } = new URL(request.url);

  return {
    where: parseFilters(searchParams),
    orderBy: parseOrderBy(searchParams),
    page: parsePage(searchParams),
    perPage: parsePerPage(searchParams),
    select: parseFields(searchParams),
    include: parseIncludes(searchParams),
  };
}

// ---------------------------------------------------------------------------
// Individual parsers
// ---------------------------------------------------------------------------

/**
 * Extracts `filter[*]` parameters into a flat where clause object.
 *
 * Supports basic equality filters: `filter[status]=PUBLISHED`
 * Supports operator prefixes: `filter[price][gte]=100` (parsed as `{ price: { gte: 100 } }`)
 *
 * @param params URLSearchParams from the request URL.
 */
export function parseFilters(params: URLSearchParams): QueryOptions['where'] {
  const where: Record<string, unknown> = {};

  for (const [key, value] of params.entries()) {
    // Match filter[fieldName] or filter[fieldName][operator]
    const simpleMatch = key.match(/^filter\[([^\]]+)\]$/);
    const operatorMatch = key.match(/^filter\[([^\]]+)\]\[([^\]]+)\]$/);

    if (simpleMatch) {
      const field = simpleMatch[1];
      where[field] = coerceValue(value);
    } else if (operatorMatch) {
      const field = operatorMatch[1];
      const operator = operatorMatch[2];
      const existing = (where[field] as Record<string, unknown>) ?? {};
      where[field] = { ...existing, [operator]: coerceValue(value) };
    }
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

/**
 * Parses the `sort` parameter into an ordered list of sort instructions.
 *
 * Accepts a comma-separated list of field names. Prefix a field with `-` to
 * sort descending. Unprefixed fields sort ascending.
 *
 * @example
 * `?sort=-createdAt,title` → [{ field: 'createdAt', direction: 'desc' }, { field: 'title', direction: 'asc' }]
 */
export function parseOrderBy(params: URLSearchParams): OrderByOption[] | undefined {
  const sortParam = params.get('sort') ?? params.get('orderBy');
  if (!sortParam) return undefined;

  const parts = sortParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;

  return parts.map((part) => {
    if (part.startsWith('-')) {
      return { field: part.slice(1), direction: 'desc' as const };
    }
    return { field: part, direction: 'asc' as const };
  });
}

/**
 * Parses and clamps the `page` parameter.
 * Returns 1 if the parameter is absent or invalid.
 */
export function parsePage(params: URLSearchParams): number {
  const raw = params.get('page');
  if (!raw) return DEFAULT_PAGE;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 1 ? DEFAULT_PAGE : n;
}

/**
 * Parses and clamps the `perPage` parameter.
 * Minimum 1, maximum MAX_PER_PAGE (100).
 */
export function parsePerPage(params: URLSearchParams): number {
  const raw = params.get('perPage') ?? params.get('per_page') ?? params.get('limit');
  if (!raw) return DEFAULT_PER_PAGE;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1) return DEFAULT_PER_PAGE;
  return Math.min(n, MAX_PER_PAGE);
}

/**
 * Parses the `fields` parameter into a list of selected field names.
 *
 * @example
 * `?fields=title,slug,status` → ['title', 'slug', 'status']
 */
export function parseFields(params: URLSearchParams): string[] | undefined {
  const raw = params.get('fields') ?? params.get('select');
  if (!raw) return undefined;
  const fields = raw.split(',').map((f) => f.trim()).filter(Boolean);
  return fields.length > 0 ? fields : undefined;
}

/**
 * Parses the `include` parameter into a list of relation names to eager-load.
 *
 * @example
 * `?include=author,category` → ['author', 'category']
 */
export function parseIncludes(params: URLSearchParams): string[] | undefined {
  const raw = params.get('include') ?? params.get('populate');
  if (!raw) return undefined;
  const includes = raw.split(',').map((i) => i.trim()).filter(Boolean);
  return includes.length > 0 ? includes : undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Coerces a raw query string value to its most appropriate JS primitive.
 *
 * - "true" / "false" → boolean
 * - Numeric strings → number
 * - "null" → null
 * - Everything else → string
 */
function coerceValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;

  const n = Number(raw);
  if (!isNaN(n) && raw.trim() !== '') return n;

  return raw;
}
