/**
 * @file themes/runtime/applicator.ts
 * @description ThemeApplicator — reads active theme tokens, converts them to CSS
 * custom properties, injects them into the admin layout, and handles hot-swap
 * between themes without a full page reload.
 *
 * Two injection modes are supported:
 * - DOM injection (browser): Sets cssText on document.documentElement
 * - Static CSS generation (SSR/server): Returns a CSS string for <style> injection
 */
import type { VolqanTheme } from '../types.js';
/**
 * Flatten a VolqanTheme's token tree into a flat map of CSS custom properties.
 *
 * Token key format:
 *   theme.tokens.colors.primary       → --volqan-color-primary
 *   theme.tokens.typography.fontSize.sm → --volqan-font-size-sm
 *   theme.tokens.spacing['4']         → --volqan-spacing-4
 *   theme.tokens.animation.duration   → --volqan-animation-duration
 */
export declare function flattenThemeTokens(theme: VolqanTheme): Record<string, string>;
/**
 * Convert a flat token map to a CSS custom properties string.
 *
 * @example
 * ```css
 * :root {
 *   --volqan-color-primary: #3b82f6;
 *   --volqan-font-sans: Inter, system-ui, sans-serif;
 * }
 * ```
 */
export declare function tokensToCSS(tokens: Record<string, string>, selector?: string): string;
export interface ThemeApplicatorOptions {
    /**
     * CSS selector to apply tokens to.
     * @default ':root'
     */
    selector?: string;
    /**
     * Transition duration for hot-swapping themes (ms).
     * Set to 0 to disable transitions.
     * @default 200
     */
    transitionDurationMs?: number;
    /**
     * Whether to emit a custom DOM event when the theme changes.
     * @default true
     */
    emitChangeEvent?: boolean;
}
export declare class ThemeApplicator {
    private readonly selector;
    private readonly transitionDurationMs;
    private readonly emitChangeEvent;
    /** Currently applied theme id (or null if none). */
    private currentThemeId;
    /** Style element for injected CSS (browser only). */
    private styleEl;
    constructor(options?: ThemeApplicatorOptions);
    /**
     * Apply a theme by injecting its tokens as CSS custom properties.
     *
     * In browser environments, patches the existing custom properties on the
     * document root for a smooth transition. In Node/SSR, returns the CSS string.
     *
     * @param theme - The VolqanTheme to apply.
     * @returns The generated CSS string (useful in SSR contexts).
     */
    apply(theme: VolqanTheme): string;
    /**
     * Hot-swap to a new theme with a smooth CSS transition.
     *
     * Adds a temporary `transition: all {duration}ms` rule during the swap,
     * then removes it after the animation completes.
     */
    hotSwap(theme: VolqanTheme): void;
    /**
     * Remove all injected theme tokens.
     * Restores the default CSS custom properties.
     */
    reset(): void;
    /**
     * Generate a static CSS string for a theme (SSR / server-side rendering).
     * Does not interact with the DOM.
     */
    static generateCSS(theme: VolqanTheme, selector?: string): string;
    /**
     * Get the currently applied theme id.
     */
    getActiveThemeId(): string | null;
    private applyToDOM;
}
export declare const themeApplicator: ThemeApplicator;
//# sourceMappingURL=applicator.d.ts.map