/**
 * @file themes/runtime/registry.ts
 * @description Theme registry — scans themes directory, loads theme manifests,
 * and maintains the list of available themes (loaded and unloaded).
 */
import type { VolqanTheme } from '../types.js';
export interface ThemeManifest {
    /** Theme ID (e.g. "volqan/default"). */
    id: string;
    /** Display name. */
    name: string;
    /** Absolute path to the theme directory. */
    directory: string;
    /** Absolute path to the theme entry point. */
    entryPath: string;
    /** Raw manifest data. */
    raw: Record<string, unknown>;
}
export declare class ThemeRegistry {
    /** Fully loaded themes by id. */
    private readonly themes;
    /** Discovered manifests (may include themes not yet loaded). */
    private readonly manifests;
    /** Currently active theme id. */
    private activeThemeId;
    /**
     * Scan a themes directory for available theme packages.
     *
     * Theme packages must contain either:
     * - `volqan-theme.json` manifest file
     * - `package.json` with a `"volqanTheme"` key
     *
     * @param themesDir - Absolute path to the themes directory.
     */
    scan(themesDir: string): Promise<ThemeManifest[]>;
    /**
     * Register a loaded VolqanTheme.
     *
     * @param theme - The theme object to register.
     */
    register(theme: VolqanTheme): void;
    /**
     * Unregister a theme.
     *
     * @param themeId - The id of the theme to remove.
     */
    unregister(themeId: string): void;
    /**
     * Set the active theme.
     *
     * @param themeId - The id of the theme to activate.
     * @throws {Error} if the theme is not registered.
     */
    setActive(themeId: string): void;
    /**
     * Get the currently active VolqanTheme object.
     * Returns null if no theme is active.
     */
    getActive(): VolqanTheme | null;
    /**
     * Get the active theme id.
     */
    getActiveId(): string | null;
    /** Check whether a theme is registered. */
    has(themeId: string): boolean;
    /** Get a registered theme by id. */
    get(themeId: string): VolqanTheme | undefined;
    /** Get all registered themes. */
    all(): VolqanTheme[];
    /** Get all discovered manifests (including unloaded themes). */
    getManifests(): ThemeManifest[];
    private readManifest;
}
export declare const themeRegistry: ThemeRegistry;
//# sourceMappingURL=registry.d.ts.map