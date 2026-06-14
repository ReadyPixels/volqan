/**
 * @file extensions/runtime/registry.ts
 * @description Extension registry — scans extensions directory, loads manifests,
 * and maintains an in-memory registry of available/active extensions.
 *
 * The registry is the single source of truth for all extension state at runtime.
 * It wraps the lower-level loader and provides a clean read API.
 */
import type { LoadedExtension, ExtensionStatus } from '../loader.js';
/** A discovered but not-yet-loaded extension manifest. */
export interface ExtensionManifest {
    /** Extension ID resolved from the manifest (e.g. "acme/blog"). */
    id: string;
    /** Absolute path to the extension directory. */
    directory: string;
    /** Absolute path to the extension's main entry point. */
    entryPath: string;
    /** Raw manifest data read from volqan-extension.json or package.json */
    raw: Record<string, unknown>;
}
export declare class ExtensionRegistry {
    /** In-memory map of loaded extensions by id. */
    private readonly loaded;
    /** Discovered but not yet loaded extension manifests. */
    private readonly manifests;
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
    scan(extensionsDir: string): Promise<ExtensionManifest[]>;
    /**
     * Register a loaded extension record in the registry.
     *
     * @param record - The LoadedExtension record to register.
     */
    register(record: LoadedExtension): void;
    /**
     * Remove a loaded extension from the registry.
     *
     * @param extensionId - The extension id to remove.
     */
    unregister(extensionId: string): void;
    /** Check whether an extension is currently registered. */
    has(extensionId: string): boolean;
    /** Get a loaded extension by id. */
    get(extensionId: string): LoadedExtension | undefined;
    /** Get all registered loaded extensions. */
    all(): LoadedExtension[];
    /** Get all extensions with a given status. */
    byStatus(status: ExtensionStatus): LoadedExtension[];
    /** Get all enabled extensions. */
    enabled(): LoadedExtension[];
    /** Get all discovered but not-yet-loaded manifests. */
    getManifests(): ExtensionManifest[];
    /** Get a manifest by extension id. */
    getManifest(extensionId: string): ExtensionManifest | undefined;
    /** All admin menu items contributed by enabled extensions. */
    menuItems(): import("../types.js").MenuItem[];
    /** All admin pages contributed by enabled extensions. */
    adminPages(): import("../types.js").AdminPage[];
    /** All dashboard widgets contributed by enabled extensions. */
    widgets(): import("../types.js").Widget[];
    /** All API routes contributed by enabled extensions. */
    apiRoutes(): {
        extensionId: string;
        route: import("../types.js").RouteDefinition;
    }[];
    /** All content hooks contributed by enabled extensions. */
    contentHooks(): import("../types.js").ContentHook[];
    /** All database migrations from enabled extensions. */
    migrations(): {
        extensionId: string;
        migration: import("../types.js").Migration;
    }[];
    private readManifest;
}
/** Global default registry instance. */
export declare const extensionRegistry: ExtensionRegistry;
//# sourceMappingURL=registry.d.ts.map