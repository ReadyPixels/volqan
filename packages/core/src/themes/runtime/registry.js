/**
 * @file themes/runtime/registry.ts
 * @description Theme registry — scans themes directory, loads theme manifests,
 * and maintains the list of available themes (loaded and unloaded).
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
// ---------------------------------------------------------------------------
// ThemeRegistry
// ---------------------------------------------------------------------------
export class ThemeRegistry {
    /** Fully loaded themes by id. */
    themes = new Map();
    /** Discovered manifests (may include themes not yet loaded). */
    manifests = new Map();
    /** Currently active theme id. */
    activeThemeId = null;
    // ---------------------------------------------------------------------------
    // Scanning
    // ---------------------------------------------------------------------------
    /**
     * Scan a themes directory for available theme packages.
     *
     * Theme packages must contain either:
     * - `volqan-theme.json` manifest file
     * - `package.json` with a `"volqanTheme"` key
     *
     * @param themesDir - Absolute path to the themes directory.
     */
    async scan(themesDir) {
        const absDir = resolve(themesDir);
        if (!existsSync(absDir)) {
            console.warn(`[theme-registry] Themes directory not found: ${absDir}`);
            return [];
        }
        let entries;
        try {
            const dirents = await readdir(absDir, { withFileTypes: true });
            entries = dirents
                .filter((d) => d.isDirectory() || d.isSymbolicLink())
                .map((d) => d.name);
        }
        catch (err) {
            console.error(`[theme-registry] Failed to scan "${absDir}":`, err);
            return [];
        }
        const discovered = [];
        for (const entry of entries) {
            const dir = join(absDir, entry);
            const manifest = await this.readManifest(dir);
            if (manifest) {
                this.manifests.set(manifest.id, manifest);
                discovered.push(manifest);
            }
        }
        console.info(`[theme-registry] Scanned ${absDir}: found ${discovered.length} theme(s)`);
        return discovered;
    }
    // ---------------------------------------------------------------------------
    // Registration
    // ---------------------------------------------------------------------------
    /**
     * Register a loaded VolqanTheme.
     *
     * @param theme - The theme object to register.
     */
    register(theme) {
        this.themes.set(theme.id, theme);
        console.debug(`[theme-registry] Registered theme: ${theme.id}@${theme.version}`);
    }
    /**
     * Unregister a theme.
     *
     * @param themeId - The id of the theme to remove.
     */
    unregister(themeId) {
        this.themes.delete(themeId);
        if (this.activeThemeId === themeId) {
            this.activeThemeId = null;
        }
    }
    // ---------------------------------------------------------------------------
    // Active theme management
    // ---------------------------------------------------------------------------
    /**
     * Set the active theme.
     *
     * @param themeId - The id of the theme to activate.
     * @throws {Error} if the theme is not registered.
     */
    setActive(themeId) {
        if (!this.themes.has(themeId)) {
            throw new Error(`[theme-registry] Cannot activate theme "${themeId}" — it is not registered.`);
        }
        this.activeThemeId = themeId;
        console.info(`[theme-registry] Activated theme: ${themeId}`);
    }
    /**
     * Get the currently active VolqanTheme object.
     * Returns null if no theme is active.
     */
    getActive() {
        if (!this.activeThemeId)
            return null;
        return this.themes.get(this.activeThemeId) ?? null;
    }
    /**
     * Get the active theme id.
     */
    getActiveId() {
        return this.activeThemeId;
    }
    // ---------------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------------
    /** Check whether a theme is registered. */
    has(themeId) {
        return this.themes.has(themeId);
    }
    /** Get a registered theme by id. */
    get(themeId) {
        return this.themes.get(themeId);
    }
    /** Get all registered themes. */
    all() {
        return Array.from(this.themes.values());
    }
    /** Get all discovered manifests (including unloaded themes). */
    getManifests() {
        return Array.from(this.manifests.values());
    }
    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------
    async readManifest(dir) {
        // 1. Try volqan-theme.json
        const volqanManifestPath = join(dir, 'volqan-theme.json');
        if (existsSync(volqanManifestPath)) {
            try {
                const raw = JSON.parse(await readFile(volqanManifestPath, 'utf-8'));
                const id = raw['id'];
                const name = raw['name'] ?? id ?? 'Unknown Theme';
                const main = raw['main'] ?? 'index.js';
                if (id) {
                    return { id, name, directory: dir, entryPath: join(dir, main), raw };
                }
            }
            catch {
                // ignore
            }
        }
        // 2. Try package.json with "volqanTheme" key
        const pkgPath = join(dir, 'package.json');
        if (existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
                if (pkg['volqanTheme'] && typeof pkg['volqanTheme'] === 'object') {
                    const thm = pkg['volqanTheme'];
                    const id = (thm['id'] ?? pkg['name']);
                    const name = thm['name'] ?? 'Unknown Theme';
                    const main = pkg['main'] ?? 'index.js';
                    if (id) {
                        return {
                            id,
                            name,
                            directory: dir,
                            entryPath: join(dir, main),
                            raw: { ...thm, version: pkg['version'] },
                        };
                    }
                }
            }
            catch {
                // ignore
            }
        }
        return null;
    }
}
// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------
export const themeRegistry = new ThemeRegistry();
//# sourceMappingURL=registry.js.map