# @volqan/extension-sdk

Developer SDK for building [Volqan](https://volqan.link) extensions.

## Quick Start

```bash
# Scaffold a new extension project
npx @volqan/cli create extension my-extension

# Or install the SDK manually
pnpm add @volqan/extension-sdk
pnpm add -D @volqan/core typescript
```

## Define an Extension

### Functional API (recommended)

```ts
import { defineExtension, registerRoute } from '@volqan/extension-sdk';

export default defineExtension({
  id: 'acme/analytics',
  version: '1.0.0',
  name: 'Analytics',
  description: 'Track page views and user events',
  author: { name: 'Acme Corp' },

  async onInstall(ctx) {
    await ctx.config.set('trackingEnabled', true);
    ctx.logger.info('Analytics extension installed');
  },

  async onActivate(ctx) {
    ctx.logger.info('Analytics tracking started');
  },

  async onDeactivate(ctx) {
    ctx.logger.info('Analytics tracking stopped');
  },

  apiRoutes: [
    registerRoute({
      method: 'POST',
      path: '/track',
      public: true,
      handler: async (req) => ({
        status: 200,
        body: { tracked: true },
      }),
    }),
  ],
});
```

### Class-based API

```ts
import { VolqanExtensionBase } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

class AnalyticsExtension extends VolqanExtensionBase {
  id = 'acme/analytics';
  version = '1.0.0';
  name = 'Analytics';
  description = 'Track page views and user events';
  author = { name: 'Acme Corp' };

  async onInstall(ctx: ExtensionContext) {
    await ctx.config.set('trackingEnabled', true);
    ctx.logger.info('Analytics extension installed');
  }

  async onActivate(ctx: ExtensionContext) {
    ctx.logger.info('Analytics tracking started');
  }
}

export default new AnalyticsExtension().toExtension();
```

## Hook Registration Helpers

```ts
import {
  registerRoute,
  registerAdminPage,
  registerContentType,
  registerAPIEndpoint,
} from '@volqan/extension-sdk';

// Register an API route
const webhook = registerRoute({
  method: 'POST',
  path: '/webhook',
  public: true,
  handler: async (req) => ({ status: 200, body: { ok: true } }),
});

// Register an admin page
const settingsPage = registerAdminPage({
  path: 'analytics/settings',
  title: 'Analytics Settings',
  component: 'analytics/SettingsPage',
});

// Register a content lifecycle hook
const slugHook = registerContentType({
  model: 'post',
  event: 'beforeCreate',
  handler: async (payload) => {
    if (payload.data?.title) {
      payload.data.slug = String(payload.data.title).toLowerCase().replace(/\s+/g, '-');
    }
    return payload;
  },
});
```

## Testing

```ts
import { createTestContext, mockVolqanApp } from '@volqan/extension-sdk';
import myExtension from '../src/index.js';

// Unit test a single lifecycle hook
const ctx = createTestContext();
await myExtension.onInstall?.(ctx);
console.assert(ctx._configStore.has('trackingEnabled'));

// Integration test the full lifecycle
const app = mockVolqanApp();
await app.install(myExtension);
await app.enable(myExtension.id);
await app.bootAll();

const extCtx = app.getContext(myExtension.id)!;
console.assert(extCtx._logs.some(l => l.level === 'info'));
```

## Extension Lifecycle

1. **onInstall** — Called once when the extension is first installed
2. **onActivate** — Called each time the extension is enabled
3. **onBoot** — Called on every application startup while enabled
4. **onDeactivate** — Called each time the extension is disabled
5. **onUninstall** — Called once when the extension is removed

## API Reference

| Export | Description |
|--------|-------------|
| `defineExtension(opts)` | Functional API to define an extension |
| `VolqanExtensionBase` | Abstract base class for class-based extensions |
| `registerRoute(opts)` | Create a RouteDefinition |
| `registerAdminPage(opts)` | Create an AdminPage definition |
| `registerContentType(opts)` | Create a ContentHook |
| `registerAPIEndpoint(opts)` | Create an API endpoint RouteDefinition |
| `createTestContext()` | Create a mock ExtensionContext for testing |
| `mockVolqanApp()` | Create a mock Volqan app for integration testing |

## Documentation

- [Getting Started](https://volqan.link/docs/extensions/getting-started)
- [API Reference](https://volqan.link/docs/extensions/api-reference)
- [Publishing to Bazarix](https://volqan.link/docs/extensions/publishing)

## License

MIT
