---
title: Developer Guide — Volqan
description: Hub page for Volqan developer documentation — extensions, themes, SDKs, and marketplace publishing.
---

# Developer Guide

Welcome to the Volqan developer documentation. Whether you're building an extension, designing a theme, or publishing to the Bazarix marketplace, this guide has everything you need.

---

## Quick Links

| Resource | Description |
|---|---|
| [Extension Getting Started](extensions/getting-started.md) | Build your first extension from scratch |
| [Extension API Reference](extensions/api-reference.md) | Complete `VolqanExtension` interface and hook reference |
| [Extension Examples](extensions/examples.md) | Common patterns and recipes |
| [Extension Publishing](extensions/publishing.md) | Publish to the Bazarix marketplace |
| [Theme Getting Started](themes/getting-started.md) | Build your first theme from scratch |
| [Theme API Reference](themes/api-reference.md) | Complete `VolqanTheme` interface and token reference |
| [Theme Publishing](themes/publishing.md) | Publish themes to Bazarix |

---

## SDK Packages

Volqan provides two SDK packages for developers:

### @volqan/extension-sdk

The Extension SDK provides everything needed to build, test, and publish Volqan extensions.

```bash
pnpm add @volqan/extension-sdk
```

**Includes:**

- Re-exported types from `@volqan/core` (`VolqanExtension`, `ExtensionContext`, etc.)
- `defineExtension()` helper for type-safe extension definitions
- `createAdminPage()`, `registerContentType()`, `registerRoute()` utilities
- Testing utilities: `createTestContext()`, `mockVolqanApp()`
- CLI tooling for scaffolding, building, and local development

### @volqan/theme-sdk

The Theme SDK provides everything needed to build, preview, and publish Volqan themes.

```bash
pnpm add @volqan/theme-sdk
```

**Includes:**

- Re-exported types from `@volqan/core` (`VolqanTheme`, `ComponentOverride`, etc.)
- `defineTheme()` helper with typed CSS token definitions
- Component override system for customizing shadcn/ui components
- Live preview development server
- Token validation (catches missing required tokens before publish)

---

## CLI Scaffolding

The Volqan CLI can scaffold new extension and theme projects:

```bash
# Create a new extension
npx @volqan/cli create extension my-extension

# Create a new theme
npx @volqan/cli create theme my-theme
```

Both commands generate a fully working, buildable project with TypeScript, proper `package.json` dependencies, and boilerplate source files.

---

## Architecture Overview

```
volqan/
├── packages/
│   ├── core/           @volqan/core — runtime engine (extensions, themes, content, auth)
│   ├── admin/          @volqan/admin — Next.js 15 admin panel
│   ├── cli/            @volqan/cli — scaffolding CLI
│   ├── extension-sdk/  @volqan/extension-sdk — extension development kit
│   ├── theme-sdk/      @volqan/theme-sdk — theme development kit
│   └── cloud-bridge/   @volqan/cloud-bridge — cloud deployment integration
├── extensions/         First-party extensions (blog, forms, seo)
├── themes/             Built-in themes (default, minimal)
└── docs/               This documentation
```

**Key concepts:**

- **Extensions** are npm packages that export a `VolqanExtension` object. They can add routes, admin pages, content hooks, dashboard widgets, and more.
- **Themes** are npm packages that export a `VolqanTheme` object. They inject design tokens as CSS custom properties under the `--volqan-*` namespace.
- **The Extension Engine** loads, validates, sandboxes, and lifecycle-manages extensions.
- **The Theme Engine** injects theme tokens on the `<html>` element and handles component overrides.
- **Bazarix** ([bazarix.link](https://bazarix.link)) is the official marketplace for distributing extensions and themes.

---

## Community Resources

- [GitHub Discussions](https://github.com/ReadyPixels/volqan/discussions) — Ask questions and share ideas
- [Bazarix Marketplace](https://bazarix.link) — Browse and publish extensions and themes
- [Changelog](changelog.md) — Version history and release notes
- [Roadmap](roadmap.md) — Upcoming features and planned work

---

## Prerequisites

All Volqan development requires:

| Dependency | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 22 LTS | Required. Older versions are not supported. |
| [pnpm](https://pnpm.io) | 9.x or later | `npm install -g pnpm` |
| [TypeScript](https://typescriptlang.org) | 5.9+ | Included in the SDK packages |

For full project setup, see [Getting Started](getting-started.md).
