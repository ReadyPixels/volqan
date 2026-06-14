/**
 * @file extensions/loader.ts
 * @description Volqan Extension Engine — loads, validates, sandboxes, and
 * lifecycle-manages extension packages at runtime.
 */
import type { VolqanExtension, MenuItem, AdminPage, Widget, SettingField, RouteDefinition, ContentHook, Migration } from './types.js';
/** Current lifecycle state of a loaded extension. */
export type ExtensionStatus = 'installed' | 'enabled' | 'disabled' | 'error' | 'booting';
/** Internal record stored for each loaded extension. */
export interface LoadedExtension {
    /** The resolved extension definition. */
    extension: VolqanExtension;
    /** Current lifecycle status. */
    status: ExtensionStatus;
    /** Timestamp of initial installation (ISO 8601). */
    installedAt: string;
    /** Timestamp of last status change (ISO 8601). */
    updatedAt: string;
    /** Last error message if status === 'error'. */
    lastError?: string;
}
/**
 * Validate that an extension object conforms to the VolqanExtension interface.
 * Throws a descriptive error for each validation failure.
 *
 * @param ext - The candidate extension object.
 * @throws {ExtensionValidationError} when the object fails validation.
 */
export declare function validateExtension(ext: unknown): asserts ext is VolqanExtension;
/** Thrown when an extension fails the static validation check. */
export declare class ExtensionValidationError extends Error {
    readonly name = "ExtensionValidationError";
    constructor(message: string);
}
/** Thrown when an extension lifecycle operation fails. */
export declare class ExtensionLifecycleError extends Error {
    readonly extensionId: string;
    readonly name = "ExtensionLifecycleError";
    constructor(message: string, extensionId: string);
}
/**
 * Set the global installation ID used for extension contexts.
 * Must be called before any extension is booted.
 */
export declare function setInstallationId(id: string): void;
/**
 * Load and register an extension with the Volqan engine.
 *
 * Steps:
 * 1. Validate the extension shape.
 * 2. Check for duplicate registration.
 * 3. Run the `onInstall` lifecycle hook.
 * 4. Store the extension in the registry with status "installed".
 *
 * @param ext - The extension object to load.
 * @returns The registered LoadedExtension record.
 */
export declare function loadExtension(ext: unknown): Promise<LoadedExtension>;
/**
 * Enable a previously loaded extension.
 *
 * Calls `onEnable` and transitions the extension to "enabled" status.
 *
 * @param extensionId - The extension id (e.g. "acme/blog").
 */
export declare function enableExtension(extensionId: string): Promise<void>;
/**
 * Disable a running extension.
 *
 * Calls `onDisable` and transitions the extension to "disabled" status.
 *
 * @param extensionId - The extension id.
 */
export declare function disableExtension(extensionId: string): Promise<void>;
/**
 * Boot an enabled extension on application startup.
 *
 * Called automatically for every enabled extension during the Volqan boot
 * sequence. Registers API routes, content hooks, and other runtime services.
 *
 * @param extensionId - The extension id.
 */
export declare function bootExtension(extensionId: string): Promise<void>;
/**
 * Unload (uninstall) an extension.
 *
 * Calls `onUninstall`, then removes the extension from the registry.
 *
 * @param extensionId - The extension id.
 */
export declare function unloadExtension(extensionId: string): Promise<void>;
/**
 * Retrieve all installed extensions.
 *
 * @returns An array of all LoadedExtension records in the registry.
 */
export declare function getInstalledExtensions(): LoadedExtension[];
/**
 * Retrieve a single extension record by id.
 *
 * @param extensionId - The extension id.
 * @returns The LoadedExtension record or undefined if not found.
 */
export declare function getExtension(extensionId: string): LoadedExtension | undefined;
/**
 * Collect all adminMenuItems from enabled extensions.
 *
 * @returns A merged flat array of MenuItem objects.
 */
export declare function collectMenuItems(): MenuItem[];
/**
 * Collect all adminPages from enabled extensions.
 */
export declare function collectAdminPages(): AdminPage[];
/**
 * Collect all adminWidgets from enabled extensions.
 */
export declare function collectWidgets(): Widget[];
/**
 * Collect all adminSettings from enabled extensions.
 */
export declare function collectSettings(): Array<{
    extensionId: string;
    fields: SettingField[];
}>;
/**
 * Collect all apiRoutes from enabled extensions.
 */
export declare function collectApiRoutes(): Array<{
    extensionId: string;
    routes: RouteDefinition[];
}>;
/**
 * Collect all contentHooks from enabled extensions.
 */
export declare function collectContentHooks(): ContentHook[];
/**
 * Collect all pending databaseMigrations from enabled extensions.
 */
export declare function collectMigrations(): Array<{
    extensionId: string;
    migrations: Migration[];
}>;
//# sourceMappingURL=loader.d.ts.map