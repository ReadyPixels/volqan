---
title: Extension Examples — Volqan
description: Common patterns and recipes for building Volqan extensions.
---

# Extension Examples

Common patterns and recipes for Volqan extension development. Each example is a working TypeScript snippet you can adapt.

---

## Table of Contents

- [Adding a Dashboard Widget](#adding-a-dashboard-widget)
- [Creating a Content Type](#creating-a-content-type)
- [Adding API Endpoints](#adding-api-endpoints)
- [Custom Admin Pages](#custom-admin-pages)
- [Using the Storage API](#using-the-storage-api)
- [Handling Extension Settings](#handling-extension-settings)

---

## Adding a Dashboard Widget

Dashboard widgets appear on the admin home page. Users can rearrange and resize them in the dashboard editor.

```typescript
import { defineExtension } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'acme/stats',
  version: '1.0.0',
  name: 'Quick Stats',
  description: 'Displays key metrics on the admin dashboard.',
  author: { name: 'Acme Corp' },

  adminWidgets: [
    {
      id: 'acme-stats-overview',
      name: 'Site Overview',
      defaultColSpan: 6,
      defaultRowSpan: 2,
      component: '@acme/volqan-extension-stats/components/OverviewWidget',
    },
    {
      id: 'acme-stats-traffic',
      name: 'Traffic Graph',
      defaultColSpan: 6,
      defaultRowSpan: 3,
      component: '@acme/volqan-extension-stats/components/TrafficWidget',
    },
    {
      id: 'acme-stats-recent',
      name: 'Recent Activity',
      defaultColSpan: 4,
      defaultRowSpan: 4,
      component: '@acme/volqan-extension-stats/components/RecentActivityWidget',
    },
  ],
});
```

**Widget component (React):**

```tsx
// src/components/OverviewWidget.tsx
export default function OverviewWidget() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">1,234</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Posts</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">56.7K</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Page Views</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">892</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Users</p>
      </div>
    </div>
  );
}
```

---

## Creating a Content Type

Content types define structured data models that Volqan manages. Register them during `onInstall` via the event system.

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'acme/testimonials',
  version: '1.0.0',
  name: 'Testimonials',
  description: 'Collect and display customer testimonials.',
  author: { name: 'Acme Corp' },

  async onInstall(ctx: ExtensionContext): Promise<void> {
    ctx.events.emit('content:registerType', {
      name: 'Testimonial',
      slug: 'testimonials',
      description: 'Customer testimonials managed by the Testimonials extension.',
      fields: [
        {
          name: 'customerName',
          type: 'text',
          label: 'Customer Name',
          required: true,
          sortable: true,
        },
        {
          name: 'company',
          type: 'text',
          label: 'Company',
          filterable: true,
        },
        {
          name: 'quote',
          type: 'textarea',
          label: 'Quote',
          required: true,
          validation: { max: 500 },
        },
        {
          name: 'avatar',
          type: 'image',
          label: 'Avatar',
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Rating (1-5)',
          required: true,
          validation: { min: 1, max: 5 },
        },
        {
          name: 'featured',
          type: 'boolean',
          label: 'Featured',
          filterable: true,
        },
      ],
      settings: {
        timestamps: true,
        softDelete: false,
        draftable: true,
        api: true,
      },
    });

    ctx.logger.info('Testimonials: content type registered');
  },

  async onUninstall(ctx: ExtensionContext): Promise<void> {
    ctx.events.emit('content:unregisterType', { slug: 'testimonials' });
    ctx.logger.warn('Testimonials: content type removed');
  },

  // Public API to fetch testimonials
  apiRoutes: [
    {
      method: 'GET',
      path: '/featured',
      public: true,
      rateLimit: { maxRequests: 60, windowSeconds: 60 },
      async handler(_req) {
        // In production, query content service for featured testimonials
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { data: [], meta: { total: 0 } },
        };
      },
    },
  ],
});
```

---

## Adding API Endpoints

Extensions can register multiple API endpoints with different HTTP methods, authentication requirements, and rate limits.

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext, RouteDefinition } from '@volqan/extension-sdk';

function buildRoutes(ctx: ExtensionContext): RouteDefinition[] {
  return [
    // Public endpoint: search
    {
      method: 'GET',
      path: '/search',
      public: true,
      rateLimit: { maxRequests: 30, windowSeconds: 60 },
      async handler(req) {
        const query = req.query['q'] as string | undefined;
        if (!query || query.length < 2) {
          return { status: 400, body: { error: 'Query must be at least 2 characters' } };
        }

        ctx.logger.debug('Searching', { query });
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { results: [], query },
        };
      },
    },

    // Authenticated endpoint: reindex
    {
      method: 'POST',
      path: '/reindex',
      public: false,
      async handler(_req) {
        ctx.logger.info('Reindex triggered');
        ctx.events.emit('search:reindex-started');

        // Kick off reindexing...
        return {
          status: 202,
          body: { message: 'Reindex started', status: 'processing' },
        };
      },
    },

    // Webhook endpoint
    {
      method: 'POST',
      path: '/webhook',
      public: true,
      rateLimit: { maxRequests: 10, windowSeconds: 60 },
      async handler(req) {
        const signature = req.headers['x-webhook-signature'];
        if (!signature) {
          return { status: 401, body: { error: 'Missing signature' } };
        }

        const secret = ctx.config.get<string>('webhook.secret');
        // Validate signature against secret...

        ctx.logger.info('Webhook received', { event: (req.body as Record<string, unknown>)['event'] });
        return { status: 200, body: { received: true } };
      },
    },
  ];
}

export default defineExtension({
  id: 'acme/search',
  version: '1.0.0',
  name: 'Advanced Search',
  description: 'Full-text search with reindexing and webhooks.',
  author: { name: 'Acme Corp' },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    const routes = buildRoutes(ctx);
    ctx.events.emit('api:registerRoutes', routes);
  },

  apiRoutes: [],
});
```

Routes are mounted at `/api/extensions/acme/search/`:
- `GET /api/extensions/acme/search/search?q=hello` — public
- `POST /api/extensions/acme/search/reindex` — requires authentication
- `POST /api/extensions/acme/search/webhook` — public, rate-limited

---

## Custom Admin Pages

Extensions can register full admin pages with navigation menu items.

```typescript
import { defineExtension } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'acme/reports',
  version: '1.0.0',
  name: 'Reports',
  description: 'Analytics reports and data export.',
  author: { name: 'Acme Corp' },

  adminMenuItems: [
    {
      key: 'reports',
      label: 'Reports',
      icon: 'chart-bar',
      href: '/admin/reports',
      requiredRole: 'editor',
      children: [
        {
          key: 'reports-overview',
          label: 'Overview',
          icon: 'presentation-chart-line',
          href: '/admin/reports',
        },
        {
          key: 'reports-content',
          label: 'Content Report',
          icon: 'document-chart-bar',
          href: '/admin/reports/content',
        },
        {
          key: 'reports-export',
          label: 'Export Data',
          icon: 'arrow-down-tray',
          href: '/admin/reports/export',
          requiredRole: 'admin',
        },
      ],
    },
  ],

  adminPages: [
    {
      path: 'reports',
      title: 'Reports Overview',
      component: '@acme/volqan-extension-reports/components/Overview',
      layout: 'default',
    },
    {
      path: 'reports/content',
      title: 'Content Report',
      component: '@acme/volqan-extension-reports/components/ContentReport',
      layout: 'default',
    },
    {
      path: 'reports/export',
      title: 'Export Data',
      component: '@acme/volqan-extension-reports/components/ExportPage',
      layout: 'minimal',
    },
  ],
});
```

### Page layout options

| Layout | Description | When to use |
|---|---|---|
| `'default'` | Sidebar + topbar | Standard admin pages |
| `'fullscreen'` | Full viewport, no chrome | Visual editors, builders |
| `'minimal'` | Topbar only, no sidebar | Focused workflows, wizards |

---

## Using the Storage API

The `ExtensionContext.config` API is an extension-scoped key-value store. Use it for settings, state, and structured data.

### Simple key-value storage

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'acme/sync',
  version: '1.0.0',
  name: 'Data Sync',
  description: 'Sync data from external services.',
  author: { name: 'Acme Corp' },

  async onInstall(ctx: ExtensionContext): Promise<void> {
    // Set default configuration
    await ctx.config.set('sync.endpoint', 'https://api.example.com/v1');
    await ctx.config.set('sync.interval', 15);
    await ctx.config.set('sync.enabled', true);
  },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    const endpoint = ctx.config.get<string>('sync.endpoint');
    const interval = ctx.config.get<number>('sync.interval') ?? 15;
    const enabled = ctx.config.get<boolean>('sync.enabled') ?? false;

    if (!enabled) {
      ctx.logger.info('Sync: disabled, skipping');
      return;
    }

    ctx.logger.info('Sync: starting', { endpoint, interval });
  },
});
```

### Storing structured data

```typescript
interface SyncState {
  lastSyncAt: string;
  cursor: string;
  totalRecords: number;
  errors: string[];
}

async onBoot(ctx: ExtensionContext): Promise<void> {
  // Read previous sync state
  const state = ctx.config.get<SyncState>('sync.state');

  if (state) {
    ctx.logger.info('Resuming sync', {
      lastSync: state.lastSyncAt,
      cursor: state.cursor,
    });
  }

  // ... perform sync ...

  // Save new state
  await ctx.config.set<SyncState>('sync.state', {
    lastSyncAt: new Date().toISOString(),
    cursor: 'new-cursor-value',
    totalRecords: 1500,
    errors: [],
  });
}
```

---

## Handling Extension Settings

Declare settings fields in `adminSettings` — Volqan auto-generates a settings panel in the admin UI.

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'acme/email',
  version: '1.0.0',
  name: 'Email Notifications',
  description: 'Send email notifications for content events.',
  author: { name: 'Acme Corp' },

  adminSettings: [
    {
      key: 'smtp.host',
      label: 'SMTP Host',
      description: 'Your email server hostname.',
      type: 'text',
      required: true,
    },
    {
      key: 'smtp.port',
      label: 'SMTP Port',
      type: 'number',
      defaultValue: 587,
    },
    {
      key: 'smtp.username',
      label: 'Username',
      type: 'text',
      required: true,
    },
    {
      key: 'smtp.password',
      label: 'Password',
      type: 'password',
      required: true,
    },
    {
      key: 'smtp.secure',
      label: 'Use TLS',
      description: 'Enable TLS encryption for the SMTP connection.',
      type: 'boolean',
      defaultValue: true,
    },
    {
      key: 'from.email',
      label: 'From Email',
      type: 'email',
      required: true,
      pattern: '^[^@]+@[^@]+\\.[^@]+$',
    },
    {
      key: 'from.name',
      label: 'From Name',
      type: 'text',
      defaultValue: 'Volqan',
    },
    {
      key: 'notifications.events',
      label: 'Notification Events',
      description: 'Which content events trigger an email notification.',
      type: 'multiselect',
      options: [
        { label: 'Content Created', value: 'create' },
        { label: 'Content Updated', value: 'update' },
        { label: 'Content Published', value: 'publish' },
        { label: 'Content Deleted', value: 'delete' },
        { label: 'User Registered', value: 'user_register' },
      ],
      defaultValue: ['publish'],
    },
    {
      key: 'template.custom',
      label: 'Custom Email Template',
      description: 'HTML template for notification emails. Use {{title}}, {{author}}, {{url}} placeholders.',
      type: 'json',
    },
  ],

  async onBoot(ctx: ExtensionContext): Promise<void> {
    // Read settings
    const host = ctx.config.get<string>('smtp.host');
    const port = ctx.config.get<number>('smtp.port') ?? 587;

    if (!host) {
      ctx.logger.warn('Email: SMTP not configured, notifications disabled');
      return;
    }

    ctx.logger.info('Email: ready', { host, port });
  },

  // Listen for content events and send notifications
  contentHooks: [
    {
      model: '*',
      event: 'afterCreate',
      async handler(payload) {
        // Check if 'create' is in the selected notification events
        // Then send an email notification...
        console.log(`Content created in ${payload.model}`, payload.data);
      },
    },
  ],
});
```

---

## Next Steps

- [API Reference](api-reference.md) — Complete type reference
- [Publishing](publishing.md) — Publish to the Bazarix marketplace
- [Getting Started](getting-started.md) — Build your first extension
