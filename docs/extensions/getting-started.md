---
title: Build Your First Extension — Volqan
description: Step-by-step guide to creating, developing, and testing a Volqan extension from scratch.
---

# Build Your First Extension

This guide walks you through creating a Volqan extension from scratch. By the end, you'll have a working "Hello World" extension with an admin page, an API route, and a lifecycle hook.

---

## Prerequisites

| Dependency | Version |
|---|---|
| [Node.js](https://nodejs.org) | 22 LTS |
| [pnpm](https://pnpm.io) | 9.x or later |

You'll also need a running Volqan installation. See [Getting Started](../getting-started.md) if you don't have one yet.

---

## Quick Start: Scaffold with the CLI

The fastest way to create an extension is the Volqan CLI:

```bash
npx @volqan/cli create extension my-extension
```

This generates:

```
my-extension/
├── src/
│   └── index.ts        # Extension entry point
├── package.json        # Dependencies and build scripts
├── tsconfig.json       # TypeScript configuration
├── .gitignore
└── README.md
```

Install dependencies and build:

```bash
cd my-extension
pnpm install
pnpm build
```

---

## Extension Structure

Every Volqan extension is an npm package that default-exports a `VolqanExtension` object. Here's the minimal structure:

```
my-extension/
├── src/
│   └── index.ts        # Must default-export a VolqanExtension
├── package.json
└── tsconfig.json
```

### package.json

```json
{
  "name": "@yourvendor/volqan-extension-hello",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsc -w",
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "@volqan/core": ">=0.1.0"
  },
  "devDependencies": {
    "@volqan/extension-sdk": "^0.1.0",
    "typescript": "^5.9.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src"]
}
```

> **Note:** `verbatimModuleSyntax` is enabled — always use `import type` for type-only imports.

---

## The `defineExtension()` API

The `defineExtension()` helper from `@volqan/extension-sdk` provides full type safety for your extension definition. It is a pass-through identity function that validates the shape of your object at compile time.

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'yourvendor/hello',
  version: '1.0.0',
  name: 'Hello World',
  description: 'A minimal Volqan extension.',
  author: { name: 'Your Name' },
});
```

You can also define the extension directly using the `VolqanExtension` type:

```typescript
import type { VolqanExtension } from '@volqan/core';

const helloExtension: VolqanExtension = {
  id: 'yourvendor/hello',
  version: '1.0.0',
  name: 'Hello World',
  description: 'A minimal Volqan extension.',
  author: { name: 'Your Name' },
};

export default helloExtension;
```

---

## Lifecycle Hooks

Extensions have five lifecycle hooks. All hooks receive an `ExtensionContext` and return `Promise<void>`.

| Hook | When it runs | Use case |
|---|---|---|
| `onInstall` | Once, when the extension is first installed | Register content types, set default config |
| `onEnable` | Each time the extension is enabled | Register API routes, start services |
| `onBoot` | On every application boot (while enabled) | Re-register routes, run background tasks |
| `onDisable` | Each time the extension is disabled | Unregister routes, stop services |
| `onUninstall` | Once, when the extension is uninstalled | Clean up content types, remove data |

**Execution order:**

First install:
```
databaseMigrations → onInstall → onEnable → onBoot
```

Normal startup (already installed):
```
databaseMigrations (if version changed) → onBoot
```

### Example: Lifecycle hooks

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'yourvendor/hello',
  version: '1.0.0',
  name: 'Hello World',
  description: 'A minimal Volqan extension.',
  author: { name: 'Your Name' },

  async onInstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello extension installed!');
    await ctx.config.set('greeting', 'Hello, Volqan!');
  },

  async onEnable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello extension enabled');
  },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    const greeting = ctx.config.get<string>('greeting') ?? 'Hello!';
    ctx.logger.info(`Booting with greeting: ${greeting}`);
  },

  async onDisable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello extension disabled');
  },

  async onUninstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.warn('Hello extension uninstalled — cleaning up');
    await ctx.config.delete('greeting');
  },
});
```

---

## Registering Routes

Extensions can register REST API routes under `/api/extensions/{vendor}/{name}/`. Each route has an HTTP method, path, async handler, and optional access control and rate limiting.

```typescript
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext, RouteDefinition } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'yourvendor/hello',
  version: '1.0.0',
  name: 'Hello World',
  description: 'A minimal extension with an API route.',
  author: { name: 'Your Name' },

  apiRoutes: [
    {
      method: 'GET',
      path: '/greet',
      public: true,
      rateLimit: { maxRequests: 60, windowSeconds: 60 },
      async handler(req) {
        const name = req.query['name'] ?? 'World';
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { message: `Hello, ${name}!` },
        };
      },
    },
  ],
});
```

This route is accessible at `GET /api/extensions/yourvendor/hello/greet?name=Alice`.

---

## Registering Admin Pages

Extensions can add full pages to the admin panel under `/admin/*`:

```typescript
adminMenuItems: [
  {
    key: 'hello',
    label: 'Hello',
    icon: 'hand-raised',
    href: '/admin/hello',
  },
],

adminPages: [
  {
    path: 'hello',
    title: 'Hello Page',
    component: '@yourvendor/volqan-extension-hello/components/HelloPage',
    layout: 'default',
  },
],
```

The `component` field is a string path resolved at boot time, or a lazy-loaded React component:

```typescript
import { lazy } from 'react';

adminPages: [
  {
    path: 'hello',
    title: 'Hello Page',
    component: lazy(() => import('./components/HelloPage.js')),
  },
],
```

---

## Registering Content Types

Extensions can register content types via the event system during `onInstall`:

```typescript
async onInstall(ctx: ExtensionContext): Promise<void> {
  ctx.events.emit('content:registerType', {
    name: 'Greeting',
    slug: 'greetings',
    description: 'Stored greetings from the Hello extension.',
    fields: [
      { name: 'message', type: 'text', label: 'Message', required: true },
      { name: 'author', type: 'text', label: 'Author' },
      { name: 'createdAt', type: 'datetime', label: 'Created At' },
    ],
    settings: { timestamps: true, softDelete: false, draftable: false, api: true },
  });
},
```

---

## Building and Testing Locally

### Development mode

Run TypeScript in watch mode:

```bash
pnpm dev
```

### Build for production

```bash
pnpm build
```

### Install in a local Volqan project

Link your extension into a Volqan project using pnpm:

```bash
# From your Volqan project root
pnpm add ../path/to/my-extension
```

Or add it to your workspace if developing in the Volqan monorepo:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'extensions/*'
  - 'my-extension'
```

### Type checking

```bash
npx tsc --noEmit
```

---

## Full Working Example: Hello World Extension

Here's a complete extension that demonstrates all the key features:

```typescript
// src/index.ts
import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext, RouteDefinition, ContentHook } from '@volqan/extension-sdk';

// Content hook: log every new content entry
const contentHooks: ContentHook[] = [
  {
    model: '*',
    event: 'afterCreate',
    async handler(payload) {
      console.log(`New ${payload.model} created:`, payload.data);
    },
  },
];

export default defineExtension({
  id: 'yourvendor/hello',
  version: '1.0.0',
  name: 'Hello World',
  description: 'A complete example Volqan extension with routes, admin pages, and content hooks.',
  author: {
    name: 'Your Name',
    url: 'https://yoursite.com',
  },

  // Lifecycle
  async onInstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello: installing');
    await ctx.config.set('hello.greeting', 'Hello, Volqan!');
    await ctx.config.set('hello.showBadge', true);
  },

  async onUninstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.warn('Hello: uninstalling');
    await ctx.config.delete('hello.greeting');
    await ctx.config.delete('hello.showBadge');
  },

  async onEnable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello: enabled');
  },

  async onDisable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello: disabled');
  },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Hello: booting');
  },

  // Admin UI
  adminMenuItems: [
    {
      key: 'hello',
      label: 'Hello',
      icon: 'hand-raised',
      href: '/admin/hello',
      badge: 'New',
    },
  ],

  adminPages: [
    {
      path: 'hello',
      title: 'Hello World',
      component: '@yourvendor/volqan-extension-hello/components/HelloPage',
      layout: 'default',
    },
  ],

  adminWidgets: [
    {
      id: 'hello-widget',
      name: 'Hello Widget',
      defaultColSpan: 4,
      defaultRowSpan: 2,
      component: '@yourvendor/volqan-extension-hello/components/HelloWidget',
    },
  ],

  adminSettings: [
    {
      key: 'hello.greeting',
      label: 'Greeting Message',
      description: 'The greeting displayed on the Hello page.',
      type: 'text',
      defaultValue: 'Hello, Volqan!',
      required: true,
    },
    {
      key: 'hello.showBadge',
      label: 'Show Badge',
      description: 'Show a "New" badge on the sidebar menu item.',
      type: 'boolean',
      defaultValue: true,
    },
  ],

  // API
  apiRoutes: [
    {
      method: 'GET',
      path: '/greet',
      public: true,
      rateLimit: { maxRequests: 60, windowSeconds: 60 },
      async handler(req) {
        const name = req.query['name'] ?? 'World';
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { message: `Hello, ${name}!` },
        };
      },
    },
  ],

  // Content hooks
  contentHooks,

  // Marketplace
  marketplace: {
    category: 'utility',
    tags: ['hello', 'example', 'starter'],
    screenshotUrls: [],
    demoUrl: 'https://demo.volqan.link/admin/hello',
  },
});
```

---

## Next Steps

- [API Reference](api-reference.md) — Complete `VolqanExtension` interface documentation
- [Examples](examples.md) — Common patterns and recipes
- [Publishing](publishing.md) — Publish your extension to the Bazarix marketplace
