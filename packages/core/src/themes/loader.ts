/**
 * @file themes/loader.ts
 * @description Volqan Theme Engine — loads, validates, and applies themes by
 * injecting design tokens as CSS custom properties on the document root.
 */

import type { VolqanTheme, ComponentOverride } from './types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** CSS custom property prefix for all Volqan theme tokens. */
const VAR_PREFIX = '--volqan';

/** DOM selector target for CSS variable injection. */
const ROOT_SELECTOR = ':root';

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Map of all registered themes keyed by id. */
const themeRegistry = new Map<string, VolqanTheme>();

/** Currently active theme id, or null if no theme is active. */
let activeThemeId: string | null = null;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Thrown when a theme object fails structural validation. */
export class ThemeValidationError extends Error {
  override readonly name = 'ThemeValidationError';
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ThemeValidationError.prototype);
  }
}

/**
 * Validate that an object conforms to the VolqanTheme interface.
 *
 * @param theme - The candidate theme object.
 * @throws {ThemeValidationError} on any structural violation.
 */
export function validateTheme(theme: unknown): asserts theme is VolqanTheme {
  if (!theme || typeof theme !== 'object') {
    throw new ThemeValidationError('Theme must be a non-null object.');
  }

  const t = theme as Record<string, unknown>;

  for (const field of ['id', 'name', 'version'] as const) {
    if (typeof t[field] !== 'string' || !(t[field] as string).trim()) {
      throw new ThemeValidationError(
        `Theme field "${field}" must be a non-empty string.`,
      );
    }
  }

  // id format: "vendor/theme-name"
  const id = t['id'] as string;
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(id)) {
    throw new ThemeValidationError(
      `Theme id "${id}" must follow the format "vendor/theme-name" (lowercase alphanumeric and hyphens).`,
    );
  }

  if (!t['tokens'] || typeof t['tokens'] !== 'object') {
    throw new ThemeValidationError('Theme must have a "tokens" object.');
  }

  const tokens = t['tokens'] as Record<string, unknown>;

  if (!tokens['colors'] || typeof tokens['colors'] !== 'object') {
    throw new ThemeValidationError('Theme tokens.colors must be an object.');
  }

  const colors = tokens['colors'] as Record<string, unknown>;
  for (const colorKey of [
    'primary',
    'secondary',
    'accent',
    'background',
    'surface',
    'border',
  ]) {
    if (typeof colors[colorKey] !== 'string') {
      throw new ThemeValidationError(
        `Theme tokens.colors.${colorKey} must be a string.`,
      );
    }
  }

  if (!colors['text'] || typeof colors['text'] !== 'object') {
    throw new ThemeValidationError('Theme tokens.colors.text must be an object.');
  }

  const textColors = colors['text'] as Record<string, unknown>;
  for (const textKey of ['primary', 'secondary', 'muted']) {
    if (typeof textColors[textKey] !== 'string') {
      throw new ThemeValidationError(
        `Theme tokens.colors.text.${textKey} must be a string.`,
      );
    }
  }

  if (!tokens['typography'] || typeof tokens['typography'] !== 'object') {
    throw new ThemeValidationError('Theme tokens.typography must be an object.');
  }

  const typography = tokens['typography'] as Record<string, unknown>;
  if (
    !typography['fontFamily'] ||
    typeof typography['fontFamily'] !== 'object'
  ) {
    throw new ThemeValidationError(
      'Theme tokens.typography.fontFamily must be an object.',
    );
  }

  const fontFamily = typography['fontFamily'] as Record<string, unknown>;
  for (const fk of ['sans', 'mono']) {
    if (typeof fontFamily[fk] !== 'string') {
      throw new ThemeValidationError(
        `Theme tokens.typography.fontFamily.${fk} must be a string.`,
      );
    }
  }

  for (const recordField of ['fontSize', 'fontWeight', 'lineHeight', 'spacing', 'radius', 'shadows']) {
    const target = recordField in typography
      ? typography[recordField]
      : tokens[recordField];
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
      throw new ThemeValidationError(
        `Theme tokens.${recordField} must be a key-value object.`,
      );
    }
  }

  if (!tokens['animation'] || typeof tokens['animation'] !== 'object') {
    throw new ThemeValidationError('Theme tokens.animation must be an object.');
  }

  const animation = tokens['animation'] as Record<string, unknown>;
  for (const ak of ['duration', 'easing']) {
    if (typeof animation[ak] !== 'string') {
      throw new ThemeValidationError(
        `Theme tokens.animation.${ak} must be a string.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Token → CSS variable mapping
// ---------------------------------------------------------------------------

/**
 * Flatten a VolqanTheme token tree into a CSS custom property map.
 *
 * @param theme - A validated VolqanTheme.
 * @returns A flat map from CSS custom property name to value.
 */
function buildCssVarMap(theme: VolqanTheme): Map<string, string> {
  const vars = new Map<string, string>();
  const { tokens } = theme;

  // Colors
  const c = tokens.colors;
  vars.set(`${VAR_PREFIX}-color-primary`, c.primary);
  vars.set(`${VAR_PREFIX}-color-secondary`, c.secondary);
  vars.set(`${VAR_PREFIX}-color-accent`, c.accent);
  vars.set(`${VAR_PREFIX}-color-background`, c.background);
  vars.set(`${VAR_PREFIX}-color-surface`, c.surface);
  vars.set(`${VAR_PREFIX}-color-border`, c.border);
  vars.set(`${VAR_PREFIX}-color-text-primary`, c.text.primary);
  vars.set(`${VAR_PREFIX}-color-text-secondary`, c.text.secondary);
  vars.set(`${VAR_PREFIX}-color-text-muted`, c.text.muted);

  // Typography — font family
  vars.set(`${VAR_PREFIX}-font-sans`, tokens.typography.fontFamily.sans);
  vars.set(`${VAR_PREFIX}-font-mono`, tokens.typography.fontFamily.mono);

  // Typography — font size
  for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
    vars.set(`${VAR_PREFIX}-font-size-${key}`, value);
  }

  // Typography — font weight
  for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
    vars.set(`${VAR_PREFIX}-font-weight-${key}`, String(value));
  }

  // Typography — line height
  for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
    vars.set(`${VAR_PREFIX}-line-height-${key}`, value);
  }

  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    vars.set(`${VAR_PREFIX}-spacing-${key}`, value);
  }

  // Radius
  for (const [key, value] of Object.entries(tokens.radius)) {
    vars.set(`${VAR_PREFIX}-radius-${key}`, value);
  }

  // Shadows
  for (const [key, value] of Object.entries(tokens.shadows)) {
    vars.set(`${VAR_PREFIX}-shadow-${key}`, value);
  }

  // Animation
  vars.set(`${VAR_PREFIX}-animation-duration`, tokens.animation.duration);
  vars.set(`${VAR_PREFIX}-animation-easing`, tokens.animation.easing);

  return vars;
}

// ---------------------------------------------------------------------------
// DOM injection
// ---------------------------------------------------------------------------

/**
 * Inject CSS custom properties into the document root (server-safe).
 * In a server-side rendering context this builds a <style> string instead.
 *
 * @param vars - Flat map of CSS variable name → value.
 * @returns The generated CSS string (useful for SSR injection into <head>).
 */
function injectCssVars(vars: Map<string, string>): string {
  const declarations = Array.from(vars.entries())
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  const css = `${ROOT_SELECTOR} {\n${declarations}\n}`;

  // Browser: inject into DOM
  if (typeof document !== 'undefined') {
    let styleEl = document.getElementById(
      'volqan-theme-tokens',
    ) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'volqan-theme-tokens';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = css;
  }

  return css;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a theme with the Volqan theme engine without activating it.
 *
 * @param theme - The theme to register.
 * @throws {ThemeValidationError} if the theme fails validation.
 */
export function loadTheme(theme: unknown): VolqanTheme {
  validateTheme(theme);

  if (themeRegistry.has(theme.id)) {
    console.warn(
      `[volqan/themes] Theme "${theme.id}" is already registered — overwriting.`,
    );
  }

  themeRegistry.set(theme.id, theme);
  console.info(`[volqan/themes] Theme registered: ${theme.id}@${theme.version}`);

  return theme;
}

/**
 * Apply a registered theme, injecting its tokens as CSS custom properties.
 *
 * @param themeId - The id of a previously loaded theme.
 * @returns The generated CSS string (for SSR <style> injection).
 * @throws {Error} if the theme id is not found in the registry.
 */
export function applyTheme(themeId: string): string {
  const theme = themeRegistry.get(themeId);

  if (!theme) {
    throw new Error(
      `[volqan/themes] Cannot apply theme "${themeId}" — it has not been loaded. ` +
        `Call loadTheme() first.`,
    );
  }

  const vars = buildCssVarMap(theme);
  const css = injectCssVars(vars);

  activeThemeId = themeId;
  console.info(`[volqan/themes] Theme applied: ${themeId}`);

  return css;
}

/**
 * Load and immediately apply a theme in one call.
 *
 * @param theme - The theme object to load and apply.
 * @returns The generated CSS string.
 */
export function loadAndApplyTheme(theme: unknown): string {
  const loaded = loadTheme(theme);
  return applyTheme(loaded.id);
}

/**
 * Get the currently active theme.
 *
 * @returns The active VolqanTheme, or null if no theme is applied.
 */
export function getActiveTheme(): VolqanTheme | null {
  if (!activeThemeId) return null;
  return themeRegistry.get(activeThemeId) ?? null;
}

/**
 * List all registered themes.
 *
 * @returns An array of all VolqanTheme objects in the registry.
 */
export function listThemes(): VolqanTheme[] {
  return Array.from(themeRegistry.values());
}

/**
 * Get a single registered theme by id.
 *
 * @param themeId - The theme id.
 * @returns The VolqanTheme or undefined if not found.
 */
export function getTheme(themeId: string): VolqanTheme | undefined {
  return themeRegistry.get(themeId);
}

/**
 * Unregister a theme from the engine.
 * If the theme is currently active, the active theme is cleared.
 *
 * @param themeId - The theme id to remove.
 */
export function unloadTheme(themeId: string): void {
  if (activeThemeId === themeId) {
    activeThemeId = null;
  }
  themeRegistry.delete(themeId);
  console.info(`[volqan/themes] Theme unloaded: ${themeId}`);
}

/**
 * Generate a CSS string for a theme without applying it to the DOM.
 * Useful for server-side rendering or preview generation.
 *
 * @param theme - The theme to generate CSS for (does not need to be registered).
 * @returns A complete CSS string with :root { ... } block.
 */
export function generateThemeCss(theme: VolqanTheme): string {
  validateTheme(theme);
  const vars = buildCssVarMap(theme);
  const declarations = Array.from(vars.entries())
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${ROOT_SELECTOR} {\n${declarations}\n}`;
}

/**
 * Resolve the effective ComponentOverride for a named component in the active theme.
 *
 * @param componentName - shadcn/ui component name (e.g. "Button").
 * @returns The ComponentOverride or undefined if not found.
 */
export function getComponentOverride(
  componentName: string,
): ComponentOverride | undefined {
  const theme = getActiveTheme();
  if (!theme?.components) return undefined;
  return theme.components[componentName];
}

/**
 * Merge the active theme's component CSS vars into an existing style object.
 * Useful in React components to apply per-component token overrides.
 *
 * @param componentName - shadcn/ui component name.
 * @param baseStyle - Existing inline style object to merge into.
 * @returns A merged style object.
 */
export function mergeComponentStyle(
  componentName: string,
  baseStyle: React.CSSProperties = {},
): React.CSSProperties {
  const override = getComponentOverride(componentName);
  if (!override?.cssVars) return baseStyle;
  return { ...baseStyle, ...override.cssVars } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Minimal React shim (avoids importing React in a non-React package)
// ---------------------------------------------------------------------------
declare namespace React {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface CSSProperties extends Record<string, string | number | undefined> {}
}
