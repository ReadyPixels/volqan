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
// ---------------------------------------------------------------------------
// Token flattening
// ---------------------------------------------------------------------------
/**
 * Flatten a VolqanTheme's token tree into a flat map of CSS custom properties.
 *
 * Token key format:
 *   theme.tokens.colors.primary       → --volqan-color-primary
 *   theme.tokens.typography.fontSize.sm → --volqan-font-size-sm
 *   theme.tokens.spacing['4']         → --volqan-spacing-4
 *   theme.tokens.animation.duration   → --volqan-animation-duration
 */
export function flattenThemeTokens(theme) {
    const result = {};
    const { tokens } = theme;
    // Colors
    result['--volqan-color-primary'] = tokens.colors.primary;
    result['--volqan-color-secondary'] = tokens.colors.secondary;
    result['--volqan-color-accent'] = tokens.colors.accent;
    result['--volqan-color-background'] = tokens.colors.background;
    result['--volqan-color-surface'] = tokens.colors.surface;
    result['--volqan-color-text-primary'] = tokens.colors.text.primary;
    result['--volqan-color-text-secondary'] = tokens.colors.text.secondary;
    result['--volqan-color-text-muted'] = tokens.colors.text.muted;
    result['--volqan-color-border'] = tokens.colors.border;
    // Typography
    result['--volqan-font-sans'] = tokens.typography.fontFamily.sans;
    result['--volqan-font-mono'] = tokens.typography.fontFamily.mono;
    for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
        result[`--volqan-font-size-${key}`] = value;
    }
    for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
        result[`--volqan-font-weight-${key}`] = String(value);
    }
    for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
        result[`--volqan-line-height-${key}`] = value;
    }
    // Spacing
    for (const [key, value] of Object.entries(tokens.spacing)) {
        result[`--volqan-spacing-${key}`] = value;
    }
    // Radius
    for (const [key, value] of Object.entries(tokens.radius)) {
        result[`--volqan-radius-${key}`] = value;
    }
    // Shadows
    for (const [key, value] of Object.entries(tokens.shadows)) {
        result[`--volqan-shadow-${key}`] = value;
    }
    // Animation
    result['--volqan-animation-duration'] = tokens.animation.duration;
    result['--volqan-animation-easing'] = tokens.animation.easing;
    return result;
}
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
export function tokensToCSS(tokens, selector = ':root') {
    const declarations = Object.entries(tokens)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');
    return `${selector} {\n${declarations}\n}`;
}
export class ThemeApplicator {
    selector;
    transitionDurationMs;
    emitChangeEvent;
    /** Currently applied theme id (or null if none). */
    currentThemeId = null;
    /** Style element for injected CSS (browser only). */
    styleEl = null;
    constructor(options = {}) {
        this.selector = options.selector ?? ':root';
        this.transitionDurationMs = options.transitionDurationMs ?? 200;
        this.emitChangeEvent = options.emitChangeEvent ?? true;
    }
    /**
     * Apply a theme by injecting its tokens as CSS custom properties.
     *
     * In browser environments, patches the existing custom properties on the
     * document root for a smooth transition. In Node/SSR, returns the CSS string.
     *
     * @param theme - The VolqanTheme to apply.
     * @returns The generated CSS string (useful in SSR contexts).
     */
    apply(theme) {
        const tokens = flattenThemeTokens(theme);
        const css = tokensToCSS(tokens, this.selector);
        // Browser: inject into DOM
        if (typeof document !== 'undefined') {
            this.applyToDOM(tokens, theme.id);
        }
        this.currentThemeId = theme.id;
        return css;
    }
    /**
     * Hot-swap to a new theme with a smooth CSS transition.
     *
     * Adds a temporary `transition: all {duration}ms` rule during the swap,
     * then removes it after the animation completes.
     */
    hotSwap(theme) {
        if (typeof document === 'undefined') {
            this.apply(theme);
            return;
        }
        const root = document.documentElement;
        // Enable transitions
        if (this.transitionDurationMs > 0) {
            root.style.transition = `background-color ${this.transitionDurationMs}ms ease, color ${this.transitionDurationMs}ms ease`;
        }
        this.apply(theme);
        // Remove transition after animation
        if (this.transitionDurationMs > 0) {
            setTimeout(() => {
                root.style.transition = '';
            }, this.transitionDurationMs);
        }
    }
    /**
     * Remove all injected theme tokens.
     * Restores the default CSS custom properties.
     */
    reset() {
        if (typeof document !== 'undefined') {
            this.styleEl?.remove();
            this.styleEl = null;
        }
        this.currentThemeId = null;
    }
    /**
     * Generate a static CSS string for a theme (SSR / server-side rendering).
     * Does not interact with the DOM.
     */
    static generateCSS(theme, selector = ':root') {
        const tokens = flattenThemeTokens(theme);
        return tokensToCSS(tokens, selector);
    }
    /**
     * Get the currently applied theme id.
     */
    getActiveThemeId() {
        return this.currentThemeId;
    }
    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------
    applyToDOM(tokens, themeId) {
        if (!this.styleEl) {
            this.styleEl = document.createElement('style');
            this.styleEl.id = 'volqan-theme';
            document.head.appendChild(this.styleEl);
        }
        const css = tokensToCSS(tokens, this.selector);
        this.styleEl.textContent = css;
        // Set data attribute on root for debugging
        document.documentElement.dataset['volqanTheme'] = themeId;
        if (this.emitChangeEvent) {
            document.dispatchEvent(new CustomEvent('volqan:theme-change', { detail: { themeId } }));
        }
    }
}
// ---------------------------------------------------------------------------
// Singleton applicator
// ---------------------------------------------------------------------------
export const themeApplicator = new ThemeApplicator();
//# sourceMappingURL=applicator.js.map