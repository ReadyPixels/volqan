/**
 * @file preview.ts
 * @description Preview utilities for Volqan themes.
 *
 * Provides helpers to generate CSS preview strings and inspect theme tokens
 * without applying them to the DOM.
 */

import type { VolqanTheme } from '@volqan/core';
import { generateThemeCss, validateTheme } from '@volqan/core';

/**
 * A preview context for inspecting theme tokens and generating CSS.
 */
export interface PreviewContext {
  /** The validated theme object. */
  theme: VolqanTheme;

  /**
   * The generated CSS string with all tokens as `:root { ... }` custom properties.
   * Can be injected into a `<style>` tag for live preview.
   */
  css: string;

  /**
   * Get a flat map of all CSS custom property names to values.
   * Useful for rendering a token preview table.
   */
  getTokenMap(): Map<string, string>;

  /**
   * Get the component override for a specific component, if defined.
   *
   * @param componentName - The shadcn/ui component name (e.g. "Button").
   */
  getComponentOverride(componentName: string): VolqanTheme['components'] extends Record<string, infer V> ? V | undefined : undefined;
}

/**
 * Create a preview context for a Volqan theme.
 *
 * The preview context generates CSS without applying it to the DOM,
 * making it safe for server-side rendering, build tools, and preview panels.
 *
 * @param theme - The theme to preview. Will be validated.
 * @returns A PreviewContext with CSS and token inspection utilities.
 * @throws {ThemeValidationError} if the theme fails validation.
 *
 * @example
 * ```ts
 * import { createPreviewContext } from '@volqan/theme-sdk';
 * import myTheme from './my-theme.js';
 *
 * const preview = createPreviewContext(myTheme);
 *
 * // Inject CSS into a preview iframe
 * iframe.contentDocument.head.innerHTML += `<style>${preview.css}</style>`;
 *
 * // Inspect token values
 * const tokens = preview.getTokenMap();
 * console.log(tokens.get('--volqan-color-primary')); // '#0077B6'
 *
 * // Check component overrides
 * const btnOverride = preview.getComponentOverride('Button');
 * console.log(btnOverride?.className); // 'rounded-full'
 * ```
 */
export function createPreviewContext(theme: VolqanTheme): PreviewContext {
  validateTheme(theme);
  const css = generateThemeCss(theme);

  return {
    theme,
    css,

    getTokenMap(): Map<string, string> {
      const map = new Map<string, string>();
      const lines = css.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s+(--volqan-[\w-]+):\s*(.+);$/);
        if (match) {
          map.set(match[1]!, match[2]!);
        }
      }
      return map;
    },

    getComponentOverride(componentName: string) {
      return theme.components?.[componentName] as ReturnType<PreviewContext['getComponentOverride']>;
    },
  };
}
