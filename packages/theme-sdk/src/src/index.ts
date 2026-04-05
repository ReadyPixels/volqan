/**
 * @file index.ts
 * @description @volqan/theme-sdk — Developer SDK for building Volqan themes.
 *
 * This package provides the complete toolkit for creating themes that plug into
 * the Volqan headless CMS. It re-exports all theme types from @volqan/core and
 * adds higher-level utilities: a base class, a functional `defineTheme()` API,
 * component override registration, and preview utilities.
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
 *       // ... full token set
 *     },
 *     // ...
 *   },
 * });
 * ```
 *
 * @packageDocumentation
 */

// Re-export all theme types from @volqan/core
export type { VolqanTheme, ComponentOverride } from '@volqan/core';

// Re-export theme engine utilities
export {
  validateTheme,
  generateThemeCss,
  ThemeValidationError,
} from '@volqan/core';

// SDK-specific APIs
export { VolqanThemeBase } from './base.js';
export { defineTheme } from './define.js';
export type { DefineThemeOptions, TokenDefinitions, ColorTokens, TypographyTokens, AnimationTokens } from './define.js';
export { registerComponentOverride, createComponentOverrides } from './overrides.js';
export type { ComponentOverrideMap } from './overrides.js';
export { createPreviewContext } from './preview.js';
export type { PreviewContext } from './preview.js';
