/**
 * @file define.ts
 * @description Functional API for defining Volqan themes with typed CSS token definitions.
 */

import type { VolqanTheme, ComponentOverride } from '@volqan/core';

// ---------------------------------------------------------------------------
// Token sub-types for better autocompletion
// ---------------------------------------------------------------------------

/** Color token definitions. */
export interface ColorTokens {
  /** Primary brand color. Injected as `--volqan-color-primary`. */
  primary: string;
  /** Secondary brand color. Injected as `--volqan-color-secondary`. */
  secondary: string;
  /** Accent color for highlights. Injected as `--volqan-color-accent`. */
  accent: string;
  /** Page background color. Injected as `--volqan-color-background`. */
  background: string;
  /** Surface color for cards and modals. Injected as `--volqan-color-surface`. */
  surface: string;
  /** Text color tokens. */
  text: {
    /** Primary body text. Injected as `--volqan-color-text-primary`. */
    primary: string;
    /** Secondary/subdued text. Injected as `--volqan-color-text-secondary`. */
    secondary: string;
    /** Muted/placeholder text. Injected as `--volqan-color-text-muted`. */
    muted: string;
  };
  /** Default border color. Injected as `--volqan-color-border`. */
  border: string;
}

/** Typography token definitions. */
export interface TypographyTokens {
  /** Font family stacks. */
  fontFamily: {
    /** Sans-serif body font stack. Injected as `--volqan-font-sans`. */
    sans: string;
    /** Monospace font stack. Injected as `--volqan-font-mono`. */
    mono: string;
  };
  /** Named font size scale. Injected as `--volqan-font-size-{key}`. */
  fontSize: Record<string, string>;
  /** Named font weight scale. Injected as `--volqan-font-weight-{key}`. */
  fontWeight: Record<string, number>;
  /** Named line height scale. Injected as `--volqan-line-height-{key}`. */
  lineHeight: Record<string, string>;
}

/** Animation token definitions. */
export interface AnimationTokens {
  /** Default transition duration. Injected as `--volqan-animation-duration`. */
  duration: string;
  /** Default CSS easing function. Injected as `--volqan-animation-easing`. */
  easing: string;
}

/** The complete design token system. */
export interface TokenDefinitions {
  /** Color palette. */
  colors: ColorTokens;
  /** Typography system. */
  typography: TypographyTokens;
  /** Spacing scale. Injected as `--volqan-spacing-{key}`. */
  spacing: Record<string, string>;
  /** Border radius scale. Injected as `--volqan-radius-{key}`. */
  radius: Record<string, string>;
  /** Box shadow scale. Injected as `--volqan-shadow-{key}`. */
  shadows: Record<string, string>;
  /** Animation defaults. */
  animation: AnimationTokens;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options accepted by {@link defineTheme}. */
export interface DefineThemeOptions {
  /** Globally unique theme identifier ("vendor/theme-name"). */
  id: string;

  /** Human-readable display name. */
  name: string;

  /** Semantic version string (e.g. "1.0.0"). */
  version: string;

  /** The complete design token system. */
  tokens: TokenDefinitions;

  /** Per-component class and CSS variable overrides. */
  components?: Record<string, ComponentOverride>;

  /** Bazarix marketplace metadata. */
  marketplace?: VolqanTheme['marketplace'];
}

// ---------------------------------------------------------------------------
// defineTheme
// ---------------------------------------------------------------------------

/**
 * Define a Volqan theme using the functional API.
 *
 * This is the recommended way to create themes. It provides fully-typed
 * token definitions with JSDoc descriptions for each token.
 *
 * @param options - Theme definition options.
 * @returns A VolqanTheme-conforming object.
 *
 * @example
 * ```ts
 * import { defineTheme } from '@volqan/theme-sdk';
 *
 * export default defineTheme({
 *   id: 'acme/ocean',
 *   name: 'Ocean',
 *   version: '1.0.0',
 *   tokens: {
 *     colors: {
 *       primary: '#0077B6',
 *       secondary: '#00B4D8',
 *       accent: '#90E0EF',
 *       background: '#FFFFFF',
 *       surface: '#F8F9FA',
 *       text: {
 *         primary: '#1A1A2E',
 *         secondary: '#4A4A68',
 *         muted: '#9CA3AF',
 *       },
 *       border: '#E5E7EB',
 *     },
 *     typography: {
 *       fontFamily: {
 *         sans: '"Inter", system-ui, sans-serif',
 *         mono: '"JetBrains Mono", monospace',
 *       },
 *       fontSize: {
 *         xs: '0.75rem',
 *         sm: '0.875rem',
 *         base: '1rem',
 *         lg: '1.125rem',
 *         xl: '1.25rem',
 *       },
 *       fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
 *       lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
 *     },
 *     spacing: {
 *       0: '0px', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem',
 *       4: '1rem', 6: '1.5rem', 8: '2rem', 12: '3rem',
 *     },
 *     radius: {
 *       none: '0px', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px',
 *     },
 *     shadows: {
 *       none: 'none',
 *       sm: '0 1px 2px rgb(0 0 0 / 0.05)',
 *       md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
 *     },
 *     animation: {
 *       duration: '150ms',
 *       easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
 *     },
 *   },
 *   components: {
 *     Button: { className: 'rounded-full' },
 *     Card: { cssVars: { '--card-radius': '1rem' } },
 *   },
 * });
 * ```
 */
export function defineTheme(options: DefineThemeOptions): VolqanTheme {
  const theme: VolqanTheme = {
    id: options.id,
    name: options.name,
    version: options.version,
    tokens: options.tokens,
  };

  if (options.components) theme.components = options.components;
  if (options.marketplace) theme.marketplace = options.marketplace;

  return theme;
}
