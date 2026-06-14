/**
 * @file themes/loader.ts
 * @description Volqan Theme Engine — loads, validates, and applies themes by
 * injecting design tokens as CSS custom properties on the document root.
 */
import type { VolqanTheme, ComponentOverride } from './types.js';
/** Thrown when a theme object fails structural validation. */
export declare class ThemeValidationError extends Error {
    readonly name = "ThemeValidationError";
    constructor(message: string);
}
/**
 * Validate that an object conforms to the VolqanTheme interface.
 *
 * @param theme - The candidate theme object.
 * @throws {ThemeValidationError} on any structural violation.
 */
export declare function validateTheme(theme: unknown): asserts theme is VolqanTheme;
/**
 * Register a theme with the Volqan theme engine without activating it.
 *
 * @param theme - The theme to register.
 * @throws {ThemeValidationError} if the theme fails validation.
 */
export declare function loadTheme(theme: unknown): VolqanTheme;
/**
 * Apply a registered theme, injecting its tokens as CSS custom properties.
 *
 * @param themeId - The id of a previously loaded theme.
 * @returns The generated CSS string (for SSR <style> injection).
 * @throws {Error} if the theme id is not found in the registry.
 */
export declare function applyTheme(themeId: string): string;
/**
 * Load and immediately apply a theme in one call.
 *
 * @param theme - The theme object to load and apply.
 * @returns The generated CSS string.
 */
export declare function loadAndApplyTheme(theme: unknown): string;
/**
 * Get the currently active theme.
 *
 * @returns The active VolqanTheme, or null if no theme is applied.
 */
export declare function getActiveTheme(): VolqanTheme | null;
/**
 * List all registered themes.
 *
 * @returns An array of all VolqanTheme objects in the registry.
 */
export declare function listThemes(): VolqanTheme[];
/**
 * Get a single registered theme by id.
 *
 * @param themeId - The theme id.
 * @returns The VolqanTheme or undefined if not found.
 */
export declare function getTheme(themeId: string): VolqanTheme | undefined;
/**
 * Unregister a theme from the engine.
 * If the theme is currently active, the active theme is cleared.
 *
 * @param themeId - The theme id to remove.
 */
export declare function unloadTheme(themeId: string): void;
/**
 * Generate a CSS string for a theme without applying it to the DOM.
 * Useful for server-side rendering or preview generation.
 *
 * @param theme - The theme to generate CSS for (does not need to be registered).
 * @returns A complete CSS string with :root { ... } block.
 */
export declare function generateThemeCss(theme: VolqanTheme): string;
/**
 * Resolve the effective ComponentOverride for a named component in the active theme.
 *
 * @param componentName - shadcn/ui component name (e.g. "Button").
 * @returns The ComponentOverride or undefined if not found.
 */
export declare function getComponentOverride(componentName: string): ComponentOverride | undefined;
/**
 * Merge the active theme's component CSS vars into an existing style object.
 * Useful in React components to apply per-component token overrides.
 *
 * @param componentName - shadcn/ui component name.
 * @param baseStyle - Existing inline style object to merge into.
 * @returns A merged style object.
 */
export declare function mergeComponentStyle(componentName: string, baseStyle?: React.CSSProperties): React.CSSProperties;
declare namespace React {
    interface CSSProperties extends Record<string, string | number | undefined> {
    }
}
export {};
//# sourceMappingURL=loader.d.ts.map