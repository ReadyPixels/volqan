/**
 * @file themes/index.ts
 * @description Barrel export for the Volqan Theme Engine.
 *
 * Import from this module to access all theme-related types and functions:
 * ```ts
 * import { VolqanTheme, loadTheme, applyTheme } from '@volqan/core/themes';
 * ```
 */

// Types
export type { VolqanTheme, ComponentOverride } from './types.js';

// Loader / Engine
export {
  loadTheme,
  applyTheme,
  loadAndApplyTheme,
  getActiveTheme,
  listThemes,
  getTheme,
  unloadTheme,
  generateThemeCss,
  getComponentOverride,
  mergeComponentStyle,
  validateTheme,
  ThemeValidationError,
} from './loader.js';
