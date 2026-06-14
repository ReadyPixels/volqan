/**
 * @file extensions/runtime/registry.ts
 * @description Extension registry — scans extensions directory, loads manifests,
 * and maintains an in-memory registry of available/active extensions.
 *
 * The registry is the single source of truth for all extension state at runtime.
 * It wraps the lower-level loader and provides a clean read API.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
// ---------------------------------------------------------------------------
// ExtensionRegistry
// ---------------------------------------------------------------------------
export class ExtensionRegistry {
    /** In-memory map of loaded extensions by id. */
    loaded = new Map();
    /** Discovered but not yet loaded extension manifests. */
    manifests = new Map();
    // ---------------------------------------------------------------------------
    // Scanning
    // ---------------------------------------------------------------------------
    /**
     * Scan an extensions directory for available extension packages.
     *
     * Looks for directories containing either:
     * - A `volqan-extension.json` manifest file
     * - A `package.json` with a `"volqan"` key
     *
     * @param extensionsDir - Absolute path to the directory to scan.
     * @returns Array of discovered manifests.
     */
    async scan(extensionsDir) {
        const absDir = resolve(extensionsDir);
        if (!existsSync(absDir)) {
            console.warn(`[registry] Extensions directory not found: ${absDir}`);
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
            console.error(`[registry] Failed to scan extensions directory "${absDir}":`, err);
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
        console.info(`[registry] Scanned ${absDir}: found ${discovered.length} extension(s)`);
        return discovered;
    }
    // ---------------------------------------------------------------------------
    // Registration
    // ---------------------------------------------------------------------------
    /**
     * Register a loaded extension record in the registry.
     *
     * @param record - The LoadedExtension record to register.
     */
    register(record) {
        this.loaded.set(record.extension.id, record);
    }
    /**
     * Remove a loaded extension from the registry.
     *
     * @param extensionId - The extension id to remove.
     */
    unregister(extensionId) {
        this.loaded.delete(extensionId);
    }
    // ---------------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------------
    /** Check whether an extension is currently registered. */
    has(extensionId) {
        return this.loaded.has(extensionId);
    }
    /** Get a loaded extension by id. */
    get(extensionId) {
        return this.loaded.get(extensionId);
    }
    /** Get all registered loaded extensions. */
    all() {
        return Array.from(this.loaded.values());
    }
    /** Get all extensions with a given status. */
    byStatus(status) {
        return this.all().filter((r) => r.status === status);
    }
    /** Get all enabled extensions. */
    enabled() {
        return this.byStatus('enabled');
    }
    /** Get all discovered but not-yet-loaded manifests. */
    getManifests() {
        return Array.from(this.manifests.values());
    }
    /** Get a manifest by extension id. */
    getManifest(extensionId) {
        return this.manifests.get(extensionId);
    }
    // ---------------------------------------------------------------------------
    // Aggregated contribution accessors
    // ---------------------------------------------------------------------------
    /** All admin menu items contributed by enabled extensions. */
    menuItems() {
        return this.enabled().flatMap((r) => r.extension.adminMenuItems ?? []);
    }
    /** All admin pages contributed by enabled extensions. */
    adminPages() {
        return this.enabled().flatMap((r) => r.extension.adminPages ?? []);
    }
    /** All dashboard widgets contributed by enabled extensions. */
    widgets() {
        return this.enabled().flatMap((r) => r.extension.adminWidgets ?? []);
    }
    /** All API routes contributed by enabled extensions. */
    apiRoutes() {
        return this.enabled().flatMap((r) => (r.extension.apiRoutes ?? []).map((route) => ({
            extensionId: r.extension.id,
            route,
        })));
    }
    /** All content hooks contributed by enabled extensions. */
    contentHooks() {
        return this.enabled().flatMap((r) => r.extension.contentHooks ?? []);
    }
    /** All database migrations from enabled extensions. */
    migrations() {
        return this.enabled().flatMap((r) => (r.extension.databaseMigrations ?? []).map((m) => ({
            extensionId: r.extension.id,
            migration: m,
        })));
    }
    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------
    async readManifest(dir) {
        // 1. Try volqan-extension.json
        const volqanManifestPath = join(dir, 'volqan-extension.json');
        if (existsSync(volqanManifestPath)) {
            try {
                const raw = JSON.parse(await readFile(volqanManifestPath, 'utf-8'));
                const id = raw['id'];
                const main = raw['main'] ?? 'index.js';
                if (id && typeof id === 'string') {
                    return {
                        id,
                        directory: dir,
                        entryPath: join(dir, main),
                        raw,
                    };
                }
            }
            catch {
                // ignore parse errors
            }
        }
        // 2. Try package.json with "volqan" key
        const pkgPath = join(dir, 'package.json');
        if (existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
                if (pkg['volqan'] && typeof pkg['volqan'] === 'object') {
                    const ext = pkg['volqan'];
                    const id = (ext['id'] ?? pkg['name']);
                    const main = pkg['main'] ?? 'index.js';
                    if (id) {
                        return {
                            id,
                            directory: dir,
                            entryPath: join(dir, main),
                            raw: { ...ext, name: pkg['name'], version: pkg['version'] },
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
// Singleton registry
// ---------------------------------------------------------------------------
/** Global default registry instance. */
export const extensionRegistry = new ExtensionRegistry();
//# sourceMappingURL=registry.js.map