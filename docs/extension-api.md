---
title: Extension API — Volqan
description: Complete reference for building Volqan extensions using the VolqanExtension interface and Extension SDK.
---

# Extension API

This document is the authoritative reference for building Volqan extensions. It covers the complete `VolqanExtension` TypeScript interface, the `ExtensionContext` API, every lifecycle hook, all admin UI integration points, API and GraphQL extension, content hooks, database migrations, marketplace metadata, and a complete worked example.

---

## Overview

A Volqan extension is any npm package that exports a default export conforming to the `VolqanExtension` interface. The Extension Engine loads, validates, sandboxes, and lifecycle-manages every installed extension automatically.

Extensions can:
- Add menu items and full-page UIs to the admin panel
- Register REST API routes and GraphQL schema additions
- React to content lifecycle events (create, update, delete)
- Run database migrations to store their own data
- Display dashboard widgets
- Add settings panels to the admin UI
- List their metadata in the Bazarix marketplace

**Package naming convention:**

```
@vendor/volqan-extension-[name]
```

Community extensions scoped to the official Volqan namespace (with approval):

```
@volqan-ext/[name]
```

---

## The `VolqanExtension` Interface

```typescript
import type { ExtensionContext } from '@volqan/extension-sdk';

export interface VolqanExtension {
  // ─── Identity ──────────────────────────────────────────────────────────────
  id:          string;   // Format: "vendor/extension-name" — must be globally unique
  version:     string;   // Semver string, e.g. "1.0.0"
  name:        string;   // Human-readable display name
  description: string;   // One-sentence description shown in the Extension Manager
  author: {
    name: string;
    url?: string;         // Author or organization URL
  };

  // ─── Lifecycle Hooks ────────────────────────────────────────────────────────
  onInstall?:   (ctx: ExtensionContext) => Promise<void>;
  onUninstall?: (ctx: ExtensionContext) => Promise<void>;
  onEnable?:    (ctx: ExtensionContext) => Promise<void>;
  onDisable?:   (ctx: ExtensionContext) => Promise<void>;
  onBoot?:      (ctx: ExtensionContext) => Promise<void>;

  // ─── Admin UI Integration ───────────────────────────────────────────────────
  adminMenuItems?: MenuItem[];
  adminPages?:     AdminPage[];
  adminWidgets?:   Widget[];
  adminSettings?:  SettingField[];

  // ─── API Surface ────────────────────────────────────────────────────────────
  apiRoutes?:          RouteDefinition[];
  graphqlSchema?:      string;           // SDL schema string
  contentHooks?:       ContentHook[];
  databaseMigrations?: Migration[];

  // ─── Marketplace Metadata ───────────────────────────────────────────────────
  marketplace?: {
    category:       string;      // e.g. "content", "seo", "ecommerce", "analytics", "utilities"
    tags:           string[];
    screenshotUrls: string[];
    demoUrl?:       string;
    price?:         number;      // In USD. Omit or set 0 for free extensions
    licenseKey?:    string;      // Set by the licensing API after purchase — do not hardcode
  };
}
```

### Field Reference

#### `id`

A globally unique string identifying your extension. Must follow the format `vendor/extension-name` using only lowercase letters, numbers, and hyphens.

```typescript
id: 'acme/blog-pro'
```

The `id` is used for:
- Extension storage in the database
- License key lookup in the Bazarix API
- Dependency resolution between extensions
- Configuration namespacing

#### `version`

A [Semantic Versioning](https://semver.org) string. The Extension Engine uses this to determine when to re-run migrations.

```typescript
version: '1.2.0'
```

#### `name` and `description`

`name` is displayed in the Extension Manager list and header. `description` is shown as a subtitle. Keep both short and clear.

#### `author`

```typescript
author: {
  name: 'Acme Corp',
  url:  'https://acme.example.com',
}
```

---

## The `ExtensionContext` API

Every lifecycle hook receives an `ExtensionContext` instance. This is your interface to the Volqan framework internals.

```typescript
interface ExtensionContext {
  // ─── Database ──────────────────────────────────────────────────────────────
  db: PrismaClient;             // The shared Prisma client for database access

  // ─── Configuration ──────────────────────────────────────────────────────────
  config: {
    get<T>(key: string): T | undefined;  // Read a setting stored by this extension
    set(key: string, value: unknown): Promise<void>; // Persist a setting
  };

  // ─── Logging ────────────────────────────────────────────────────────────────
  log: {
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: Error): void;
  };

  // ─── Events ─────────────────────────────────────────────────────────────────
  events: {
    emit(event: string, payload: unknown): void;
    on(event: string, handler: (payload: unknown) => void): () => void; // Returns unsubscribe function
  };

  // ─── Content API ─────────────────────────────────────────────────────────────
  content: {
    findMany(model: string, args?: QueryArgs): Promise<Record<string, unknown>[]>;
    findOne(model: string, id: string): Promise<Record<string, unknown> | null>;
    create(model: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    update(model: string, id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    delete(model: string, id: string): Promise<void>;
  };

  // ─── Extension Identity ───────────────────────────────────────────────────────
  extensionId: string;          // The id of the currently running extension
  version:     string;          // The version of the currently running extension
}
```

### Database Access

Extensions share the same Prisma client as the core framework. Use `ctx.db` to access standard Prisma methods:

```typescript
async onBoot(ctx) {
  const posts = await ctx.db.post.findMany({
    where: { published: true },
    take: 10,
  });
  ctx.log.info('Loaded published posts', { count: posts.length });
}
```

> **Important:** Only access models your extension created via migrations, or use the `ctx.content` API for core content models. Directly modifying core framework database tables without a migration is unsupported and may break on upgrades.

### Configuration Storage

The config API provides a simple key-value store namespaced to your extension:

```typescript
async onInstall(ctx) {
  await ctx.config.set('webhookUrl', '');
  await ctx.config.set('enabled', true);
}

async onBoot(ctx) {
  const webhookUrl = ctx.config.get<string>('webhookUrl');
  if (webhookUrl) {
    // Register the webhook...
  }
}
```

---

## Lifecycle Hooks

Lifecycle hooks are async functions that run at specific points in the extension's life. All hooks are optional.

### `onInstall`

Called once when the user installs the extension for the first time. Use it to set default configuration, seed initial data, or display a first-run message.

```typescript
async onInstall(ctx: ExtensionContext): Promise<void> {
  ctx.log.info('Blog Pro installed — setting defaults');

  await ctx.config.set('postsPerPage', 10);
  await ctx.config.set('enableComments', false);
  await ctx.config.set('rssFeedEnabled', true);
}
```

`onInstall` runs **after** `databaseMigrations` have been applied. You can safely access your extension's database tables here.

### `onUninstall`

Called when the user removes the extension. Use it to clean up data, remove configuration, and release any resources your extension acquired.

```typescript
async onUninstall(ctx: ExtensionContext): Promise<void> {
  ctx.log.warn('Blog Pro is being uninstalled — cleaning up');

  // Remove extension-owned data
  await ctx.db.$executeRaw`DELETE FROM blog_pro_comments WHERE 1=1`;

  // Config cleanup happens automatically after this hook
}
```

> **Warning:** Dropping your own database tables in `onUninstall` is destructive. Consider a soft-delete or archiving strategy instead.

### `onEnable`

Called when the extension transitions from disabled to enabled state. This happens after `onInstall` on first use, and any subsequent enable from the Extension Manager.

```typescript
async onEnable(ctx: ExtensionContext): Promise<void> {
  ctx.events.emit('extension:enabled', { id: ctx.extensionId });
  ctx.log.info('Blog Pro enabled');
}
```

### `onDisable`

Called when the user disables the extension without uninstalling it. Use it to pause background jobs or deregister event listeners.

```typescript
async onDisable(ctx: ExtensionContext): Promise<void> {
  ctx.log.info('Blog Pro disabled — pausing background sync');
  // Background jobs are automatically stopped by the Extension Engine
}
```

### `onBoot`

Called on every application startup for all enabled extensions, after `onEnable` has completed at least once. This is where you perform any recurring initialization: connecting to external services, starting background processes, registering event listeners, and warming caches.

```typescript
async onBoot(ctx: ExtensionContext): Promise<void> {
  const webhookUrl = ctx.config.get<string>('webhookUrl');

  ctx.events.on('content:post:created', async (payload) => {
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
    }
  });
}
```

**Hook execution order on first install:**

```
databaseMigrations → onInstall → onEnable → onBoot
```

**Hook execution order on startup:**

```
databaseMigrations (if version changed) → onBoot
```

---

## Admin UI Integration

### Menu Items — `adminMenuItems`

Register items in the admin panel's sidebar navigation.

```typescript
adminMenuItems: [
  {
    id:    'blog-pro',
    label: 'Blog',
    icon:  'PenSquare',              // Lucide icon name
    path:  '/admin/ext/blog-pro',    // Path served by adminPages
    order: 30,                       // Lower number = higher in menu
    badge: {
      label: 'New',
      variant: 'default',            // 'default' | 'secondary' | 'destructive' | 'outline'
    },
    children: [
      { id: 'posts',      label: 'Posts',      path: '/admin/ext/blog-pro/posts' },
      { id: 'categories', label: 'Categories', path: '/admin/ext/blog-pro/categories' },
      { id: 'comments',   label: 'Comments',   path: '/admin/ext/blog-pro/comments' },
    ],
  },
],
```

**`MenuItem` type:**

```typescript
interface MenuItem {
  id:        string;
  label:     string;
  icon?:     string;            // Any Lucide icon name
  path:      string;
  order?:    number;            // Default: 50
  badge?: {
    label:   string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  children?: Omit<MenuItem, 'children' | 'icon'>[];
}
```

### Pages — `adminPages`

Register full page routes in the admin panel. Pages are rendered using Next.js App Router conventions inside the admin layout.

```typescript
adminPages: [
  {
    path:      '/admin/ext/blog-pro/posts',
    component: () => import('./pages/PostsPage'),
    title:     'Posts',
  },
  {
    path:      '/admin/ext/blog-pro/posts/new',
    component: () => import('./pages/NewPostPage'),
    title:     'New Post',
  },
  {
    path:      '/admin/ext/blog-pro/posts/:id/edit',
    component: () => import('./pages/EditPostPage'),
    title:     'Edit Post',
  },
],
```

**`AdminPage` type:**

```typescript
interface AdminPage {
  path:      string;
  component: () => Promise<{ default: React.ComponentType<{ params?: Record<string, string> }> }>;
  title:     string;
  access?:   ('super_admin' | 'admin' | 'editor' | 'viewer')[];  // Default: all roles
}
```

Page components receive `params` as a prop for dynamic route segments:

```typescript
// pages/EditPostPage.tsx
export default function EditPostPage({ params }: { params: { id: string } }) {
  const { data: post } = useVolqanContent('blog_pro_posts', params.id);
  return (/* ... */);
}
```

### Widgets — `adminWidgets`

Register widgets that appear on the admin dashboard.

```typescript
adminWidgets: [
  {
    id:        'blog-pro-stats',
    title:     'Blog Stats',
    component: () => import('./widgets/BlogStatsWidget'),
    size:      'medium',           // 'small' | 'medium' | 'large' | 'full'
    order:     10,
  },
],
```

**`Widget` type:**

```typescript
interface Widget {
  id:        string;
  title:     string;
  component: () => Promise<{ default: React.ComponentType }>;
  size:      'small' | 'medium' | 'large' | 'full';
  order?:    number;
}
```

### Settings — `adminSettings`

Register settings fields that appear in the extension's settings panel in the Extension Manager.

```typescript
adminSettings: [
  {
    key:          'postsPerPage',
    label:        'Posts per page',
    type:         'number',
    defaultValue: 10,
    min:          1,
    max:          100,
    description:  'Number of posts shown on the blog index page.',
  },
  {
    key:          'enableComments',
    label:        'Enable comments',
    type:         'toggle',
    defaultValue: false,
  },
  {
    key:          'rssFeedUrl',
    label:        'RSS Feed path',
    type:         'text',
    defaultValue: '/blog/feed.xml',
    placeholder:  '/blog/feed.xml',
  },
],
```

**`SettingField` type:**

```typescript
interface SettingField {
  key:          string;
  label:        string;
  type:         'text' | 'textarea' | 'number' | 'toggle' | 'select' | 'secret';
  defaultValue: string | number | boolean;
  description?: string;
  placeholder?: string;
  required?:    boolean;
  // For type: 'number'
  min?: number;
  max?: number;
  // For type: 'select'
  options?: { label: string; value: string }[];
}
```

---

## API Routes

Register custom REST API routes served under `/api/ext/[extension-id]/`.

```typescript
apiRoutes: [
  {
    method:  'GET',
    path:    '/posts',
    handler: async (req, res) => {
      const posts = await ctx.content.findMany('blog_pro_posts', {
        where:   { published: true },
        orderBy: { publishedAt: 'desc' },
        take:    10,
      });
      return res.json({ posts });
    },
    public: true,  // No authentication required for this endpoint
  },
  {
    method:  'POST',
    path:    '/posts',
    handler: async (req, res) => {
      const post = await ctx.content.create('blog_pro_posts', req.body);
      return res.status(201).json(post);
    },
    access: ['super_admin', 'admin', 'editor'],
  },
],
```

Routes are mounted at `/api/ext/acme/blog-pro/posts`, `/api/ext/acme/blog-pro/posts`, etc.

**`RouteDefinition` type:**

```typescript
interface RouteDefinition {
  method:  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path:    string;
  handler: (req: Request, res: Response) => Promise<Response>;
  public?: boolean;             // Default: false (requires authentication)
  access?: Role[];              // Roles allowed to access this route
}

type Role = 'super_admin' | 'admin' | 'editor' | 'viewer';
```

---

## GraphQL Schema Extension

Extend the auto-generated GraphQL schema with custom types, queries, and mutations.

```typescript
graphqlSchema: `
  type BlogPost {
    id:          ID!
    title:       String!
    slug:        String!
    body:        String
    publishedAt: String
    author:      User
    tags:        [String!]!
    readingTime: Int
  }

  type BlogPostConnection {
    nodes:      [BlogPost!]!
    totalCount: Int!
    pageInfo:   PageInfo!
  }

  extend type Query {
    blogPosts(
      limit:   Int   = 10
      offset:  Int   = 0
      tag:     String
      search:  String
    ): BlogPostConnection!

    blogPost(slug: String!): BlogPost
  }

  extend type Mutation {
    createBlogPost(input: CreateBlogPostInput!): BlogPost!
    updateBlogPost(id: ID!, input: UpdateBlogPostInput!): BlogPost!
    deleteBlogPost(id: ID!): Boolean!
  }

  input CreateBlogPostInput {
    title:       String!
    body:        String
    publishedAt: String
    tags:        [String!]
  }

  input UpdateBlogPostInput {
    title:       String
    body:        String
    publishedAt: String
    tags:        [String!]
  }
`,
```

Resolvers are registered separately via the `onBoot` hook using the `ctx.events` API or directly on the GraphQL registry. See the Extension SDK documentation for the resolver registration API.

---

## Content Hooks

React to content lifecycle events across all models in the system. Content hooks run server-side in a safe execution environment.

```typescript
contentHooks: [
  {
    model:  'Post',
    event:  'afterCreate',
    handler: async (payload, ctx) => {
      ctx.log.info('New post created', { id: payload.record.id });

      // Trigger a webhook, update a search index, send a notification...
      await fetch('https://example.com/webhook', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ event: 'post.created', data: payload.record }),
      });
    },
  },
  {
    model:  'Post',
    event:  'beforeDelete',
    handler: async (payload, ctx) => {
      // Cascade delete extension-owned related data before the post is deleted
      await ctx.db.$executeRaw`
        DELETE FROM blog_pro_comments
        WHERE post_id = ${payload.record.id}
      `;
    },
  },
],
```

**Content hook events:**

| Event | When it runs |
|---|---|
| `beforeCreate` | Before a new record is inserted |
| `afterCreate` | After a new record is successfully inserted |
| `beforeUpdate` | Before a record is updated |
| `afterUpdate` | After a record is successfully updated |
| `beforeDelete` | Before a record is deleted |
| `afterDelete` | After a record is deleted |

**`ContentHook` type:**

```typescript
interface ContentHook {
  model:    string;   // The Volqan model name, e.g. 'Post', 'User'
  event:    'beforeCreate' | 'afterCreate' | 'beforeUpdate' | 'afterUpdate' | 'beforeDelete' | 'afterDelete';
  handler:  (
    payload: ContentHookPayload,
    ctx:     ExtensionContext
  ) => Promise<void>;
}

interface ContentHookPayload {
  record:   Record<string, unknown>;   // The content record
  previous: Record<string, unknown> | null;  // Previous state (for update/delete events)
  user:     { id: string; role: string } | null;  // The admin user who triggered the change
}
```

---

## Database Migrations

Extensions can create and manage their own database tables. Migrations are plain SQL strings executed in order when the extension is installed or when the version changes.

```typescript
databaseMigrations: [
  {
    version:    '1.0.0',
    description: 'Create blog comments table',
    up: `
      CREATE TABLE IF NOT EXISTS blog_pro_comments (
        id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        post_id      TEXT NOT NULL,
        author_name  TEXT NOT NULL,
        author_email TEXT NOT NULL,
        body         TEXT NOT NULL,
        approved     BOOLEAN NOT NULL DEFAULT false,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS blog_pro_comments_post_id_idx
        ON blog_pro_comments (post_id);
    `,
    down: `
      DROP TABLE IF EXISTS blog_pro_comments;
    `,
  },
  {
    version:     '1.1.0',
    description: 'Add parent_id for threaded comments',
    up: `
      ALTER TABLE blog_pro_comments
        ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES blog_pro_comments(id) ON DELETE CASCADE;
    `,
    down: `
      ALTER TABLE blog_pro_comments DROP COLUMN IF EXISTS parent_id;
    `,
  },
],
```

**Migration rules:**
- Table names must be namespaced to your extension using your vendor/extension slug as a prefix (e.g., `blog_pro_`, `acme_myext_`).
- Migrations are applied in `version` order using semver comparison.
- Do not modify core Volqan tables (`volqan_*`, `_prisma_migrations`).
- The `down` function is called during rollback — always write it.

---

## Marketplace Metadata

If you plan to distribute your extension on [Bazarix](https://bazarix.link), include the `marketplace` field:

```typescript
marketplace: {
  category:       'content',              // 'content' | 'seo' | 'ecommerce' | 'analytics' | 'media' | 'utilities' | 'integration'
  tags:           ['blog', 'posts', 'comments', 'rss'],
  screenshotUrls: [
    'https://cdn.bazarix.link/ext/acme/blog-pro/screenshot-1.png',
    'https://cdn.bazarix.link/ext/acme/blog-pro/screenshot-2.png',
  ],
  demoUrl:  'https://demo.acme.example.com',
  price:    29,                           // USD. 0 or omit for free
  licenseKey: undefined,                  // Managed by the licensing API — never hardcode
}
```

The `licenseKey` field is set automatically by the Volqan Extension Engine after the user purchases and installs the extension. Never hardcode a license key into your extension source code.

---

## Complete Example: Building a Newsletter Extension

This example builds a minimal newsletter subscription extension that adds a subscriber list to the admin panel and an API endpoint for public sign-ups.

### 1. Initialize the Extension Package

```bash
# Install the Extension SDK
npm install -g @volqan/extension-sdk

# Scaffold a new extension
npx create-volqan-app --extension acme/newsletter
cd newsletter
pnpm install
```

### 2. Define the Extension

```typescript
// src/index.ts
import type { VolqanExtension } from '@volqan/extension-sdk';

const NewsletterExtension: VolqanExtension = {
  id:          'acme/newsletter',
  version:     '1.0.0',
  name:        'Newsletter',
  description: 'Collect email subscribers and send broadcasts from the admin panel.',
  author:      { name: 'Acme', url: 'https://acme.example.com' },

  databaseMigrations: [
    {
      version:     '1.0.0',
      description: 'Create newsletter subscribers table',
      up: `
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email      TEXT NOT NULL UNIQUE,
          name       TEXT,
          subscribed BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `,
      down: `DROP TABLE IF EXISTS newsletter_subscribers;`,
    },
  ],

  async onInstall(ctx) {
    ctx.log.info('Newsletter extension installed');
    await ctx.config.set('fromEmail', '');
    await ctx.config.set('fromName', 'Newsletter');
  },

  adminMenuItems: [
    {
      id:    'newsletter',
      label: 'Newsletter',
      icon:  'Mail',
      path:  '/admin/ext/acme/newsletter',
      order: 40,
      children: [
        { id: 'subscribers', label: 'Subscribers', path: '/admin/ext/acme/newsletter/subscribers' },
        { id: 'broadcasts',  label: 'Broadcasts',  path: '/admin/ext/acme/newsletter/broadcasts' },
      ],
    },
  ],

  adminPages: [
    {
      path:      '/admin/ext/acme/newsletter/subscribers',
      component: () => import('./pages/SubscribersPage'),
      title:     'Subscribers',
    },
  ],

  adminSettings: [
    { key: 'fromEmail', label: 'From email', type: 'text', defaultValue: '' },
    { key: 'fromName',  label: 'From name',  type: 'text', defaultValue: 'Newsletter' },
  ],

  apiRoutes: [
    {
      method: 'POST',
      path:   '/subscribe',
      public: true,
      handler: async (req, res) => {
        const { email, name } = await req.json();
        if (!email || !email.includes('@')) {
          return res.status(400).json({ error: 'Invalid email address' });
        }

        await ctx.db.$executeRaw`
          INSERT INTO newsletter_subscribers (email, name)
          VALUES (${email}, ${name ?? null})
          ON CONFLICT (email) DO UPDATE SET subscribed = true
        `;

        return res.json({ success: true });
      },
    },
  ],

  marketplace: {
    category:       'utilities',
    tags:           ['newsletter', 'email', 'subscribers', 'marketing'],
    screenshotUrls: [],
    price:          0,
  },
};

export default NewsletterExtension;
```

### 3. Test Locally

```bash
# Link the extension into a local Volqan project
cd /path/to/my-volqan-project
pnpm add --workspace @acme/newsletter

# Add to config
```

```typescript
// volqan.config.ts
import NewsletterExtension from '@acme/newsletter';

export default defineConfig({
  extensions: {
    installed: [NewsletterExtension],
  },
});
```

```bash
pnpm dev
```

Navigate to `http://localhost:3000/admin`. You should see **Newsletter** in the sidebar.

### 4. Publish to npm and Bazarix

```bash
# Build the extension
pnpm build

# Publish to npm
npm publish --access public

# Submit to Bazarix marketplace at bazarix.link/sellers/submit
```

---

## Extension SDK Setup

The Extension SDK (`@volqan/extension-sdk`) is the official toolkit for building Volqan extensions. It ships with:

- TypeScript types for the full `VolqanExtension` interface
- The `useVolqanContent` React hook for admin page components
- The `useVolqanConfig` hook for reading extension settings in admin UI
- CLI tooling for scaffolding, testing, and building extensions
- A local development server that simulates the Extension Engine sandbox

**Install:**

```bash
pnpm add -D @volqan/extension-sdk
```

**`tsconfig.json` for extensions:**

```json
{
  "extends": "@volqan/extension-sdk/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**Build:**

```bash
pnpm volqan-ext build
```

**Type-check:**

```bash
pnpm volqan-ext typecheck
```

**Run against a local Volqan dev server:**

```bash
pnpm volqan-ext dev --volqan-url http://localhost:3000
```

---

## Extension Engine Security Model

The Extension Engine provides a layered security approach:

1. **Interface validation** — Every extension export is validated against the `VolqanExtension` interface at load time. Invalid shapes are rejected before any code runs.
2. **Lifecycle sandboxing** — Lifecycle hooks run in an isolated context with access limited to the `ExtensionContext` API. Direct access to system internals beyond the provided context is not available.
3. **Database namespacing** — Extensions are expected to namespace all table names. Attempting to access core tables (`volqan_*`) from extension code raises a logged warning.
4. **License validation** — Paid extensions have their license key validated server-side against the Bazarix API (`https://bazarix.link/api/v1/license/validate`) on every boot. Invalid licenses disable the extension automatically.
5. **Marketplace review** — All Bazarix listings undergo a technical review before going live. Listings are checked for obfuscated code, undisclosed network calls, SQL injection, XSS, and CSRF vulnerabilities.

---

*Extension API reference — Volqan v0.0.1 · [GitHub](https://github.com/ReadyPixels/volqan) · [Bazarix Marketplace](https://bazarix.link)*
