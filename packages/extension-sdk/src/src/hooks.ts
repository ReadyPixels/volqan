/**
 * @file hooks.ts
 * @description Hook registration helpers for building Volqan extensions.
 *
 * These utilities provide a fluent API for registering routes, admin pages,
 * content types, and API endpoints that can be collected into a VolqanExtension.
 */

import type {
  RouteDefinition,
  AdminPage,
  ContentHook,
  ContentHookPayload,
  ExtensionRequest,
  ExtensionResponse,
} from '@volqan/core';

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

/** Options for {@link registerRoute}. */
export interface RouteRegistration {
  /** HTTP method. */
  method: RouteDefinition['method'];

  /** Route path relative to /api/extensions/{vendor}/{name}. */
  path: string;

  /** Async request handler. */
  handler: (req: ExtensionRequest) => Promise<ExtensionResponse>;

  /** Whether the route is publicly accessible without Volqan session auth. */
  public?: boolean;

  /** Rate-limit config for this route. */
  rateLimit?: {
    maxRequests: number;
    windowSeconds: number;
  };
}

/**
 * Create a RouteDefinition from a simplified registration object.
 *
 * @param registration - The route registration options.
 * @returns A RouteDefinition ready to include in an extension's apiRoutes array.
 *
 * @example
 * ```ts
 * import { registerRoute } from '@volqan/extension-sdk';
 *
 * const webhookRoute = registerRoute({
 *   method: 'POST',
 *   path: '/webhook',
 *   public: true,
 *   handler: async (req) => ({
 *     status: 200,
 *     body: { received: true },
 *   }),
 * });
 * ```
 */
export function registerRoute(registration: RouteRegistration): RouteDefinition {
  const route: RouteDefinition = {
    method: registration.method,
    path: registration.path,
    handler: registration.handler,
  };

  if (registration.public !== undefined) route.public = registration.public;
  if (registration.rateLimit) route.rateLimit = registration.rateLimit;

  return route;
}

// ---------------------------------------------------------------------------
// Admin page registration
// ---------------------------------------------------------------------------

/** Options for {@link registerAdminPage}. */
export interface AdminPageRegistration {
  /** Route path relative to /admin (e.g. "my-extension/settings"). */
  path: string;

  /** Page title shown in <title> and breadcrumbs. */
  title: string;

  /**
   * The React component to render.
   * Pass a string for import-path resolution, or a lazy React component.
   */
  component: AdminPage['component'];

  /** Optional layout wrapper. */
  layout?: AdminPage['layout'];

  /** Whether the page is accessible without authentication. */
  public?: boolean;
}

/**
 * Create an AdminPage definition from a simplified registration object.
 *
 * @param registration - The admin page registration options.
 * @returns An AdminPage ready to include in an extension's adminPages array.
 *
 * @example
 * ```ts
 * import { registerAdminPage } from '@volqan/extension-sdk';
 *
 * const settingsPage = registerAdminPage({
 *   path: 'analytics/settings',
 *   title: 'Analytics Settings',
 *   component: 'my-extension/SettingsPage',
 * });
 * ```
 */
export function registerAdminPage(registration: AdminPageRegistration): AdminPage {
  const page: AdminPage = {
    path: registration.path,
    title: registration.title,
    component: registration.component,
  };

  if (registration.layout) page.layout = registration.layout;
  if (registration.public !== undefined) page.public = registration.public;

  return page;
}

// ---------------------------------------------------------------------------
// Content type hook registration
// ---------------------------------------------------------------------------

/** Options for {@link registerContentType}. */
export interface ContentTypeRegistration {
  /** Content model to target (e.g. "post", "product", or "*" for all). */
  model: string;

  /** Hook event timing. */
  event: ContentHook['event'];

  /** The hook handler function. */
  handler: (payload: ContentHookPayload) => Promise<ContentHookPayload | void>;
}

/**
 * Create a ContentHook from a simplified registration object.
 *
 * @param registration - The content type hook registration options.
 * @returns A ContentHook ready to include in an extension's contentHooks array.
 *
 * @example
 * ```ts
 * import { registerContentType } from '@volqan/extension-sdk';
 *
 * const slugHook = registerContentType({
 *   model: 'post',
 *   event: 'beforeCreate',
 *   handler: async (payload) => {
 *     if (payload.data) {
 *       payload.data.slug = slugify(payload.data.title as string);
 *     }
 *     return payload;
 *   },
 * });
 * ```
 */
export function registerContentType(registration: ContentTypeRegistration): ContentHook {
  return {
    model: registration.model,
    event: registration.event,
    handler: registration.handler,
  };
}

// ---------------------------------------------------------------------------
// API endpoint registration (convenience wrapper)
// ---------------------------------------------------------------------------

/** Options for {@link registerAPIEndpoint}. */
export interface APIEndpointRegistration {
  /** HTTP method. */
  method: RouteDefinition['method'];

  /** Route path relative to /api/extensions/{vendor}/{name}. */
  path: string;

  /** Async request handler. */
  handler: (req: ExtensionRequest) => Promise<ExtensionResponse>;

  /** Whether the endpoint is publicly accessible. Default: false. */
  public?: boolean;

  /** Rate-limit config. */
  rateLimit?: {
    maxRequests: number;
    windowSeconds: number;
  };
}

/**
 * Create a RouteDefinition for an API endpoint.
 *
 * This is functionally identical to {@link registerRoute} but named specifically
 * for API endpoint registration to improve code readability.
 *
 * @param registration - The API endpoint registration options.
 * @returns A RouteDefinition ready to include in an extension's apiRoutes array.
 *
 * @example
 * ```ts
 * import { registerAPIEndpoint } from '@volqan/extension-sdk';
 *
 * const listEndpoint = registerAPIEndpoint({
 *   method: 'GET',
 *   path: '/items',
 *   handler: async () => ({
 *     status: 200,
 *     body: { items: [] },
 *   }),
 * });
 * ```
 */
export function registerAPIEndpoint(registration: APIEndpointRegistration): RouteDefinition {
  const route: RouteDefinition = {
    method: registration.method,
    path: registration.path,
    handler: registration.handler,
  };

  if (registration.public !== undefined) route.public = registration.public;
  if (registration.rateLimit) route.rateLimit = registration.rateLimit;

  return route;
}
