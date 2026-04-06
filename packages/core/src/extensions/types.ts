/**
 * @file extensions/types.ts
 * @description Core type definitions for the Volqan Extension Engine.
 *
 * All extensions distributed through Bazarix (https://bazarix.link) or installed
 * manually must conform to the VolqanExtension interface defined here.
 */

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * The context object passed to every extension lifecycle hook.
 * Provides read/write access to configuration, the logger, and Volqan services.
 */
export interface ExtensionContext {
  /** Unique installation identifier for this Volqan deployment. */
  installationId: string;

  /** Extension-scoped key-value configuration store. */
  config: {
    get<T = unknown>(key: string): T | undefined;
    set<T = unknown>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
  };

  /** Structured logger scoped to the calling extension. */
  logger: {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  };

  /** Emit and subscribe to Volqan lifecycle events. */
  events: {
    emit(event: string, payload?: unknown): void;
    on(event: string, handler: (payload: unknown) => void | Promise<void>): void;
    off(event: string, handler: (payload: unknown) => void | Promise<void>): void;
  };
}

// ---------------------------------------------------------------------------
// Admin UI building blocks
// ---------------------------------------------------------------------------

/** A navigation item added to the admin sidebar by an extension. */
export interface MenuItem {
  /** Unique key used for active-state detection and ordering. */
  key: string;

  /** Display label shown in the sidebar. */
  label: string;

  /** Heroicon or Lucide icon name (e.g. "puzzle-piece"). */
  icon?: string;

  /** Route path within the admin panel (e.g. "/admin/my-extension"). */
  href: string;

  /** Optional badge text (e.g. a notification count). */
  badge?: string | number;

  /** Whether the item requires a specific role. Default: all authenticated users. */
  requiredRole?: 'viewer' | 'editor' | 'admin' | 'super_admin';

  /** Nested child items rendered in an accordion. */
  children?: MenuItem[];
}

/** A full admin page registered by an extension. */
export interface AdminPage {
  /** Route path relative to /admin (e.g. "my-extension/settings"). */
  path: string;

  /** Page title shown in <title> and breadcrumbs. */
  title: string;

  /**
   * The React component to render.
   * Import-path string (resolved at boot) or a lazy React component reference.
   */
  component: string | React.LazyExoticComponent<React.ComponentType<unknown>>;

  /** Optional layout wrapper to use instead of the default admin layout. */
  layout?: 'default' | 'fullscreen' | 'minimal';

  /** Whether the page is accessible without authentication. */
  public?: boolean;
}

/** A dashboard widget contributed by an extension. */
export interface Widget {
  /** Unique widget identifier. */
  id: string;

  /** Human-readable widget name shown in the dashboard editor. */
  name: string;

  /** Default grid column span (1–12). */
  defaultColSpan?: number;

  /** Default grid row span. */
  defaultRowSpan?: number;

  /**
   * The React component to render inside the widget card.
   */
  component: string | React.LazyExoticComponent<React.ComponentType<unknown>>;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** A single configurable field contributed to the extension's settings panel. */
export interface SettingField {
  /** Dot-notation key used for storage (e.g. "smtp.host"). */
  key: string;

  /** Human-readable label. */
  label: string;

  /** Optional help text rendered below the input. */
  description?: string;

  /** Field type drives the rendered input component. */
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'boolean'
    | 'select'
    | 'multiselect'
    | 'password'
    | 'color'
    | 'url'
    | 'email'
    | 'json';

  /** Possible values for 'select' and 'multiselect' fields. */
  options?: Array<{ label: string; value: string | number | boolean }>;

  /** Default value applied on first install. */
  defaultValue?: unknown;

  /** Whether the field must be filled before the extension can be enabled. */
  required?: boolean;

  /** Validation pattern (RegExp source string). */
  pattern?: string;
}

// ---------------------------------------------------------------------------
// API & Content
// ---------------------------------------------------------------------------

/** An HTTP route registered by an extension under the Volqan API namespace. */
export interface RouteDefinition {
  /** HTTP method. */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

  /** Route path relative to /api/extensions/{vendor}/{name} (e.g. "/webhook"). */
  path: string;

  /**
   * Async request handler.
   * Receives a Node.js-compatible IncomingMessage-like object and returns a Response.
   */
  handler: (req: ExtensionRequest) => Promise<ExtensionResponse>;

  /** Whether the route is publicly accessible without Volqan session auth. */
  public?: boolean;

  /** Rate-limit config for this specific route. */
  rateLimit?: {
    maxRequests: number;
    windowSeconds: number;
  };
}

/** Minimal request shape passed to extension route handlers. */
export interface ExtensionRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
}

/** Minimal response shape returned from extension route handlers. */
export interface ExtensionResponse {
  status?: number;
  headers?: Record<string, string>;
  body: unknown;
}

/** A content lifecycle hook registered by an extension. */
export interface ContentHook {
  /** Content model to target (e.g. "post", "product", or "*" for all). */
  model: string;

  /**
   * Hook event timing.
   * - beforeCreate/beforeUpdate/beforeDelete: can mutate or cancel the operation.
   * - afterCreate/afterUpdate/afterDelete:    read-only side effects.
   */
  event:
    | 'beforeCreate'
    | 'afterCreate'
    | 'beforeUpdate'
    | 'afterUpdate'
    | 'beforeDelete'
    | 'afterDelete';

  /**
   * The hook handler.
   * Return value is used for before-hooks (mutations) and ignored for after-hooks.
   */
  handler: (payload: ContentHookPayload) => Promise<ContentHookPayload | void>;
}

/** Payload passed to content lifecycle hook handlers. */
export interface ContentHookPayload {
  /** The content model name. */
  model: string;

  /** The operation being performed. */
  operation: 'create' | 'update' | 'delete';

  /** The data being written (for create/update hooks). */
  data?: Record<string, unknown>;

  /** The existing record (for update/delete hooks). */
  existing?: Record<string, unknown>;

  /** Abort the operation with this error message (before-hooks only). */
  abort?: (reason: string) => void;
}

/** A database migration contributed by an extension. */
export interface Migration {
  /** Unique migration identifier in the format "YYYYMMDDHHMMSS_description". */
  id: string;

  /** Human-readable migration description. */
  description: string;

  /** SQL or Prisma migration content to execute. */
  up: string;

  /** SQL to reverse the migration (optional but recommended). */
  down?: string;
}

// ---------------------------------------------------------------------------
// Core extension interface
// ---------------------------------------------------------------------------

/**
 * VolqanExtension
 *
 * Every extension — whether installed manually or purchased through Bazarix
 * (https://bazarix.link) — must export a default object conforming to this
 * interface.
 *
 * Renamed from FrameworkExtension per project naming convention.
 */
export interface VolqanExtension {
  /**
   * Globally unique extension identifier.
   * Format: "vendor/extension-name" (e.g. "acme/blog" or "volqan/seo").
   */
  id: string;

  /** Semantic version string (e.g. "1.2.3"). */
  version: string;

  /** Human-readable display name. */
  name: string;

  /** Short description shown in the Extension Manager. */
  description: string;

  /** Extension author information. */
  author: {
    name: string;
    url?: string;
  };

  // -------------------------------------------------------------------------
  // Lifecycle hooks
  // -------------------------------------------------------------------------

  /** Called once when the extension is first installed. */
  onInstall?: (ctx: ExtensionContext) => Promise<void>;

  /** Called once when the extension is uninstalled. */
  onUninstall?: (ctx: ExtensionContext) => Promise<void>;

  /** Called each time the extension is enabled. */
  onEnable?: (ctx: ExtensionContext) => Promise<void>;

  /** Called each time the extension is disabled. */
  onDisable?: (ctx: ExtensionContext) => Promise<void>;

  /**
   * Called on every application boot while the extension is enabled.
   * Use for registering routes, hooks, and background services.
   */
  onBoot?: (ctx: ExtensionContext) => Promise<void>;

  // -------------------------------------------------------------------------
  // Admin UI contributions
  // -------------------------------------------------------------------------

  /** Navigation items to inject into the admin sidebar. */
  adminMenuItems?: MenuItem[];

  /** Full admin pages to register under the /admin/* namespace. */
  adminPages?: AdminPage[];

  /** Dashboard widgets available to users in the dashboard editor. */
  adminWidgets?: Widget[];

  /** Configuration fields rendered in the extension's settings panel. */
  adminSettings?: SettingField[];

  // -------------------------------------------------------------------------
  // Backend contributions
  // -------------------------------------------------------------------------

  /** API routes registered under /api/extensions/{vendor}/{name}. */
  apiRoutes?: RouteDefinition[];

  /** Raw GraphQL SDL string to merge into the auto-generated schema. */
  graphqlSchema?: string;

  /** Content model lifecycle hooks. */
  contentHooks?: ContentHook[];

  /** Database migrations to run on install/upgrade. */
  databaseMigrations?: Migration[];

  // -------------------------------------------------------------------------
  // Bazarix marketplace metadata
  // -------------------------------------------------------------------------

  /**
   * Marketplace listing metadata.
   * Only relevant for extensions distributed through https://bazarix.link.
   */
  marketplace?: {
    /** Bazarix category slug (e.g. "content", "ecommerce", "analytics"). */
    category: string;

    /** Searchable tags. */
    tags: string[];

    /** Public screenshot URLs hosted on Cloudflare R2 or similar. */
    screenshotUrls: string[];

    /** Live demo URL for the listing page. */
    demoUrl?: string;

    /** Price in USD. Omit for free extensions. Min $5, max $999. */
    price?: number;

    /**
     * Bazarix license key in the format MKT-{PRODUCT_ID}-{INSTALL_ID}-{EXPIRY_HASH}.
     * Validated server-side by the extension engine on every boot.
     * Never expose this value to the client.
     */
    licenseKey?: string;
  };
}

// ---------------------------------------------------------------------------
// React namespace shim (avoids importing React in a pure types file)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace React {
  // Minimal shim so AdminPage.component and Widget.component can reference
  // React.LazyExoticComponent without importing React at runtime.
  // The actual React types are provided by the consumer package.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type LazyExoticComponent<T extends ComponentType<any>> = {
    readonly _payload: unknown;
    readonly _init: unknown;
    $$typeof: symbol;
  } & T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ComponentType<P = {}> = (props: P) => JSX.Element | null;
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Element {}
  }
}
