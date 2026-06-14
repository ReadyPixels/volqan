/**
 * @file themes/runtime/preview.ts
 * @description ThemePreview — temporarily applies a theme without persisting,
 * for live preview in the theme manager page.
 *
 * Preview mode:
 * 1. Applies the selected theme tokens to the document.
 * 2. Records the previous theme id.
 * 3. Provides a restore() method to revert to the previous theme.
 * 4. Automatically expires after a configurable timeout.
 */
import type { VolqanTheme } from '../types.js';
export interface ThemePreviewOptions {
    /**
     * Auto-restore the previous theme after this many ms.
     * Set to 0 to disable auto-restore.
     * @default 0
     */
    autoRestoreMs?: number;
    /**
     * Callback invoked when the preview is restored.
     */
    onRestore?: (restoredThemeId: string | null) => void;
}
export declare class ThemePreview {
    private readonly applicator;
    private previousThemeId;
    private isPreviewActive;
    private autoRestoreTimer;
    constructor();
    /**
     * Start a preview of the given theme.
     *
     * If a preview is already active, it is replaced with the new theme.
     * The previously active theme id is preserved for restore().
     *
     * @param theme - The VolqanTheme to preview.
     * @param options - Preview options.
     */
    start(theme: VolqanTheme, options?: ThemePreviewOptions): void;
    /**
     * Restore the previously active theme, ending the preview.
     *
     * @returns The id of the theme that was restored (or null if none).
     */
    restore(): string | null;
    /**
     * Generate a static CSS string for a theme preview (for iframes or SSR).
     * Does not affect the live DOM.
     *
     * @param theme - The VolqanTheme to render as CSS.
     * @returns CSS string with custom property declarations.
     */
    generatePreviewCSS(theme: VolqanTheme): string;
    /**
     * Generate an object representing the visual diff between two themes.
     * Useful for highlighting changed tokens in the theme editor UI.
     *
     * @param from - The baseline theme.
     * @param to - The new theme to compare.
     * @returns Map of token keys to { from, to } value pairs.
     */
    static diff(from: VolqanTheme, to: VolqanTheme): Record<string, {
        from: string;
        to: string;
    }>;
    /**
     * Whether a preview is currently active.
     */
    get active(): boolean;
    /**
     * The id of the theme being previewed (null if no preview is active).
     */
    get previewThemeId(): string | null;
    private clearAutoRestore;
}
export declare const themePreview: ThemePreview;
//# sourceMappingURL=preview.d.ts.map