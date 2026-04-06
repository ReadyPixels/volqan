# @volqan/theme-sdk

Developer SDK for building [Volqan](https://volqan.link) themes.

## Quick Start

```bash
# Scaffold a new theme project
npx @volqan/cli create theme my-theme

# Or install the SDK manually
pnpm add @volqan/theme-sdk
pnpm add -D @volqan/core typescript
```

## Define a Theme

### Functional API (recommended)

```ts
import { defineTheme } from '@volqan/theme-sdk';

export default defineTheme({
  id: 'acme/ocean',
  name: 'Ocean',
  version: '1.0.0',
  tokens: {
    colors: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: {
        primary: '#1A1A2E',
        secondary: '#4A4A68',
        muted: '#9CA3AF',
      },
      border: '#E5E7EB',
    },
    typography: {
      fontFamily: {
        sans: '"Inter", system-ui, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
      fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
    },
    spacing: { 0: '0px', 1: '0.25rem', 2: '0.5rem', 4: '1rem', 8: '2rem' },
    radius: { none: '0px', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
    shadows: { none: 'none', sm: '0 1px 2px rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    animation: { duration: '150ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  },
  components: {
    Button: { className: 'rounded-full' },
    Card: { cssVars: { '--card-radius': '1rem' } },
  },
});
```

### Class-based API

```ts
import { VolqanThemeBase } from '@volqan/theme-sdk';

class OceanTheme extends VolqanThemeBase {
  id = 'acme/ocean';
  name = 'Ocean';
  version = '1.0.0';
  tokens = { /* ... same as above ... */ };

  constructor() {
    super();
    this.overrideComponent('Button', { className: 'rounded-full' });
    this.overrideComponent('Card', { cssVars: { '--card-radius': '1rem' } });
  }
}

export default new OceanTheme().toTheme();
```

## Component Overrides

```ts
import { createComponentOverrides } from '@volqan/theme-sdk';

const overrides = createComponentOverrides([
  ['Button', { className: 'rounded-full font-semibold' }],
  ['Card', { cssVars: { '--card-radius': '1rem' }, className: 'shadow-lg' }],
  ['Input', { className: 'border-2 focus:border-primary' }],
  ['Dialog', { replaceDefaults: true, className: 'custom-dialog' }],
]);
```

## Preview Utilities

```ts
import { createPreviewContext } from '@volqan/theme-sdk';
import myTheme from './my-theme.js';

const preview = createPreviewContext(myTheme);

// Get generated CSS for preview injection
console.log(preview.css);

// Inspect individual tokens
const tokens = preview.getTokenMap();
console.log(tokens.get('--volqan-color-primary')); // '#0077B6'

// Check component overrides
const btn = preview.getComponentOverride('Button');
console.log(btn?.className); // 'rounded-full'
```

## Design Token System

All tokens are injected as CSS custom properties on `:root`:

| Token Category | CSS Variable Pattern | Example |
|---------------|---------------------|---------|
| Colors | `--volqan-color-*` | `--volqan-color-primary` |
| Text Colors | `--volqan-color-text-*` | `--volqan-color-text-primary` |
| Font Family | `--volqan-font-*` | `--volqan-font-sans` |
| Font Size | `--volqan-font-size-*` | `--volqan-font-size-base` |
| Font Weight | `--volqan-font-weight-*` | `--volqan-font-weight-bold` |
| Line Height | `--volqan-line-height-*` | `--volqan-line-height-normal` |
| Spacing | `--volqan-spacing-*` | `--volqan-spacing-4` |
| Radius | `--volqan-radius-*` | `--volqan-radius-md` |
| Shadows | `--volqan-shadow-*` | `--volqan-shadow-sm` |
| Animation | `--volqan-animation-*` | `--volqan-animation-duration` |

## API Reference

| Export | Description |
|--------|-------------|
| `defineTheme(opts)` | Functional API to define a theme |
| `VolqanThemeBase` | Abstract base class for class-based themes |
| `registerComponentOverride(name, override)` | Create a single component override |
| `createComponentOverrides(entries)` | Create a map of component overrides |
| `createPreviewContext(theme)` | Create a preview context for CSS generation |

## Documentation

- [Getting Started](https://volqan.link/docs/themes/getting-started)
- [API Reference](https://volqan.link/docs/themes/api-reference)
- [Publishing to Bazarix](https://volqan.link/docs/themes/publishing)

## License

MIT
