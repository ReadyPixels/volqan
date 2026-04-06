/**
 * @file index.ts
 * @description Volqan Default Theme — official clean, professional light theme.
 *
 * A polished, blue-primary light theme built on Inter and JetBrains Mono.
 * Designed for clarity and professional content management workflows.
 *
 * All tokens are injected as CSS custom properties on the <html> element
 * under the --volqan-* namespace by the Volqan theme engine.
 */

import type { VolqanTheme } from '@volqan/core';

const defaultTheme: VolqanTheme = {
  id: 'volqan/default',
  name: 'Volqan Default',
  version: '0.1.0',

  // =========================================================================
  // Design tokens
  // =========================================================================

  tokens: {
    // -----------------------------------------------------------------------
    // Colors
    // -----------------------------------------------------------------------
    colors: {
      /**
       * Blue 600 (#2563EB) — the primary Volqan brand color.
       * Used for primary buttons, active sidebar items, focus rings,
       * and interactive element highlights.
       */
      primary: '#2563EB',

      /**
       * Blue 100 (#DBEAFE) — a muted complement to the primary.
       * Used for hover backgrounds, selected row tints, and badge fills.
       */
      secondary: '#DBEAFE',

      /**
       * Blue 500 (#3B82F6) — accent for callouts, badges, and highlights.
       */
      accent: '#3B82F6',

      /**
       * White background — clean, high-contrast canvas for admin content.
       */
      background: '#FFFFFF',

      /**
       * Slate 50 (#F8FAFC) — slightly off-white for cards, modals,
       * table rows, and elevated surfaces.
       */
      surface: '#F8FAFC',

      text: {
        /**
         * Slate 900 (#0F172A) — near-black for body copy and headings.
         * Provides a WCAG AA contrast ratio >7:1 on white backgrounds.
         */
        primary: '#0F172A',

        /**
         * Slate 600 (#475569) — subdued text for labels, captions,
         * and secondary information.
         */
        secondary: '#475569',

        /**
         * Slate 400 (#94A3B8) — muted placeholder text and disabled states.
         */
        muted: '#94A3B8',
      },

      /**
       * Slate 200 (#E2E8F0) — subtle borders for dividers, inputs, and cards.
       */
      border: '#E2E8F0',
    },

    // -----------------------------------------------------------------------
    // Typography
    // -----------------------------------------------------------------------
    typography: {
      fontFamily: {
        /**
         * Inter — a humanist sans-serif optimised for screen legibility.
         * Falls back to the system UI font stack for zero-FOUT experience
         * when Inter is not yet loaded.
         */
        sans: '"Inter", "Inter var", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

        /**
         * JetBrains Mono — a programmers' monospace with ligature support.
         * Used for code blocks, slug previews, API keys, and JSON editors.
         */
        mono: '"JetBrains Mono", "JetBrainsMono NF", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },

      fontSize: {
        xs: '0.75rem',    // 12px — micro labels, badges, timestamps
        sm: '0.875rem',   // 14px — helper text, table cells, captions
        base: '1rem',     // 16px — body copy
        lg: '1.125rem',   // 18px — sub-headings, card titles
        xl: '1.25rem',    // 20px — section headings
        '2xl': '1.5rem',  // 24px — page titles
        '3xl': '1.875rem',// 30px — display headings
        '4xl': '2.25rem', // 36px — hero text
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
    // Spacing — 4px base grid
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
    // Border radius — subtle rounding for a professional feel
    // -----------------------------------------------------------------------
    radius: {
      none: '0px',
      sm: '0.125rem',   // 2px — tight rounding for chips and tags
      DEFAULT: '0.375rem', // 6px — default for inputs, badges
      md: '0.375rem',   // 6px — buttons, inputs, cards
      lg: '0.5rem',     // 8px — modals, panels
      xl: '0.75rem',    // 12px — large cards
      '2xl': '1rem',    // 16px — hero sections
      full: '9999px',   // fully rounded pills and avatars
    },

    // -----------------------------------------------------------------------
    // Shadows — three levels of elevation
    // -----------------------------------------------------------------------
    shadows: {
      none: 'none',
      /**
       * sm — subtle card shadow for low-elevation surfaces like table rows.
       */
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      /**
       * md — medium elevation for cards, dropdowns, and popovers.
       */
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      /**
       * lg — prominent elevation for modals, dialogs, and floating panels.
       */
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      /**
       * xl — maximum elevation for toasts and sheet overlays.
       */
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      /**
       * inner — depressed shadow for pressed button states and well insets.
       */
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },

    // -----------------------------------------------------------------------
    // Animation — 150ms ease transitions
    // -----------------------------------------------------------------------
    animation: {
      /** Default transition duration for hover/focus state changes. */
      duration: '150ms',
      /**
       * Standard ease — balanced enter and exit curves for UI transitions.
       * Matches Tailwind's default `ease` timing function.
       */
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // =========================================================================
  // Component overrides
  // Adjust shadcn/ui defaults for the Default theme's visual language.
  // =========================================================================

  components: {
    // -----------------------------------------------------------------------
    // Sidebar
    // -----------------------------------------------------------------------
    Sidebar: {
      className: 'border-r border-slate-200 bg-white',
      cssVars: {
        '--sidebar-width': '16rem',
        '--sidebar-bg': '#FFFFFF',
        '--sidebar-border': '#E2E8F0',
        '--sidebar-item-hover-bg': '#EFF6FF',
        '--sidebar-item-active-bg': '#DBEAFE',
        '--sidebar-item-active-color': '#1D4ED8',
        '--sidebar-item-color': '#475569',
      },
    },

    // -----------------------------------------------------------------------
    // Topbar / Header
    // -----------------------------------------------------------------------
    Topbar: {
      className: 'border-b border-slate-200 bg-white shadow-sm',
      cssVars: {
        '--topbar-height': '3.5rem',
        '--topbar-bg': '#FFFFFF',
        '--topbar-border': '#E2E8F0',
        '--topbar-color': '#0F172A',
      },
    },

    // -----------------------------------------------------------------------
    // Card
    // -----------------------------------------------------------------------
    Card: {
      className: 'rounded-lg border border-slate-200 bg-white shadow-sm',
      cssVars: {
        '--card-bg': '#FFFFFF',
        '--card-border': '#E2E8F0',
        '--card-radius': '0.5rem',
        '--card-shadow': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '--card-header-bg': '#F8FAFC',
        '--card-header-border': '#E2E8F0',
      },
    },

    // -----------------------------------------------------------------------
    // Button
    // -----------------------------------------------------------------------
    Button: {
      cssVars: {
        '--button-primary-bg': '#2563EB',
        '--button-primary-hover-bg': '#1D4ED8',
        '--button-primary-active-bg': '#1E40AF',
        '--button-primary-color': '#FFFFFF',
        '--button-secondary-bg': '#F1F5F9',
        '--button-secondary-hover-bg': '#E2E8F0',
        '--button-secondary-color': '#0F172A',
        '--button-destructive-bg': '#EF4444',
        '--button-destructive-hover-bg': '#DC2626',
        '--button-radius': '0.375rem',
        '--button-font-weight': '600',
      },
    },

    // -----------------------------------------------------------------------
    // Input / Textarea / Select
    // -----------------------------------------------------------------------
    Input: {
      className: 'border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
      cssVars: {
        '--input-bg': '#FFFFFF',
        '--input-border': '#CBD5E1',
        '--input-border-focus': '#2563EB',
        '--input-ring-focus': 'rgba(37, 99, 235, 0.2)',
        '--input-placeholder': '#94A3B8',
        '--input-radius': '0.375rem',
        '--input-padding-x': '0.75rem',
        '--input-padding-y': '0.5rem',
        '--input-font-size': '0.875rem',
      },
    },
  },

  // =========================================================================
  // Marketplace metadata
  // =========================================================================

  marketplace: {
    category: 'light',
    previewUrl: 'https://demo.volqan.link/themes/default',
  },
};

export default defaultTheme;
