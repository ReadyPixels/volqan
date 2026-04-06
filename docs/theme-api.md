---
title: Theme API — Volqan
description: Complete reference for building Volqan themes using the VolqanTheme interface and Theme SDK.
---

# Theme API

This document is the authoritative reference for building Volqan themes. It covers the complete `VolqanTheme` TypeScript interface, the design token system, CSS custom properties injection, component overrides, marketplace metadata, and a complete worked example.

---

## Overview

A Volqan theme is an npm package that exports a default export conforming to the `VolqanTheme` interface. The Theme Engine applies design tokens globally across the admin UI by injecting CSS custom properties at the document root (`<html>`).

Themes control:
- All color values (primary, secondary, accent, background, surface, text, border)
- Typography (font families, sizes, weights, line heights)
- Spacing scale
- Border radius values
- Box shadow levels
- Animation timing

Additionally, themes can override specific shadcn/ui components by supplying replacement React components.

**Package naming convention:**

```
@vendor/volqan-theme-[name]
```

Community themes scoped to the official Volqan namespace (with approval):

```
@volqan-theme/[name]
```

---

## The `VolqanTheme` Interface

```typescript
export interface VolqanTheme {
  // ─── Identity ──────────────────────────────────────────────────────────────
  id:      string;    // Unique theme identifier, e.g. "acme/ocean-dark"
  name:    string;    // Human-readable name shown in the Theme Manager
  version: string;    // Semver version string

  // ─── Design Tokens ─────────────────────────────────────────────────────────
  tokens: {
    colors: {
      primary:    string;  // Main brand/action color — used for buttons, links, focus rings
      secondary:  string;  // Secondary action color
      accent:     string;  // Accent/highlight color — used for badges, tags
      background: string;  // Page/panel background
      surface:    string;  // Card and popover background (slightly elevated from background)
      text: {
        primary:   string;  // Main body text
        secondary: string;  // Subdued text — labels, helper text
        muted:     string;  // Placeholders, disabled text
      };
      border:     string;  // Default border color
    };
    typography: {
      fontFamily: {
        sans: string;   // UI font stack — used for all admin text
        mono: string;   // Monospace font — used for code blocks and IDs
      };
      fontSize:   Record<string, string>;   // Scale: xs, sm, base, lg, xl, 2xl, 3xl, etc.
      fontWeight: Record<string, number>;   // Weights: light, normal, medium, semibold, bold
      lineHeight: Record<string, string>;   // Heights: tight, snug, normal, relaxed, loose
    };
    spacing:   Record<string, string>;  // Scale in rem: 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16
    radius:    Record<string, string>;  // Border radii: none, sm, md, lg, xl, full
    shadows:   Record<string, string>;  // Shadow levels: none, sm, md, lg, xl
    animation: {
      duration: string;  // Default transition duration, e.g. "150ms"
      easing:   string;  // Default easing function, e.g. "cubic-bezier(0.4, 0, 0.2, 1)"
    };
  };

  // ─── Component Overrides ───────────────────────────────────────────────────
  components?: Record<string, ComponentOverride>;

  // ─── Marketplace Metadata ──────────────────────────────────────────────────
  marketplace?: {
    category:    'light' | 'dark' | 'colorful' | 'minimal' | 'enterprise';
    previewUrl:  string;   // Live preview URL or screenshot URL
    price?:      number;   // USD. Omit or set 0 for free themes
    licenseKey?: string;   // Managed by the licensing API — never hardcode
  };
}
```

---

## Design Tokens System

Design tokens are the single source of truth for all visual design decisions. Every token you define is injected into the CSS custom properties on `<html>`, making them available globally in all admin UI components.

### Color Tokens

Color values must be valid CSS color values: hex (`#1a2b3c`), HSL (`hsl(220 90% 56%)`), RGB (`rgb(26 43 60)`), or CSS color names.

For dark mode support, use the `tokens.colors` for your primary color scheme. Volqan automatically generates a dark mode variant by applying a perceptual inversion algorithm to token values unless you provide an explicit dark theme.

```typescript
colors: {
  primary:    '#4f46e5',          // Indigo — main action color
  secondary:  '#7c3aed',          // Violet — secondary actions
  accent:     '#0ea5e9',          // Sky — highlights, badges
  background: '#f8fafc',          // Near-white page background
  surface:    '#ffffff',          // Pure white cards and panels
  text: {
    primary:   '#0f172a',         // Near-black — main text
    secondary: '#475569',         // Slate-600 — secondary text
    muted:     '#94a3b8',         // Slate-400 — placeholders
  },
  border:     '#e2e8f0',          // Slate-200 — borders and dividers
},
```

### Typography Tokens

```typescript
typography: {
  fontFamily: {
    sans: '"Inter", "Geist", system-ui, -apple-system, sans-serif',
    mono: '"Geist Mono", "JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs:   '0.75rem',    // 12px
    sm:   '0.875rem',   // 14px
    base: '1rem',       // 16px
    lg:   '1.125rem',   // 18px
    xl:   '1.25rem',    // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  fontWeight: {
    light:    300,
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  lineHeight: {
    tight:   '1.25',
    snug:    '1.375',
    normal:  '1.5',
    relaxed: '1.625',
    loose:   '2',
  },
},
```

### Spacing Tokens

Spacing tokens define the layout rhythm used for padding, margin, and gap throughout the admin UI.

```typescript
spacing: {
  '0':    '0',
  '0.5': '0.125rem',   // 2px
  '1':   '0.25rem',    // 4px
  '1.5': '0.375rem',   // 6px
  '2':   '0.5rem',     // 8px
  '3':   '0.75rem',    // 12px
  '4':   '1rem',       // 16px
  '5':   '1.25rem',    // 20px
  '6':   '1.5rem',     // 24px
  '8':   '2rem',       // 32px
  '10':  '2.5rem',     // 40px
  '12':  '3rem',       // 48px
  '16':  '4rem',       // 64px
  '20':  '5rem',       // 80px
  '24':  '6rem',       // 96px
},
```

### Radius Tokens

```typescript
radius: {
  none: '0',
  sm:   '0.125rem',    // 2px — subtle rounding
  md:   '0.375rem',    // 6px — default buttons and inputs
  lg:   '0.5rem',      // 8px — cards and panels
  xl:   '0.75rem',     // 12px — large panels, modals
  '2xl': '1rem',       // 16px
  full: '9999px',      // Fully round — pills, avatars
},
```

### Shadow Tokens

```typescript
shadows: {
  none: 'none',
  sm:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md:   '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:   '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:   '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
},
```

### Animation Tokens

```typescript
animation: {
  duration: '150ms',
  easing:   'cubic-bezier(0.4, 0, 0.2, 1)',
},
```

---

## CSS Custom Properties Injection

The Theme Engine converts your design tokens into CSS custom properties and injects them as a `<style>` block on the `<html>` element at application boot. This makes every token available globally across all admin UI components.

**Generated output example (from the token values above):**

```css
html {
  /* Colors */
  --color-primary:          #4f46e5;
  --color-secondary:        #7c3aed;
  --color-accent:           #0ea5e9;
  --color-background:       #f8fafc;
  --color-surface:          #ffffff;
  --color-text-primary:     #0f172a;
  --color-text-secondary:   #475569;
  --color-text-muted:       #94a3b8;
  --color-border:           #e2e8f0;

  /* Typography */
  --font-sans:              "Inter", "Geist", system-ui, -apple-system, sans-serif;
  --font-mono:              "Geist Mono", "JetBrains Mono", monospace;
  --font-size-xs:           0.75rem;
  --font-size-sm:           0.875rem;
  --font-size-base:         1rem;
  --font-size-lg:           1.125rem;
  --font-size-xl:           1.25rem;
  --font-size-2xl:          1.5rem;
  --font-size-3xl:          1.875rem;
  --font-size-4xl:          2.25rem;
  --font-weight-light:      300;
  --font-weight-normal:     400;
  --font-weight-medium:     500;
  --font-weight-semibold:   600;
  --font-weight-bold:       700;
  --line-height-tight:      1.25;
  --line-height-normal:     1.5;
  --line-height-relaxed:    1.625;

  /* Spacing */
  --spacing-1:              0.25rem;
  --spacing-2:              0.5rem;
  --spacing-4:              1rem;
  --spacing-8:              2rem;

  /* Radius */
  --radius-none:            0;
  --radius-sm:              0.125rem;
  --radius-md:              0.375rem;
  --radius-lg:              0.5rem;
  --radius-xl:              0.75rem;
  --radius-full:            9999px;

  /* Shadows */
  --shadow-none:            none;
  --shadow-sm:              0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:              0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:              0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Animation */
  --animation-duration:     150ms;
  --animation-easing:       cubic-bezier(0.4, 0, 0.2, 1);
}
```

These variables are used directly in all shadcn/ui components and Tailwind CSS v4 utility classes. When you change the active theme, the properties are updated on the next page render without a full page reload.

---

## Component Overrides

The `components` field allows you to replace specific shadcn/ui components with your own implementations. This is an advanced capability — most themes should not need it. Token customization alone covers the vast majority of visual changes.

```typescript
components: {
  Button: {
    component: () => import('./overrides/Button'),
  },
  Card: {
    component: () => import('./overrides/Card'),
  },
},
```

**`ComponentOverride` type:**

```typescript
interface ComponentOverride {
  component: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
}
```

**Override component contract:**

Your override component must accept and forward all props that the original shadcn/ui component accepts. Volqan performs a runtime check and logs a warning if required props are missing.

```typescript
// overrides/Button.tsx
import React from 'react';
import type { ButtonProps } from '@volqan/admin/components/ui/button';

export default function Button({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`your-custom-button-classes ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Marketplace Metadata

If you plan to distribute your theme on [Bazarix](https://bazarix.link), include the `marketplace` field:

```typescript
marketplace: {
  category:   'dark',          // 'light' | 'dark' | 'colorful' | 'minimal' | 'enterprise'
  previewUrl: 'https://cdn.bazarix.link/theme/acme/ocean-dark/preview.png',
  price:      19,              // USD. 0 or omit for free
  licenseKey: undefined,       // Managed by the licensing API — never hardcode
}
```

**Category guidance:**

| Category | Description |
|---|---|
| `light` | Light background, dark text — default daytime look |
| `dark` | Dark background, light text — for users who prefer dark interfaces |
| `colorful` | Bold, saturated palette — standout visual identity |
| `minimal` | Reduced visual noise — high information density, muted palette |
| `enterprise` | Conservative, professional — suitable for corporate and internal tools |

---

## Complete Example: Building an "Ocean Dark" Theme

### 1. Initialize the Theme Package

```bash
# Install the Theme SDK
npm install -g @volqan/theme-sdk

# Scaffold a new theme
npx create-volqan-app --theme acme/ocean-dark
cd ocean-dark
pnpm install
```

### 2. Define the Theme

```typescript
// src/index.ts
import type { VolqanTheme } from '@volqan/theme-sdk';

const OceanDarkTheme: VolqanTheme = {
  id:      'acme/ocean-dark',
  name:    'Ocean Dark',
  version: '1.0.0',

  tokens: {
    colors: {
      primary:    '#38bdf8',          // Sky-400 — bright cyan-blue
      secondary:  '#818cf8',          // Indigo-400
      accent:     '#34d399',          // Emerald-400 — for success states and highlights
      background: '#0c1a2b',          // Deep ocean navy
      surface:    '#132337',          // Slightly lighter navy for cards
      text: {
        primary:   '#e2f0fa',         // Near-white with blue tint
        secondary: '#94b8d4',         // Muted blue-grey
        muted:     '#4d7a99',         // Dark blue-grey for placeholders
      },
      border:     '#1e3a52',          // Subtle dark border
    },
    typography: {
      fontFamily: {
        sans: '"Inter", "Geist", system-ui, sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace',
      },
      fontSize: {
        xs:    '0.75rem',
        sm:    '0.875rem',
        base:  '1rem',
        lg:    '1.125rem',
        xl:    '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light:    300,
        normal:   400,
        medium:   500,
        semibold: 600,
        bold:     700,
      },
      lineHeight: {
        tight:   '1.25',
        snug:    '1.375',
        normal:  '1.5',
        relaxed: '1.625',
        loose:   '2',
      },
    },
    spacing: {
      '0':    '0',
      '0.5': '0.125rem',
      '1':   '0.25rem',
      '1.5': '0.375rem',
      '2':   '0.5rem',
      '3':   '0.75rem',
      '4':   '1rem',
      '6':   '1.5rem',
      '8':   '2rem',
      '12':  '3rem',
      '16':  '4rem',
    },
    radius: {
      none: '0',
      sm:   '0.125rem',
      md:   '0.375rem',
      lg:   '0.5rem',
      xl:   '0.75rem',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm:   '0 1px 3px 0 rgb(0 0 0 / 0.4)',
      md:   '0 4px 12px -2px rgb(0 0 0 / 0.5)',
      lg:   '0 10px 25px -5px rgb(0 0 0 / 0.6)',
      xl:   '0 20px 40px -10px rgb(0 0 0 / 0.7)',
    },
    animation: {
      duration: '200ms',
      easing:   'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  marketplace: {
    category:   'dark',
    previewUrl: 'https://cdn.bazarix.link/theme/acme/ocean-dark/preview.png',
    price:      0,    // Free theme
  },
};

export default OceanDarkTheme;
```

### 3. Test Locally

```bash
# Link into a local Volqan project
cd /path/to/my-volqan-project
pnpm add --workspace @acme/ocean-dark
```

```typescript
// volqan.config.ts
import OceanDarkTheme from '@acme/ocean-dark';

export default defineConfig({
  themes: {
    installed: [OceanDarkTheme],
    active:    'acme/ocean-dark',
  },
});
```

```bash
pnpm dev
```

Navigate to `http://localhost:3000/admin`. Open **Appearance → Themes** to see your theme listed and activate it.

### 4. Add a Preview Screenshot

The Bazarix marketplace shows a preview screenshot on your theme's listing page. Generate one from your local dev server:

```bash
# Take a screenshot of the admin panel with your theme active
npx volqan-theme screenshot --url http://localhost:3000/admin --output ./preview.png
```

Upload `preview.png` to a CDN or your GitHub repository and update `previewUrl` in the `marketplace` field.

### 5. Publish to npm and Bazarix

```bash
# Build
pnpm build

# Publish to npm
npm publish --access public

# Submit to Bazarix at bazarix.link/sellers/submit
```

---

## Theme SDK Setup

The Theme SDK (`@volqan/theme-sdk`) is the official toolkit for building Volqan themes. It ships with:

- TypeScript types for the full `VolqanTheme` interface
- A live preview dev server that applies your theme to a running Volqan instance in real time
- Token validation — catches missing required tokens before publish
- CLI tooling for scaffolding, screenshot generation, and building

**Install:**

```bash
pnpm add -D @volqan/theme-sdk
```

**`package.json` for themes:**

```json
{
  "name": "@acme/volqan-theme-ocean-dark",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build":     "volqan-theme build",
    "dev":       "volqan-theme dev --volqan-url http://localhost:3000",
    "typecheck": "volqan-theme typecheck",
    "validate":  "volqan-theme validate",
    "screenshot": "volqan-theme screenshot --url http://localhost:3000/admin --output ./preview.png"
  },
  "devDependencies": {
    "@volqan/theme-sdk": "latest"
  }
}
```

**Validate your token set before publishing:**

```bash
pnpm validate
```

This checks that all required tokens are present, values are valid CSS, and the `id` format is correct. It will error on missing required fields and warn on recommended fields that are missing.

---

## Theme Switching

Users switch themes from **Appearance → Themes** in the admin panel. Switching is instant — the Theme Engine injects the new CSS custom properties without a page reload. Theme preference is saved per-user in the database.

If no theme is explicitly activated, the built-in **Default** theme is used. The Default theme ships with every Volqan installation and cannot be uninstalled.

---

## Dark Mode

Volqan supports system-level dark mode detection via the `prefers-color-scheme` media query. To support both light and dark system preferences from a single theme, provide two token sets:

```typescript
tokens: {
  // Light mode (default)
  colors: { /* ... */ },
  // ... other tokens

  // Optional: dark mode overrides
  dark: {
    colors: {
      background: '#0c1a2b',
      surface:    '#132337',
      // ... only the values that change
    },
  },
},
```

When the user's system is in dark mode and `tokens.dark` is defined, the dark overrides are merged over the base tokens automatically.

A theme classified as `category: 'dark'` in the marketplace should define its primary appearance in `tokens.colors` as dark, with an optional `tokens.dark` that is the same or more saturated.

---

## Built-in Themes

Volqan ships with two built-in themes:

| Theme | ID | Description |
|---|---|---|
| Default | `volqan/default` | Clean, neutral shadcn/ui base — works equally well in light and dark mode |
| Minimal | `volqan/minimal` | Stripped-back, high information density, muted palette — ideal for data-heavy admin panels |

Both are non-removable and serve as the fallback if no other theme is active.

---

*Theme API reference — Volqan v0.0.1 · [GitHub](https://github.com/ReadyPixels/volqan) · [Bazarix Marketplace](https://bazarix.link)*
