/**
 * @file base.ts
 * @description Abstract base class for building Volqan themes with
 * class-based slot overrides.
 */

import type { VolqanTheme, ComponentOverride } from '@volqan/core';

/**
 * VolqanThemeBase
 *
 * Abstract base class that provides a structured way to build Volqan themes.
 * Define your tokens and override slots to customize the admin panel appearance.
 *
 * @example
 * ```ts
 * import { VolqanThemeBase } from '@volqan/theme-sdk';
 *
 * class OceanTheme extends VolqanThemeBase {
 *   id = 'acme/ocean';
 *   name = 'Ocean';
 *   version = '1.0.0';
 *
 *   tokens = {
 *     colors: {
 *       primary: '#0077B6',
 *       secondary: '#00B4D8',
 *       accent: '#90E0EF',
 *       background: '#FFFFFF',
 *       surface: '#F8F9FA',
 *       text: { primary: '#1A1A2E', secondary: '#4A4A68', muted: '#9CA3AF' },
 *       border: '#E5E7EB',
 *     },
 *     typography: {
 *       fontFamily: { sans: '"Inter", system-ui, sans-serif', mono: '"JetBrains Mono", monospace' },
 *       fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
 *       fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
 *       lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
 *     },
 *     spacing: { 0: '0px', 1: '0.25rem', 2: '0.5rem', 4: '1rem', 8: '2rem' },
 *     radius: { none: '0px', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
 *     shadows: { none: 'none', sm: '0 1px 2px rgb(0 0 0 / 0.05)' },
 *     animation: { duration: '150ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
 *   };
 * }
 *
 * export default new OceanTheme().toTheme();
 * ```
 */
export abstract class VolqanThemeBase {
  /** Globally unique theme identifier in "vendor/name" format. */
  abstract readonly id: string;

  /** Human-readable display name. */
  abstract readonly name: string;

  /** Semantic version string. */
  abstract readonly version: string;

  /** The complete design token system. */
  abstract readonly tokens: VolqanTheme['tokens'];

  /** Per-component class and CSS variable overrides. */
  components?: Record<string, ComponentOverride>;

  /** Bazarix marketplace metadata. */
  marketplace?: VolqanTheme['marketplace'];

  // ---------------------------------------------------------------------------
  // Slot override helpers
  // ---------------------------------------------------------------------------

  /**
   * Register a component override for a named shadcn/ui component.
   *
   * @param componentName - The component name (e.g. "Button", "Card").
   * @param override - The override configuration.
   */
  protected overrideComponent(componentName: string, override: ComponentOverride): void {
    if (!this.components) this.components = {};
    this.components[componentName] = override;
  }

  // ---------------------------------------------------------------------------
  // Conversion
  // ---------------------------------------------------------------------------

  /**
   * Convert this class instance to a plain VolqanTheme object
   * suitable for registration with the Volqan theme engine.
   *
   * @returns A VolqanTheme-conforming object.
   */
  toTheme(): VolqanTheme {
    const theme: VolqanTheme = {
      id: this.id,
      name: this.name,
      version: this.version,
      tokens: this.tokens,
    };

    if (this.components) theme.components = this.components;
    if (this.marketplace) theme.marketplace = this.marketplace;

    return theme;
  }
}
