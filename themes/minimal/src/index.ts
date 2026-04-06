/**
 * @file index.ts
 * @description Volqan Minimal Theme — official dark, minimalist theme.
 *
 * A focused dark theme built on Geist and Geist Mono with an emerald accent.
 * Prioritises typography, high contrast, and a snappy 100ms animation feel.
 * Borders replace drop-shadows for a flat, modern aesthetic.
 *
 * All tokens are injected as CSS custom properties on the <html> element
 * under the --volqan-* namespace by the Volqan theme engine.
 */

import type { VolqanTheme } from '@volqan/core';

const minimalTheme: VolqanTheme = {
  id: 'volqan/minimal',
  name: 'Volqan Minimal',
  version: '0.1.0',

  // =========================================================================
  // Design tokens
  // =========================================================================

  tokens: {
    // -----------------------------------------------------------------------
    // Colors — Zinc/neutral dark palette with emerald accent
    // -----------------------------------------------------------------------
    colors: {
      /**
       * Zinc 900 (#18181B) — dark zinc primary for the main background.
       * Used for the overall app canvas.
       */
      primary: '#18181B',

      /**
       * Zinc 800 (#27272A) — slightly lighter surface for secondary areas.
       */
      secondary: '#27272A',

      /**
       * Emerald 500 (#10B981) — vivid accent for interactive states,
       * active indicators, focus rings, and success feedback.
       * Provides high contrast against the dark zinc backgrounds.
       */
      accent: '#10B981',

      /**
       * Zinc 950 (#09090B) — deepest background, used for the app shell.
       * Slightly darker than #000 for reduced eye strain.
       */
      background: '#09090B',

      /**
       * Zinc 900 (#18181B) — elevated surface for cards, panels, and modals.
       */
      surface: '#18181B',

      text: {
        /**
         * White (#FFFFFF) — primary text on dark backgrounds.
         * WCAG AAA contrast on zinc-950 and zinc-900 surfaces.
         */
        primary: '#FAFAFA',

        /**
         * Zinc 400 (#A1A1AA) — secondary text for labels, captions,
         * helper text, and subdued UI chrome.
         */
        secondary: '#A1A1AA',

        /**
         * Zinc 600 (#52525B) — muted placeholder and disabled text.
         */
        muted: '#52525B',
      },

      /**
       * Zinc 800 (#27272A) — border color for dividers, cards, and inputs.
       * Preferred over shadows in this theme for a flat, minimal aesthetic.
       */
      border: '#27272A',
    },

    // -----------------------------------------------------------------------
    // Typography
    // -----------------------------------------------------------------------
    typography: {
      fontFamily: {
        /**
         * Geist — Vercel's geometric sans-serif designed for developer tools.
         * Clean, modern, and highly legible at small sizes on dark backgrounds.
         */
        sans: '"Geist", "Geist Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

        /**
         * Geist Mono — the monospace companion to Geist.
         * Used for code, slugs, API tokens, and technical content.
         */
        mono: '"Geist Mono", "GeistMono NF", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
      },

      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
      },

      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },

      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
    },

    // -----------------------------------------------------------------------
    // Spacing — same 4px base grid as Default
    // -----------------------------------------------------------------------
    spacing: {
      '0': '0px',
      '0.5': '0.125rem', //  2px
      '1': '0.25rem',    //  4px
      '1.5': '0.375rem', //  6px
      '2': '0.5rem',     //  8px
      '2.5': '0.625rem', // 10px
      '3': '0.75rem',    // 12px
      '3.5': '0.875rem', // 14px
      '4': '1rem',       // 16px
      '5': '1.25rem',    // 20px
      '6': '1.5rem',     // 24px
      '7': '1.75rem',    // 28px
      '8': '2rem',       // 32px
      '9': '2.25rem',    // 36px
      '10': '2.5rem',    // 40px
      '12': '3rem',      // 48px
      '14': '3.5rem',    // 56px
      '16': '4rem',      // 64px
      '20': '5rem',      // 80px
      '24': '6rem',      // 96px
      '32': '8rem',      // 128px
    },

    // -----------------------------------------------------------------------
    // Border radius — sharper corners for a minimal feel
    // -----------------------------------------------------------------------
    radius: {
      none: '0px',
      sm: '0.125rem',      //  2px — almost square
      DEFAULT: '0.25rem',  //  4px — the minimal default
      md: '0.25rem',       //  4px — inputs, buttons, badges
      lg: '0.375rem',      //  6px — cards, panels
      xl: '0.5rem',        //  8px — large cards
      '2xl': '0.75rem',    // 12px — hero sections
      full: '9999px',      // pills and avatar rings
    },

    // -----------------------------------------------------------------------
    // Shadows — very subtle, border-dominant aesthetic
    // -----------------------------------------------------------------------
    shadows: {
      none: 'none',
      /**
       * sm — barely-there shadow; the border does the visual lifting.
       */
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      /**
       * md — slight depth for dropdowns and popovers over dark surfaces.
       */
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      /**
       * lg — modals need a more prominent shadow to lift from near-black canvas.
       */
      lg: '0 8px 16px -4px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
      /**
       * xl — sheet overlays; adds colour-correct dark glow.
       */
      xl: '0 16px 24px -6px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      /**
       * inner — inset shadow for pressed/active states.
       */
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
      /**
       * glow — emerald accent glow for focus rings and highlighted states.
       * Signature touch of the Minimal theme.
       */
      glow: '0 0 0 2px rgb(16 185 129 / 0.3)',
    },

    // -----------------------------------------------------------------------
    // Animation — 100ms ease-out for snappier interactions
    // -----------------------------------------------------------------------
    animation: {
      /**
       * 100ms — noticeably snappier than the Default theme's 150ms.
       * Dark UIs read state changes faster, so shorter durations feel right.
       */
      duration: '100ms',
      /**
       * ease-out — begins fast and decelerates into the end state.
       * Feels decisive and crisp, matching the minimal aesthetic.
       */
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },

  // =========================================================================
  // Component overrides — dark-optimised styling
  // =========================================================================

  components: {
    // -----------------------------------------------------------------------
    // Sidebar
    // -----------------------------------------------------------------------
    Sidebar: {
      className: 'border-r border-zinc-800 bg-zinc-950',
      cssVars: {
        '--sidebar-width': '15rem',
        '--sidebar-bg': '#09090B',
        '--sidebar-border': '#27272A',
        '--sidebar-item-hover-bg': '#18181B',
        '--sidebar-item-active-bg': 'rgb(16 185 129 / 0.15)',
        '--sidebar-item-active-color': '#10B981',
        '--sidebar-item-color': '#A1A1AA',
        '--sidebar-logo-color': '#FAFAFA',
      },
    },

    // -----------------------------------------------------------------------
    // Topbar / Header
    // -----------------------------------------------------------------------
    Topbar: {
      className: 'border-b border-zinc-800 bg-zinc-950',
      cssVars: {
        '--topbar-height': '3.25rem',
        '--topbar-bg': '#09090B',
        '--topbar-border': '#27272A',
        '--topbar-color': '#FAFAFA',
        '--topbar-muted': '#71717A',
      },
    },

    // -----------------------------------------------------------------------
    // Card
    // -----------------------------------------------------------------------
    Card: {
      className: 'rounded-md border border-zinc-800 bg-zinc-900',
      cssVars: {
        '--card-bg': '#18181B',
        '--card-border': '#27272A',
        '--card-radius': '0.375rem',
        '--card-shadow': 'none', // Border replaces shadow in Minimal.
        '--card-header-bg': '#27272A',
        '--card-header-border': '#3F3F46',
      },
    },

    // -----------------------------------------------------------------------
    // Button
    // -----------------------------------------------------------------------
    Button: {
      cssVars: {
        '--button-primary-bg': '#10B981',
        '--button-primary-hover-bg': '#059669',
        '--button-primary-active-bg': '#047857',
        '--button-primary-color': '#FFFFFF',
        '--button-secondary-bg': '#27272A',
        '--button-secondary-hover-bg': '#3F3F46',
        '--button-secondary-color': '#FAFAFA',
        '--button-secondary-border': '#3F3F46',
        '--button-ghost-hover-bg': '#18181B',
        '--button-ghost-color': '#A1A1AA',
        '--button-destructive-bg': '#EF4444',
        '--button-destructive-hover-bg': '#DC2626',
        '--button-radius': '0.25rem',
        '--button-font-weight': '500',
      },
    },

    // -----------------------------------------------------------------------
    // Input / Textarea / Select
    // -----------------------------------------------------------------------
    Input: {
      className: 'border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900',
      cssVars: {
        '--input-bg': '#18181B',
        '--input-border': '#3F3F46',
        '--input-border-focus': '#10B981',
        '--input-ring-focus': 'rgb(16 185 129 / 0.2)',
        '--input-color': '#FAFAFA',
        '--input-placeholder': '#52525B',
        '--input-radius': '0.25rem',
        '--input-padding-x': '0.75rem',
        '--input-padding-y': '0.5rem',
        '--input-font-size': '0.875rem',
      },
    },

    // -----------------------------------------------------------------------
    // Badge
    // -----------------------------------------------------------------------
    Badge: {
      cssVars: {
        '--badge-default-bg': '#27272A',
        '--badge-default-color': '#A1A1AA',
        '--badge-primary-bg': 'rgb(16 185 129 / 0.15)',
        '--badge-primary-color': '#10B981',
        '--badge-destructive-bg': 'rgb(239 68 68 / 0.15)',
        '--badge-destructive-color': '#F87171',
        '--badge-radius': '0.25rem',
      },
    },

    // -----------------------------------------------------------------------
    // Table
    // -----------------------------------------------------------------------
    Table: {
      className: 'text-zinc-300',
      cssVars: {
        '--table-header-bg': '#27272A',
        '--table-header-color': '#A1A1AA',
        '--table-row-hover-bg': '#27272A',
        '--table-border': '#27272A',
        '--table-striped-bg': 'rgb(255 255 255 / 0.02)',
      },
    },

    // -----------------------------------------------------------------------
    // Dropdown / Select Menu
    // -----------------------------------------------------------------------
    DropdownMenu: {
      cssVars: {
        '--dropdown-bg': '#18181B',
        '--dropdown-border': '#3F3F46',
        '--dropdown-item-hover-bg': '#27272A',
        '--dropdown-item-color': '#FAFAFA',
        '--dropdown-separator': '#3F3F46',
        '--dropdown-radius': '0.25rem',
        '--dropdown-shadow': '0 8px 16px -4px rgb(0 0 0 / 0.5)',
      },
    },
  },

  // =========================================================================
  // Marketplace metadata
  // =========================================================================

  marketplace: {
    category: 'dark',
    previewUrl: 'https://demo.volqan.link/themes/minimal',
  },
};

export default minimalTheme;
