/**
 * @file themes/types.ts
 * @description Core type definitions for the Volqan Theme Engine.
 *
 * All themes distributed through Bazarix (https://bazarix.link) or bundled
 * with Volqan must conform to the VolqanTheme interface defined here.
 */

// ---------------------------------------------------------------------------
// Component overrides
// ---------------------------------------------------------------------------

/**
 * ComponentOverride
 *
 * Allows a theme to supply custom CSS classes or inline style tokens for any
 * named shadcn/ui component in the Volqan admin panel.
 */
export interface ComponentOverride {
  /**
   * CSS class string(s) to apply to the component root element.
   * Appended to the default shadcn/ui class list.
   */
  className?: string;

  /**
   * Inline CSS custom properties applied to the component root element.
   * Use for component-scoped token overrides that cannot be expressed globally.
   *
   * @example { '--card-radius': '0px', '--card-shadow': 'none' }
   */
  cssVars?: Record<string, string>;

  /**
   * Whether to completely replace the default classes instead of appending.
   * Use with caution — this disables all default shadcn/ui styling.
   * @default false
   */
  replaceDefaults?: boolean;
}

// ---------------------------------------------------------------------------
// Core theme interface
// ---------------------------------------------------------------------------

/**
 * VolqanTheme
 *
 * Every theme — whether built into Volqan or purchased through Bazarix
 * (https://bazarix.link) — must export a default object conforming to this
 * interface.
 *
 * The theme engine injects all tokens as CSS custom properties on the
 * document root (`<html>` element) using the `--volqan-*` namespace.
 *
 * Renamed from FrameworkTheme per project naming convention.
 */
export interface VolqanTheme {
  /**
   * Globally unique theme identifier.
   * Format: "vendor/theme-name" (e.g. "volqan/default" or "acme/carbon").
   */
  id: string;

  /** Human-readable display name shown in the Theme Switcher. */
  name: string;

  /** Semantic version string (e.g. "1.0.0"). */
  version: string;

  // -------------------------------------------------------------------------
  // Design tokens
  // -------------------------------------------------------------------------

  /**
   * The complete design token system.
   * All tokens are injected as CSS custom properties by the theme engine.
   */
  tokens: {
    /** Color palette. */
    colors: {
      /**
       * Primary brand color.
       * Injected as `--volqan-color-primary`.
       * Used for primary buttons, active states, and focus rings.
       */
      primary: string;

      /**
       * Secondary brand color.
       * Injected as `--volqan-color-secondary`.
       */
      secondary: string;

      /**
       * Accent color for highlights, badges, and callouts.
       * Injected as `--volqan-color-accent`.
       */
      accent: string;

      /**
       * Page/app background color.
       * Injected as `--volqan-color-background`.
       */
      background: string;

      /**
       * Surface color for cards, modals, and elevated elements.
       * Injected as `--volqan-color-surface`.
       */
      surface: string;

      /** Text color tokens. */
      text: {
        /**
         * Primary body text color.
         * Injected as `--volqan-color-text-primary`.
         */
        primary: string;

        /**
         * Secondary / subdued text color.
         * Injected as `--volqan-color-text-secondary`.
         */
        secondary: string;

        /**
         * Muted / placeholder text color.
         * Injected as `--volqan-color-text-muted`.
         */
        muted: string;
      };

      /**
       * Default border color.
       * Injected as `--volqan-color-border`.
       */
      border: string;
    };

    /** Typography system. */
    typography: {
      /** Font family stacks. */
      fontFamily: {
        /**
         * Sans-serif body font stack.
         * Injected as `--volqan-font-sans`.
         * @example '"Inter", "system-ui", sans-serif'
         */
        sans: string;

        /**
         * Monospace font stack for code blocks and terminals.
         * Injected as `--volqan-font-mono`.
         * @example '"JetBrains Mono", "Fira Code", monospace'
         */
        mono: string;
      };

      /**
       * Named font size scale.
       * Injected as `--volqan-font-size-{key}`.
       * @example { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem' }
       */
      fontSize: Record<string, string>;

      /**
       * Named font weight scale.
       * Injected as `--volqan-font-weight-{key}`.
       * @example { normal: 400, medium: 500, semibold: 600, bold: 700 }
       */
      fontWeight: Record<string, number>;

      /**
       * Named line height scale.
       * Injected as `--volqan-line-height-{key}`.
       * @example { tight: '1.25', normal: '1.5', relaxed: '1.75' }
       */
      lineHeight: Record<string, string>;
    };

    /**
     * Spacing scale used for padding and margin utilities.
     * Injected as `--volqan-spacing-{key}`.
     * @example { 0: '0px', 1: '0.25rem', 2: '0.5rem', 4: '1rem' }
     */
    spacing: Record<string, string>;

    /**
     * Border radius scale.
     * Injected as `--volqan-radius-{key}`.
     * @example { none: '0px', sm: '0.25rem', md: '0.5rem', full: '9999px' }
     */
    radius: Record<string, string>;

    /**
     * Box shadow scale.
     * Injected as `--volqan-shadow-{key}`.
     * @example { none: 'none', sm: '0 1px 2px rgb(0 0 0 / 0.05)', lg: '0 10px 15px ...' }
     */
    shadows: Record<string, string>;

    /** Global animation defaults. */
    animation: {
      /**
       * Default transition duration.
       * Injected as `--volqan-animation-duration`.
       * @example '150ms'
       */
      duration: string;

      /**
       * Default CSS easing function.
       * Injected as `--volqan-animation-easing`.
       * @example 'cubic-bezier(0.4, 0, 0.2, 1)'
       */
      easing: string;
    };
  };

  // -------------------------------------------------------------------------
  // Component overrides
  // -------------------------------------------------------------------------

  /**
   * Per-component class and CSS variable overrides.
   * Keys are shadcn/ui component names (e.g. "Button", "Card", "Input").
   */
  components?: Record<string, ComponentOverride>;

  // -------------------------------------------------------------------------
  // Bazarix marketplace metadata
  // -------------------------------------------------------------------------

  /**
   * Marketplace listing metadata.
   * Only relevant for themes distributed through https://bazarix.link.
   */
  marketplace?: {
    /**
     * Visual category for marketplace filtering.
     * - light: Light-mode primary theme
     * - dark: Dark-mode primary theme
     * - colorful: High-saturation or multi-accent theme
     * - minimal: Stripped-back, typography-focused theme
     * - enterprise: High-density, professional theme
     */
    category: 'light' | 'dark' | 'colorful' | 'minimal' | 'enterprise';

    /**
     * Public preview URL showing the theme applied to a Volqan demo instance.
     */
    previewUrl: string;

    /**
     * Price in USD. Omit for free themes. Min $5, max $999.
     */
    price?: number;

    /**
     * Bazarix license key in the format MKT-{PRODUCT_ID}-{INSTALL_ID}-{EXPIRY_HASH}.
     * Validated server-side by the theme engine on every boot.
     */
    licenseKey?: string;
  };
}
