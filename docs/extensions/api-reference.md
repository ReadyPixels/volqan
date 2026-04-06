---
title: Extension API Reference — Volqan
description: Complete reference for the VolqanExtension interface, all hook types, registration functions, and extension APIs.
---

# Extension API Reference

This is the complete API reference for Volqan extensions. All types are defined in `@volqan/core` and re-exported by `@volqan/extension-sdk`.

---

## Table of Contents

- [VolqanExtension Interface](#volqanextension-interface)
- [ExtensionContext](#extensioncontext)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Admin UI Types](#admin-ui-types)
- [API Route Types](#api-route-types)
- [Content Hook Types](#content-hook-types)
- [Database Migration Types](#database-migration-types)
- [Marketplace Metadata](#marketplace-metadata)
- [Configuration Schema](#configuration-schema)
- [Event System](#event-system)
- [Storage API](#storage-api)

---

## VolqanExtension Interface

The root interface every extension must implement.

```typescript
interface VolqanExtension {
  // Identity
  id: string;                        // "vendor/extension-name"
  version: string;                   // Semver: "1.0.0"
  name: string;                      // Human-readable display name
  description: string;               // One-sentence description
  author: {
    name: string;
    url?: string;
  };

  // Lifecycle hooks
  onInstall?: (ctx: ExtensionContext) => Promise<void>;
  onUninstall?: (ctx: ExtensionContext) => Promise<void>;
  onEnable?: (ctx: ExtensionContext) => Promise<void>;
  onDisable?: (ctx: ExtensionContext) => Promise<void>;
  onBoot?: (ctx: ExtensionContext) => Promise<void>;

  // Admin UI contributions
  adminMenuItems?: MenuItem[];
  adminPages?: AdminPage[];
  adminWidgets?: Widget[];
  adminSettings?: SettingField[];

  // Backend contributions
  apiRoutes?: RouteDefinition[];
  graphqlSchema?: string;
  contentHooks?: ContentHook[];
  databaseMigrations?: Migration[];

  // Marketplace metadata
  marketplace?: {
    category: string;
    tags: string[];
    screenshotUrls: string[];
    demoUrl?: string;
    price?: number;
    licenseKey?: string;
  };
}
```

### Identity Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Globally unique ID in `"vendor/name"` format (e.g. `"acme/blog"`) |
| `version` | `string` | Yes | Semver string (e.g. `"1.0.0"`) |
| `name` | `string` | Yes | Display name shown in the Extension Manager |
| `description` | `string` | Yes | One-sentence description |
| `author.name` | `string` | Yes | Author or organization name |
| `author.url` | `string` | No | Author website URL |

---

## ExtensionContext

Passed to every lifecycle hook. Provides scoped access to configuration, logging, and events.

```typescript
interface ExtensionContext {
  installationId: string;

  config: {
    get<T = unknown>(key: string): T | undefined;
    set<T = unknown>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
  };

  logger: {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  };

  events: {
    emit(event: string, payload?: unknown): void;
    on(event: string, handler: (payload: unknown) => void | Promise<void>): void;
    off(event: string, handler: (payload: unknown) => void | Promise<void>): void;
  };
}
```

### config

Extension-scoped key-value store. Keys are namespaced per extension — you won't collide with other extensions.

```typescript
// Store a value
await ctx.config.set('smtp.host', 'mail.example.com');

// Retrieve a value (typed)
const host = ctx.config.get<string>('smtp.host');

// Delete a value
await ctx.config.delete('smtp.host');
```

### logger

Structured logger scoped to the calling extension. All log entries automatically include the extension ID.

```typescript
ctx.logger.debug('Processing webhook', { webhookId: '123' });
ctx.logger.info('Extension enabled');
ctx.logger.warn('Deprecated API usage detected');
ctx.logger.error('Failed to send email', error, { recipient: 'user@example.com' });
```

### events

Publish/subscribe event bus for inter-extension and core communication.

```typescript
// Emit an event
ctx.events.emit('myext:data-ready', { count: 42 });

// Listen for events
const handler = (payload: unknown) => {
  console.log('Data ready:', payload);
};
ctx.events.on('myext:data-ready', handler);

// Stop listening
ctx.events.off('myext:data-ready', handler);
```

**Built-in events:**

| Event | Payload | Description |
|---|---|---|
| `content:registerType` | `ContentTypeDefinition` | Register a new content type |
| `content:unregisterType` | `{ slug: string }` | Remove a content type |
| `api:registerRoutes` | `RouteDefinition[]` | Register API routes dynamically |
| `api:unregisterRoutes` | `RouteDefinition[]` | Remove API routes |

---

## Lifecycle Hooks

All lifecycle hooks are optional and return `Promise<void>`.

### onInstall

```typescript
onInstall?: (ctx: ExtensionContext) => Promise<void>;
```

Called once when the extension is first installed. Use for:
- Registering content types via `ctx.events.emit('content:registerType', ...)`
- Setting default configuration values
- Running one-time setup

### onUninstall

```typescript
onUninstall?: (ctx: ExtensionContext) => Promise<void>;
```

Called once when the extension is uninstalled. Use for:
- Unregistering content types
- Cleaning up stored data
- Removing configuration keys

### onEnable

```typescript
onEnable?: (ctx: ExtensionContext) => Promise<void>;
```

Called each time the extension is enabled (toggled on). Use for:
- Registering API routes
- Starting background services

### onDisable

```typescript
onDisable?: (ctx: ExtensionContext) => Promise<void>;
```

Called each time the extension is disabled (toggled off). Use for:
- Unregistering API routes
- Stopping background services

### onBoot

```typescript
onBoot?: (ctx: ExtensionContext) => Promise<void>;
```

Called on every application boot while the extension is enabled. Use for:
- Re-registering routes and hooks
- Starting background tasks
- Warming caches

**Execution order on first install:**

```
databaseMigrations → onInstall → onEnable → onBoot
```

**Execution order on normal boot:**

```
databaseMigrations (if version changed) → onBoot
```

---

## Admin UI Types

### MenuItem

A navigation item added to the admin sidebar.

```typescript
interface MenuItem {
  key: string;                                              // Unique key for ordering and active state
  label: string;                                            // Display label
  icon?: string;                                            // Heroicon or Lucide icon name
  href: string;                                             // Route path (e.g. "/admin/my-ext")
  badge?: string | number;                                  // Optional badge (e.g. notification count)
  requiredRole?: 'viewer' | 'editor' | 'admin' | 'super_admin';  // Access control
  children?: MenuItem[];                                    // Nested items (rendered as accordion)
}
```

**Example:**

```typescript
adminMenuItems: [
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'chart-bar',
    href: '/admin/analytics',
    badge: 3,
    requiredRole: 'editor',
    children: [
      { key: 'analytics-overview', label: 'Overview', href: '/admin/analytics' },
      { key: 'analytics-reports', label: 'Reports', href: '/admin/analytics/reports' },
    ],
  },
],
```

### AdminPage

A full page registered under the `/admin/*` namespace.

```typescript
interface AdminPage {
  path: string;                         // Relative to /admin (e.g. "my-ext/settings")
  title: string;                        // Shown in <title> and breadcrumbs
  component: string | React.LazyExoticComponent<React.ComponentType<unknown>>;
  layout?: 'default' | 'fullscreen' | 'minimal';  // Layout wrapper
  public?: boolean;                     // Accessible without authentication
}
```

The `component` field accepts either:
- A **string path** resolved at boot time (e.g. `'@vendor/extension/components/MyPage'`)
- A **lazy React component** (e.g. `lazy(() => import('./MyPage.js'))`)

### Widget

A dashboard widget contributed by an extension.

```typescript
interface Widget {
  id: string;           // Unique widget identifier
  name: string;         // Human-readable name (shown in dashboard editor)
  defaultColSpan?: number;  // Grid columns (1–12)
  defaultRowSpan?: number;  // Grid rows
  component: string | React.LazyExoticComponent<React.ComponentType<unknown>>;
}
```

### SettingField

A configurable field in the extension's settings panel. Volqan auto-generates the settings UI from this array.

```typescript
interface SettingField {
  key: string;           // Dot-notation key (e.g. "smtp.host")
  label: string;         // Human-readable label
  description?: string;  // Help text below the input
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
  options?: Array<{ label: string; value: string | number | boolean }>;
  defaultValue?: unknown;
  required?: boolean;
  pattern?: string;      // RegExp source string for validation
}
```

**Example:**

```typescript
adminSettings: [
  {
    key: 'api.endpoint',
    label: 'API Endpoint',
    description: 'The external API URL to connect to.',
    type: 'url',
    required: true,
    pattern: '^https://',
  },
  {
    key: 'api.key',
    label: 'API Key',
    type: 'password',
    required: true,
  },
  {
    key: 'sync.interval',
    label: 'Sync Interval',
    description: 'How often to sync data (in minutes).',
    type: 'select',
    options: [
      { label: '5 minutes', value: 5 },
      { label: '15 minutes', value: 15 },
      { label: '1 hour', value: 60 },
    ],
    defaultValue: 15,
  },
  {
    key: 'features.darkMode',
    label: 'Enable Dark Mode',
    type: 'boolean',
    defaultValue: false,
  },
],
```

---

## API Route Types

### RouteDefinition

An HTTP route registered under `/api/extensions/{vendor}/{name}/`.

```typescript
interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  path: string;                                  // Relative path (e.g. "/webhook")
  handler: (req: ExtensionRequest) => Promise<ExtensionResponse>;
  public?: boolean;                              // Accessible without auth (default: false)
  rateLimit?: {
    maxRequests: number;
    windowSeconds: number;
  };
}
```

### ExtensionRequest

```typescript
interface ExtensionRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
}
```

### ExtensionResponse

```typescript
interface ExtensionResponse {
  status?: number;                       // HTTP status code (default: 200)
  headers?: Record<string, string>;      // Response headers
  body: unknown;                         // Response body (JSON-serializable)
}
```

**Example:**

```typescript
apiRoutes: [
  {
    method: 'POST',
    path: '/webhook',
    public: true,
    rateLimit: { maxRequests: 10, windowSeconds: 60 },
    async handler(req) {
      const payload = req.body as { event: string; data: unknown };

      if (!payload.event) {
        return { status: 400, body: { error: 'Missing event field' } };
      }

      // Process the webhook...
      return { status: 200, body: { received: true } };
    },
  },
],
```

---

## Content Hook Types

### ContentHook

React to content lifecycle events (create, update, delete).

```typescript
interface ContentHook {
  model: string;   // Content model slug, or "*" for all models
  event:
    | 'beforeCreate'
    | 'afterCreate'
    | 'beforeUpdate'
    | 'afterUpdate'
    | 'beforeDelete'
    | 'afterDelete';
  handler: (payload: ContentHookPayload) => Promise<ContentHookPayload | void>;
}
```

### ContentHookPayload

```typescript
interface ContentHookPayload {
  model: string;                                // Content model name
  operation: 'create' | 'update' | 'delete';   // Operation being performed
  data?: Record<string, unknown>;               // Data being written (create/update)
  existing?: Record<string, unknown>;           // Existing record (update/delete)
  abort?: (reason: string) => void;             // Cancel the operation (before-hooks only)
}
```

**Hook behavior:**

- **before-hooks** can mutate `payload.data` and return the modified payload. They can also call `payload.abort('reason')` to cancel the operation.
- **after-hooks** are read-only side effects. Return value is ignored.

**Example:**

```typescript
contentHooks: [
  // Auto-generate slug from title
  {
    model: 'posts',
    event: 'beforeCreate',
    async handler(payload) {
      if (payload.data && !payload.data['slug'] && payload.data['title']) {
        payload.data['slug'] = String(payload.data['title'])
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 80);
      }
      return payload;
    },
  },
  // Log all deletions
  {
    model: '*',
    event: 'afterDelete',
    async handler(payload) {
      console.log(`Deleted ${payload.model} entry:`, payload.existing);
    },
  },
  // Prevent deletion of published posts
  {
    model: 'posts',
    event: 'beforeDelete',
    async handler(payload) {
      if (payload.existing?.['status'] === 'PUBLISHED') {
        payload.abort?.('Cannot delete published posts. Unpublish first.');
      }
    },
  },
],
```

---

## Database Migration Types

### Migration

Extensions can include database migrations that run automatically on install or version upgrade.

```typescript
interface Migration {
  id: string;           // Format: "YYYYMMDDHHMMSS_description"
  description: string;  // Human-readable description
  up: string;           // SQL to run on upgrade
  down?: string;        // SQL to run on rollback (recommended)
}
```

**Rules:**

- Migrations run in `id` order (lexicographic sort on the timestamp prefix)
- Always namespace your tables with your extension vendor/name to avoid collisions
- Include `down` migrations for reversibility

**Example:**

```typescript
databaseMigrations: [
  {
    id: '20250101120000_create_subscribers',
    description: 'Create newsletter subscribers table',
    up: `
      CREATE TABLE IF NOT EXISTS ext_acme_newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        confirmed BOOLEAN DEFAULT FALSE,
        subscribed_at TIMESTAMP DEFAULT NOW()
      );
    `,
    down: `DROP TABLE IF EXISTS ext_acme_newsletter_subscribers;`,
  },
  {
    id: '20250201120000_add_name_column',
    description: 'Add name column to subscribers table',
    up: `ALTER TABLE ext_acme_newsletter_subscribers ADD COLUMN name VARCHAR(255);`,
    down: `ALTER TABLE ext_acme_newsletter_subscribers DROP COLUMN name;`,
  },
],
```

---

## Marketplace Metadata

Optional metadata for extensions distributed through the [Bazarix marketplace](https://bazarix.link).

```typescript
marketplace?: {
  category: string;           // Bazarix category slug (e.g. "content", "ecommerce", "analytics")
  tags: string[];             // Searchable tags
  screenshotUrls: string[];   // Public screenshot URLs (hosted on Cloudflare R2 or similar)
  demoUrl?: string;           // Live demo URL
  price?: number;             // Price in USD. Omit for free. Min $5, max $999.
  licenseKey?: string;        // Bazarix license key (format: MKT-{PRODUCT_ID}-{INSTALL_ID}-{EXPIRY_HASH})
};
```

The `licenseKey` is populated automatically by Bazarix after purchase and validated server-side by the Extension Engine on every boot. Never expose this value to the client.

---

## Configuration Schema

Extension settings are stored via the `ExtensionContext.config` API. This is a simple key-value store scoped to each extension.

### Conventions

- Use dot-notation for nested keys: `'smtp.host'`, `'smtp.port'`
- Prefix keys with your feature name to avoid internal collisions
- Set sensible defaults during `onInstall`
- Declare all configurable fields in `adminSettings` for auto-generated UI

### Type-safe access

```typescript
// Generic type parameter for type safety
const host = ctx.config.get<string>('smtp.host');        // string | undefined
const port = ctx.config.get<number>('smtp.port');        // number | undefined
const enabled = ctx.config.get<boolean>('smtp.enabled'); // boolean | undefined

// Set typed values
await ctx.config.set<string>('smtp.host', 'mail.example.com');
await ctx.config.set<number>('smtp.port', 587);
```

---

## Event System

The event system (`ExtensionContext.events`) is a typed publish/subscribe bus.

### Subscribing to events

```typescript
async onBoot(ctx: ExtensionContext): Promise<void> {
  ctx.events.on('content:afterCreate', (payload) => {
    const { model, data } = payload as { model: string; data: Record<string, unknown> };
    ctx.logger.info(`New ${model} created`, { id: data['id'] });
  });
}
```

### Publishing events

```typescript
ctx.events.emit('myext:sync-complete', {
  recordsProcessed: 150,
  duration: 3200,
});
```

### Cleanup

Always remove listeners in `onDisable` or `onUninstall` to prevent memory leaks:

```typescript
const myHandler = (payload: unknown) => { /* ... */ };

async onEnable(ctx: ExtensionContext): Promise<void> {
  ctx.events.on('some:event', myHandler);
},

async onDisable(ctx: ExtensionContext): Promise<void> {
  ctx.events.off('some:event', myHandler);
},
```

---

## Storage API

Extension data is persisted through the `ExtensionContext.config` store. For structured data, store JSON:

```typescript
interface SyncState {
  lastSyncAt: string;
  cursor: string;
  totalRecords: number;
}

// Write structured data
await ctx.config.set<SyncState>('sync.state', {
  lastSyncAt: new Date().toISOString(),
  cursor: 'abc123',
  totalRecords: 1500,
});

// Read structured data
const state = ctx.config.get<SyncState>('sync.state');
if (state) {
  console.log(`Last sync: ${state.lastSyncAt}, records: ${state.totalRecords}`);
}
```

For larger data sets (content entries, media, etc.), use content types registered via the event system — they're backed by the database and support full CRUD with pagination.

---

## Admin Page Integration

Extensions can provide fully custom admin pages. The component receives no props by default — use the `ExtensionContext` config and events system for data access.

### String component paths

```typescript
adminPages: [
  {
    path: 'my-ext/dashboard',
    title: 'Dashboard',
    component: '@vendor/my-ext/components/Dashboard',
  },
],
```

The string is resolved at boot time by the Extension Engine. The resolved module must default-export a React component.

### Lazy-loaded components

```typescript
import { lazy } from 'react';

adminPages: [
  {
    path: 'my-ext/dashboard',
    title: 'Dashboard',
    component: lazy(() => import('./components/Dashboard.js')),
  },
],
```

### Layout options

| Layout | Description |
|---|---|
| `'default'` | Standard admin layout with sidebar and topbar |
| `'fullscreen'` | Full viewport with no chrome — useful for builders and editors |
| `'minimal'` | Topbar only, no sidebar — useful for focused workflows |
