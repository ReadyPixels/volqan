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
import type { NextRequest } from 'next/server';
import type { QueryOptions, OrderByOption } from '../../content/types.js';
/**
 * Parses the query parameters of a Next.js App Router request into a
 * Volqan QueryOptions object.
 *
 * @param request The incoming NextRequest.
 * @returns A fully populated QueryOptions object.
 */
export declare function parseQueryOptions(request: NextRequest): QueryOptions;
/**
 * Extracts `filter[*]` parameters into a flat where clause object.
 *
 * Supports basic equality filters: `filter[status]=PUBLISHED`
 * Supports operator prefixes: `filter[price][gte]=100` (parsed as `{ price: { gte: 100 } }`)
 *
 * @param params URLSearchParams from the request URL.
 */
export declare function parseFilters(params: URLSearchParams): QueryOptions['where'];
/**
 * Parses the `sort` parameter into an ordered list of sort instructions.
 *
 * Accepts a comma-separated list of field names. Prefix a field with `-` to
 * sort descending. Unprefixed fields sort ascending.
 *
 * @example
 * `?sort=-createdAt,title` → [{ field: 'createdAt', direction: 'desc' }, { field: 'title', direction: 'asc' }]
 */
export declare function parseOrderBy(params: URLSearchParams): OrderByOption[] | undefined;
/**
 * Parses and clamps the `page` parameter.
 * Returns 1 if the parameter is absent or invalid.
 */
export declare function parsePage(params: URLSearchParams): number;
/**
 * Parses and clamps the `perPage` parameter.
 * Minimum 1, maximum MAX_PER_PAGE (100).
 */
export declare function parsePerPage(params: URLSearchParams): number;
/**
 * Parses the `fields` parameter into a list of selected field names.
 *
 * @example
 * `?fields=title,slug,status` → ['title', 'slug', 'status']
 */
export declare function parseFields(params: URLSearchParams): string[] | undefined;
/**
 * Parses the `include` parameter into a list of relation names to eager-load.
 *
 * @example
 * `?include=author,category` → ['author', 'category']
 */
export declare function parseIncludes(params: URLSearchParams): string[] | undefined;
//# sourceMappingURL=query-parser.d.ts.map