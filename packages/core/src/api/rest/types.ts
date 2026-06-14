/**
 * @file api/rest/types.ts
 * @description Type definitions for the Volqan REST API layer.
 *
 * Uses standard Web API Request/Response types so the core package
 * remains framework-agnostic (no Next.js dependency).
 */

// ---------------------------------------------------------------------------
// API Response shapes
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiPaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  meta: ApiPaginationMeta;
  timestamp: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Route Handler types
// ---------------------------------------------------------------------------

export type RouteHandler<
  TParams extends Record<string, string> = Record<string, string>,
> = (
  request: Request,
  context: { params: Promise<TParams> },
) => Promise<Response>;

export type Middleware = (
  request: Request,
  next: () => Promise<Response>,
) => Promise<Response>;

// ---------------------------------------------------------------------------
// Auth context
// ---------------------------------------------------------------------------

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthContext;
}

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------

export interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  requireAuth?: boolean;
  requireRole?: string;
}

// ---------------------------------------------------------------------------
// Rate limit config
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// ---------------------------------------------------------------------------
// CORS config
// ---------------------------------------------------------------------------

export interface CorsConfig {
  origins: string | string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
}
