---
title: Build Your First Theme — Volqan
description: Step-by-step guide to creating, developing, and testing a Volqan theme from scratch.
---

# Build Your First Theme

This guide walks you through creating a Volqan theme from scratch. By the end, you'll have a working theme with custom colors, typography, spacing, and component overrides.

---

## Prerequisites

| Dependency | Version |
|---|---|
| [Node.js](https://nodejs.org) | 22 LTS |
| [pnpm](https://pnpm.io) | 9.x or later |

You'll also need a running Volqan installation. See [Getting Started](../getting-started.md) if you don't have one yet.

---

## Quick Start: Scaffold with the CLI

The fastest way to create a theme is the Volqan CLI:

```bash
npx @volqan/cli create theme my-theme
```

This generates:

```
my-theme/
├── src/
│   └── index.ts        # Theme entry point
├── package.json        # Dependencies and build scripts
├── tsconfig.json       # TypeScript configuration
├── .gitignore
└── README.md
```

Install dependencies and build:

```bash
cd my-theme
pnpm install
pnpm build
```

---

## Theme Structure

Every Volqan theme is an npm package that default-exports a `VolqanTheme` object. Here's the minimal structure:

```
my-theme/
├── src/
│   └── index.ts        # Must default-export a VolqanTheme
├── package.json
└── tsconfig.json
```

### package.json

```json
{
  "name": "@yourvendor/volqan-theme-my-theme",
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
    "@volqan/theme-sdk": "^0.1.0",
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

## The `defineTheme()` API

The `defineTheme()` helper from `@volqan/theme-sdk` provides full type safety for your theme definition:

```typescript
import { defineTheme } from '@volqan/theme-sdk';

export default defineTheme({
  id: 'yourvendor/my-theme',
  name: 'My Theme',
  version: '1.0.0',
  tokens: {
    // ... design tokens
  },
});
```

You can also define the theme directly using the `VolqanTheme` type:

```typescript
import type { VolqanTheme } from '@volqan/core';

const myTheme: VolqanTheme = {
  id: 'yourvendor/my-theme',
  name: 'My Theme',
  version: '1.0.0',
  tokens: {
    // ... design tokens
  },
};

export default myTheme;
```

---

## CSS Tokens System

Themes define all visual design through **design tokens**. The Volqan theme engine injects these as CSS custom properties on the `<html>` element under the `--volqan-*` namespace.

### Colors

Define your color palette:

```typescript
tokens: {
  colors: {
    primary: '#8B5CF6',      // --volqan-color-primary
    secondary: '#A78BFA',    // --volqan-color-secondary
    accent: '#F59E0B',       // --volqan-color-accent
    background: '#FAFAF9',   // --volqan-color-background
    surface: '#FFFFFF',      // --volqan-color-surface
    text: {
      primary: '#1C1917',    // --volqan-color-text-primary
      secondary: '#57534E',  // --volqan-color-text-secondary
      muted: '#A8A29E',      // --volqan-color-text-muted
    },
    border: '#E7E5E4',       // --volqan-color-border
  },
  // ...
}
```

**Usage in CSS/Tailwind:**

```css
.my-component {
  color: var(--volqan-color-text-primary);
  background: var(--volqan-color-surface);
  border-color: var(--volqan-color-border);
}
```

### Typography

Define font families, sizes, weights, and line heights:

```typescript
typography: {
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',  // --volqan-font-sans
    mono: '"JetBrains Mono", ui-monospace, monospace',       // --volqan-font-mono
  },
  fontSize: {
    xs: '0.75rem',      // --volqan-font-size-xs
    sm: '0.875rem',     // --volqan-font-size-sm
    base: '1rem',       // --volqan-font-size-base
    lg: '1.125rem',     // --volqan-font-size-lg
    xl: '1.25rem',      // --volqan-font-size-xl
    '2xl': '1.5rem',    // --volqan-font-size-2xl
    '3xl': '1.875rem',  // --volqan-font-size-3xl
    '4xl': '2.25rem',   // --volqan-font-size-4xl
  },
  fontWeight: {
    normal: 400,    // --volqan-font-weight-normal
    medium: 500,    // --volqan-font-weight-medium
    semibold: 600,  // --volqan-font-weight-semibold
    bold: 700,      // --volqan-font-weight-bold
  },
  lineHeight: {
    tight: '1.25',    // --volqan-line-height-tight
    normal: '1.5',    // --volqan-line-height-normal
    relaxed: '1.625', // --volqan-line-height-relaxed
  },
},
```

### Spacing

Define your spacing scale (typically a 4px base grid):

```typescript
spacing: {
  '0': '0px',          // --volqan-spacing-0
  '1': '0.25rem',      // --volqan-spacing-1      (4px)
  '2': '0.5rem',       // --volqan-spacing-2      (8px)
  '3': '0.75rem',      // --volqan-spacing-3      (12px)
  '4': '1rem',         // --volqan-spacing-4      (16px)
  '6': '1.5rem',       // --volqan-spacing-6      (24px)
  '8': '2rem',         // --volqan-spacing-8      (32px)
  '12': '3rem',        // --volqan-spacing-12     (48px)
  '16': '4rem',        // --volqan-spacing-16     (64px)
},
```

### Radius, Shadows, Animation

```typescript
radius: {
  none: '0px',         // --volqan-radius-none
  sm: '0.125rem',      // --volqan-radius-sm
  md: '0.375rem',      // --volqan-radius-md
  lg: '0.5rem',        // --volqan-radius-lg
  xl: '0.75rem',       // --volqan-radius-xl
  full: '9999px',      // --volqan-radius-full
},
shadows: {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
},
animation: {
  duration: '150ms',                          // --volqan-animation-duration
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',    // --volqan-animation-easing
},
```

---

## Component Overrides

Themes can customize individual shadcn/ui components used in the admin panel without replacing them entirely.

```typescript
components: {
  Card: {
    className: 'rounded-xl border-2 border-violet-200 shadow-md',
    cssVars: {
      '--card-bg': '#FFFFFF',
      '--card-border': '#DDD6FE',
      '--card-radius': '0.75rem',
    },
  },
  Button: {
    cssVars: {
      '--button-primary-bg': '#8B5CF6',
      '--button-primary-hover-bg': '#7C3AED',
      '--button-primary-color': '#FFFFFF',
      '--button-radius': '0.5rem',
    },
  },
  Sidebar: {
    className: 'bg-violet-50 border-r border-violet-100',
    cssVars: {
      '--sidebar-width': '16rem',
      '--sidebar-item-active-bg': '#EDE9FE',
      '--sidebar-item-active-color': '#6D28D9',
    },
  },
},
```

### Override behavior

| Property | Behavior |
|---|---|
| `className` | **Appended** to default shadcn/ui classes |
| `cssVars` | Applied as inline CSS custom properties on the component root |
| `replaceDefaults` | When `true`, completely replaces default classes instead of appending |

---

## Dark Mode Support

Volqan supports dark mode via a separate token set. Define dark mode tokens in your theme and the engine handles toggling.

A common pattern is to define your theme as a light theme and then provide darker color alternatives:

```typescript
tokens: {
  colors: {
    // Light mode colors (default)
    primary: '#8B5CF6',
    background: '#FAFAF9',
    surface: '#FFFFFF',
    text: {
      primary: '#1C1917',
      secondary: '#57534E',
      muted: '#A8A29E',
    },
    border: '#E7E5E4',
  },
  // ... other tokens
},
```

For a dedicated dark theme, set the marketplace category to `'dark'`:

```typescript
marketplace: {
  category: 'dark',
  // ...
},
```

---

## Building and Testing

### Development mode

```bash
pnpm dev  # Runs tsc in watch mode
```

### Build for production

```bash
pnpm build
```

### Install in a local Volqan project

Link your theme into a Volqan project:

```bash
# From your Volqan project root
pnpm add ../path/to/my-theme
```

Then activate it in the admin panel under **Themes**.

### Type checking

```bash
npx tsc --noEmit
```

---

## Full Working Example

Here's a complete theme that creates a warm, earthy design:

```typescript
// src/index.ts
import type { VolqanTheme } from '@volqan/core';

const warmEarthTheme: VolqanTheme = {
  id: 'yourvendor/warm-earth',
  name: 'Warm Earth',
  version: '1.0.0',

  tokens: {
    colors: {
      primary: '#B45309',
      secondary: '#FDE68A',
      accent: '#059669',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: {
        primary: '#1C1917',
        secondary: '#57534E',
        muted: '#A8A29E',
      },
      border: '#E7E5E4',
    },

    typography: {
      fontFamily: {
        sans: '"Source Sans 3", "Source Sans Pro", ui-sans-serif, system-ui, sans-serif',
        mono: '"Source Code Pro", ui-monospace, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
    },

    spacing: {
      '0': '0px',
      '0.5': '0.125rem',
      '1': '0.25rem',
      '1.5': '0.375rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '32': '8rem',
    },

    radius: {
      none: '0px',
      sm: '0.25rem',
      DEFAULT: '0.5rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },

    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
    },

    animation: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  components: {
    Sidebar: {
      className: 'bg-amber-50 border-r border-amber-200',
      cssVars: {
        '--sidebar-width': '16rem',
        '--sidebar-bg': '#FFFBEB',
        '--sidebar-border': '#FDE68A',
        '--sidebar-item-hover-bg': '#FEF3C7',
        '--sidebar-item-active-bg': '#FDE68A',
        '--sidebar-item-active-color': '#92400E',
        '--sidebar-item-color': '#57534E',
      },
    },
    Topbar: {
      className: 'border-b border-amber-200 bg-white',
      cssVars: {
        '--topbar-height': '3.5rem',
        '--topbar-bg': '#FFFFFF',
        '--topbar-border': '#FDE68A',
      },
    },
    Card: {
      className: 'rounded-xl border border-stone-200 bg-white shadow-sm',
      cssVars: {
        '--card-bg': '#FFFFFF',
        '--card-border': '#E7E5E4',
        '--card-radius': '0.75rem',
      },
    },
    Button: {
      cssVars: {
        '--button-primary-bg': '#B45309',
        '--button-primary-hover-bg': '#92400E',
        '--button-primary-color': '#FFFFFF',
        '--button-secondary-bg': '#FEF3C7',
        '--button-secondary-hover-bg': '#FDE68A',
        '--button-secondary-color': '#92400E',
        '--button-radius': '0.5rem',
      },
    },
    Input: {
      className: 'border-stone-300 focus:border-amber-500 focus:ring-amber-200',
      cssVars: {
        '--input-bg': '#FFFFFF',
        '--input-border': '#D6D3D1',
        '--input-border-focus': '#B45309',
        '--input-ring-focus': 'rgba(180, 83, 9, 0.2)',
      },
    },
  },

  marketplace: {
    category: 'light',
    previewUrl: 'https://demo.volqan.link/themes/warm-earth',
  },
};

export default warmEarthTheme;
```

---

## Next Steps

- [API Reference](api-reference.md) — Complete `VolqanTheme` interface and token reference
- [Publishing](publishing.md) — Publish your theme to the Bazarix marketplace
- [Extension Getting Started](../extensions/getting-started.md) — Build extensions to complement your theme
