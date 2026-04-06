---
title: Theme API Reference — Volqan
description: Complete reference for the VolqanTheme interface, CSS tokens, component overrides, slot system, and preview system.
---

# Theme API Reference

This is the complete API reference for Volqan themes. All types are defined in `@volqan/core` and re-exported by `@volqan/theme-sdk`.

---

## Table of Contents

- [VolqanTheme Interface](#volqantheme-interface)
- [Design Tokens](#design-tokens)
- [CSS Custom Properties](#css-custom-properties)
- [Component Override System](#component-override-system)
- [Slot System](#slot-system)
- [Preview System](#preview-system)
- [Marketplace Metadata](#marketplace-metadata)

---

## VolqanTheme Interface

The root interface every theme must implement.

```typescript
interface VolqanTheme {
  // Identity
  id: string;             // "vendor/theme-name"
  name: string;           // Human-readable display name
  version: string;        // Semver: "1.0.0"

  // Design tokens (injected as CSS custom properties)
  tokens: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
      border: string;
    };
    typography: {
      fontFamily: { sans: string; mono: string };
      fontSize: Record<string, string>;
      fontWeight: Record<string, number>;
      lineHeight: Record<string, string>;
    };
    spacing: Record<string, string>;
    radius: Record<string, string>;
    shadows: Record<string, string>;
    animation: { duration: string; easing: string };
  };

  // Component overrides (optional)
  components?: Record<string, ComponentOverride>;

  // Marketplace metadata (optional)
  marketplace?: {
    category: 'light' | 'dark' | 'colorful' | 'minimal' | 'enterprise';
    previewUrl: string;
    price?: number;
    licenseKey?: string;
  };
}
```

### Identity Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Globally unique ID in `"vendor/name"` format (e.g. `"acme/carbon"`) |
| `name` | `string` | Yes | Display name shown in the Theme Switcher |
| `version` | `string` | Yes | Semver string (e.g. `"1.0.0"`) |

---

## Design Tokens

All design tokens are required. The theme engine injects every token as a CSS custom property on the `<html>` element using the `--volqan-*` namespace.

### Colors

| Token | CSS Property | Usage |
|---|---|---|
| `colors.primary` | `--volqan-color-primary` | Primary buttons, active states, focus rings |
| `colors.secondary` | `--volqan-color-secondary` | Hover backgrounds, selected row tints, badge fills |
| `colors.accent` | `--volqan-color-accent` | Highlights, badges, callouts |
| `colors.background` | `--volqan-color-background` | Page/app background |
| `colors.surface` | `--volqan-color-surface` | Cards, modals, elevated elements |
| `colors.text.primary` | `--volqan-color-text-primary` | Body copy, headings |
| `colors.text.secondary` | `--volqan-color-text-secondary` | Labels, captions, secondary info |
| `colors.text.muted` | `--volqan-color-text-muted` | Placeholder text, disabled states |
| `colors.border` | `--volqan-color-border` | Dividers, input borders, card borders |

All color values should be valid CSS color strings (hex, rgb, hsl).

### Typography

#### fontFamily

| Token | CSS Property | Description |
|---|---|---|
| `typography.fontFamily.sans` | `--volqan-font-sans` | Sans-serif body font stack |
| `typography.fontFamily.mono` | `--volqan-font-mono` | Monospace font for code blocks |

Font family values should include fallback stacks:

```typescript
fontFamily: {
  sans: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
},
```

#### fontSize

Dynamic key-value map. Keys are size names, values are CSS length values.

| Key | CSS Property | Typical Value |
|---|---|---|
| `xs` | `--volqan-font-size-xs` | `0.75rem` (12px) |
| `sm` | `--volqan-font-size-sm` | `0.875rem` (14px) |
| `base` | `--volqan-font-size-base` | `1rem` (16px) |
| `lg` | `--volqan-font-size-lg` | `1.125rem` (18px) |
| `xl` | `--volqan-font-size-xl` | `1.25rem` (20px) |
| `2xl` | `--volqan-font-size-2xl` | `1.5rem` (24px) |
| `3xl` | `--volqan-font-size-3xl` | `1.875rem` (30px) |
| `4xl` | `--volqan-font-size-4xl` | `2.25rem` (36px) |

#### fontWeight

Dynamic key-value map. Keys are weight names, values are numeric weights.

| Key | CSS Property | Value |
|---|---|---|
| `normal` | `--volqan-font-weight-normal` | `400` |
| `medium` | `--volqan-font-weight-medium` | `500` |
| `semibold` | `--volqan-font-weight-semibold` | `600` |
| `bold` | `--volqan-font-weight-bold` | `700` |
| `extrabold` | `--volqan-font-weight-extrabold` | `800` |

#### lineHeight

Dynamic key-value map. Keys are names, values are unitless multipliers.

| Key | CSS Property | Value |
|---|---|---|
| `none` | `--volqan-line-height-none` | `1` |
| `tight` | `--volqan-line-height-tight` | `1.25` |
| `snug` | `--volqan-line-height-snug` | `1.375` |
| `normal` | `--volqan-line-height-normal` | `1.5` |
| `relaxed` | `--volqan-line-height-relaxed` | `1.625` |
| `loose` | `--volqan-line-height-loose` | `2` |

### Spacing

Dynamic key-value map. Defines the spacing scale for padding, margin, and gap utilities.

| Key | CSS Property | Typical Value |
|---|---|---|
| `0` | `--volqan-spacing-0` | `0px` |
| `0.5` | `--volqan-spacing-0.5` | `0.125rem` (2px) |
| `1` | `--volqan-spacing-1` | `0.25rem` (4px) |
| `2` | `--volqan-spacing-2` | `0.5rem` (8px) |
| `4` | `--volqan-spacing-4` | `1rem` (16px) |
| `8` | `--volqan-spacing-8` | `2rem` (32px) |
| `16` | `--volqan-spacing-16` | `4rem` (64px) |
| `32` | `--volqan-spacing-32` | `8rem` (128px) |

### Radius

Dynamic key-value map. Defines border radius scale.

| Key | CSS Property | Typical Value |
|---|---|---|
| `none` | `--volqan-radius-none` | `0px` |
| `sm` | `--volqan-radius-sm` | `0.125rem` (2px) |
| `DEFAULT` | `--volqan-radius-DEFAULT` | `0.375rem` (6px) |
| `md` | `--volqan-radius-md` | `0.375rem` (6px) |
| `lg` | `--volqan-radius-lg` | `0.5rem` (8px) |
| `xl` | `--volqan-radius-xl` | `0.75rem` (12px) |
| `2xl` | `--volqan-radius-2xl` | `1rem` (16px) |
| `full` | `--volqan-radius-full` | `9999px` |

### Shadows

Dynamic key-value map. Defines box-shadow elevation scale.

| Key | CSS Property | Typical Value |
|---|---|---|
| `none` | `--volqan-shadow-none` | `none` |
| `sm` | `--volqan-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `md` | `--volqan-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` |
| `lg` | `--volqan-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` |
| `xl` | `--volqan-shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), ...` |
| `inner` | `--volqan-shadow-inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` |

### Animation

| Token | CSS Property | Description |
|---|---|---|
| `animation.duration` | `--volqan-animation-duration` | Default transition duration (e.g. `'150ms'`) |
| `animation.easing` | `--volqan-animation-easing` | Default CSS easing function |

---

## CSS Custom Properties

The theme engine generates CSS custom properties from all tokens and injects them on the `<html>` element. The naming pattern is:

```
--volqan-{category}-{key}
```

### Generated CSS example

For a theme with `colors.primary: '#8B5CF6'` and `typography.fontFamily.sans: '"Inter", sans-serif'`, the engine produces:

```css
:root {
  --volqan-color-primary: #8B5CF6;
  --volqan-color-secondary: #A78BFA;
  --volqan-color-accent: #F59E0B;
  --volqan-color-background: #FAFAF9;
  --volqan-color-surface: #FFFFFF;
  --volqan-color-text-primary: #1C1917;
  --volqan-color-text-secondary: #57534E;
  --volqan-color-text-muted: #A8A29E;
  --volqan-color-border: #E7E5E4;

  --volqan-font-sans: "Inter", sans-serif;
  --volqan-font-mono: "JetBrains Mono", monospace;
  --volqan-font-size-xs: 0.75rem;
  --volqan-font-size-sm: 0.875rem;
  --volqan-font-size-base: 1rem;
  /* ... */

  --volqan-spacing-0: 0px;
  --volqan-spacing-1: 0.25rem;
  --volqan-spacing-2: 0.5rem;
  /* ... */

  --volqan-radius-none: 0px;
  --volqan-radius-sm: 0.125rem;
  --volqan-radius-md: 0.375rem;
  /* ... */

  --volqan-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  /* ... */

  --volqan-animation-duration: 150ms;
  --volqan-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Using tokens in your components

```css
.card {
  background: var(--volqan-color-surface);
  border: 1px solid var(--volqan-color-border);
  border-radius: var(--volqan-radius-lg);
  box-shadow: var(--volqan-shadow-sm);
  padding: var(--volqan-spacing-4);
  font-family: var(--volqan-font-sans);
  transition: box-shadow var(--volqan-animation-duration) var(--volqan-animation-easing);
}

.card:hover {
  box-shadow: var(--volqan-shadow-md);
}
```

---

## Component Override System

The `components` field allows per-component customization of shadcn/ui components in the Volqan admin panel.

### ComponentOverride

```typescript
interface ComponentOverride {
  className?: string;                    // CSS classes to apply
  cssVars?: Record<string, string>;      // Inline CSS custom properties
  replaceDefaults?: boolean;             // Replace (true) or append (false, default)
}
```

### Supported Components

These shadcn/ui component names are recognized by the theme engine:

| Component | Description |
|---|---|
| `Sidebar` | Admin sidebar navigation |
| `Topbar` | Admin top header bar |
| `Card` | Content cards and panels |
| `Button` | All button variants |
| `Input` | Text inputs, textareas, selects |
| `Badge` | Status badges and labels |
| `Dialog` | Modal dialogs |
| `Dropdown` | Dropdown menus |
| `Table` | Data tables |
| `Tabs` | Tab navigation |
| `Toast` | Toast notifications |

### className behavior

By default, `className` is **appended** to the existing shadcn/ui classes:

```typescript
// The Card component already has default shadcn/ui classes.
// This adds your classes on top:
Card: {
  className: 'rounded-xl shadow-lg',
}
```

Set `replaceDefaults: true` to completely replace default classes:

```typescript
// Replaces ALL default Card classes with yours:
Card: {
  className: 'my-custom-card-class',
  replaceDefaults: true,
}
```

> **Warning:** Using `replaceDefaults: true` disables all default shadcn/ui styling for that component. Only use this when you need full control.

### cssVars behavior

CSS variables are applied as inline styles on the component root element. They scope to that component only:

```typescript
Button: {
  cssVars: {
    '--button-primary-bg': '#8B5CF6',
    '--button-primary-hover-bg': '#7C3AED',
    '--button-primary-color': '#FFFFFF',
    '--button-radius': '0.5rem',
    '--button-font-weight': '600',
  },
},
```

### Common component CSS variables

**Sidebar:**

| Variable | Description |
|---|---|
| `--sidebar-width` | Sidebar width |
| `--sidebar-bg` | Background color |
| `--sidebar-border` | Border color |
| `--sidebar-item-hover-bg` | Menu item hover background |
| `--sidebar-item-active-bg` | Active menu item background |
| `--sidebar-item-active-color` | Active menu item text color |
| `--sidebar-item-color` | Default menu item text color |

**Topbar:**

| Variable | Description |
|---|---|
| `--topbar-height` | Topbar height |
| `--topbar-bg` | Background color |
| `--topbar-border` | Border color |
| `--topbar-color` | Text color |

**Card:**

| Variable | Description |
|---|---|
| `--card-bg` | Card background |
| `--card-border` | Card border color |
| `--card-radius` | Card border radius |
| `--card-shadow` | Card box shadow |
| `--card-header-bg` | Card header background |
| `--card-header-border` | Card header border |

**Button:**

| Variable | Description |
|---|---|
| `--button-primary-bg` | Primary button background |
| `--button-primary-hover-bg` | Primary button hover background |
| `--button-primary-active-bg` | Primary button pressed background |
| `--button-primary-color` | Primary button text color |
| `--button-secondary-bg` | Secondary button background |
| `--button-secondary-hover-bg` | Secondary button hover background |
| `--button-secondary-color` | Secondary button text color |
| `--button-destructive-bg` | Destructive button background |
| `--button-destructive-hover-bg` | Destructive button hover background |
| `--button-radius` | Button border radius |
| `--button-font-weight` | Button font weight |

**Input:**

| Variable | Description |
|---|---|
| `--input-bg` | Input background |
| `--input-border` | Input border color |
| `--input-border-focus` | Input border color on focus |
| `--input-ring-focus` | Focus ring color |
| `--input-placeholder` | Placeholder text color |
| `--input-radius` | Input border radius |
| `--input-padding-x` | Horizontal padding |
| `--input-padding-y` | Vertical padding |
| `--input-font-size` | Font size |

---

## Slot System

The theme engine provides a slot system for injecting custom content at predefined points in the admin layout.

Slots are extension points in the admin panel where themes can inject additional CSS or markup. The primary slots are:

| Slot | Location | Description |
|---|---|---|
| `head` | `<head>` tag | Custom `<link>` tags for web fonts, additional stylesheets |
| `sidebar-header` | Top of sidebar | Custom logo or branding |
| `sidebar-footer` | Bottom of sidebar | Custom links or version info |
| `topbar-left` | Left side of topbar | Custom navigation or branding |
| `topbar-right` | Right side of topbar | Custom actions or user info |

Themes access slots through the component override system by targeting the corresponding component names.

---

## Preview System

The `@volqan/theme-sdk` provides a preview development server for testing themes in real time.

### Using the preview server

```bash
# From your theme project directory
npx @volqan/theme-sdk preview
```

The preview server:
- Applies your theme to a simulated Volqan admin panel
- Hot-reloads on file changes
- Shows all token values in a debug panel
- Validates token completeness and warns about missing values

### Preview in production

For marketplace listings, provide a `previewUrl` in the marketplace metadata:

```typescript
marketplace: {
  category: 'light',
  previewUrl: 'https://demo.volqan.link/themes/my-theme',
},
```

This URL is displayed as an interactive preview on the Bazarix marketplace listing.

---

## Marketplace Metadata

Optional metadata for themes distributed through the [Bazarix marketplace](https://bazarix.link).

```typescript
marketplace?: {
  category: 'light' | 'dark' | 'colorful' | 'minimal' | 'enterprise';
  previewUrl: string;
  price?: number;
  licenseKey?: string;
};
```

### Categories

| Category | Description | Target audience |
|---|---|---|
| `light` | Light-mode primary theme | General use |
| `dark` | Dark-mode primary theme | Night/low-light users |
| `colorful` | High-saturation or multi-accent | Creative/marketing |
| `minimal` | Stripped-back, typography-focused | Content-focused |
| `enterprise` | High-density, professional | Business/enterprise |

### Pricing

- **Free themes:** Omit the `price` field
- **Paid themes:** Set `price` as USD amount (minimum $5, maximum $999)

### License key

The `licenseKey` field is populated automatically by Bazarix after purchase. Format: `MKT-{PRODUCT_ID}-{INSTALL_ID}-{EXPIRY_HASH}`. The theme engine validates this server-side on every boot.
