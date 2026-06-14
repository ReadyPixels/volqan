/**
 * @file extensions/runtime/context-factory.ts
 * @description Creates an ExtensionContext for each extension with:
 * - Database access (stubbed for framework-level; real implementation injected by host)
 * - API route registration
 * - Admin UI registration
 * - Settings access (persistent config store)
 * - Event emitter (cross-extension communication)
 *
 * The factory is designed to be called once per extension per lifecycle phase.
 * Each call returns a fresh, isolated context object.
 */
import type { ExtensionContext, MenuItem, AdminPage, Widget, RouteDefinition, ContentHook } from '../types.js';
/**
 * ExtendedExtensionContext
 *
 * Full context object with all capabilities. Extensions receive only the
 * base ExtensionContext interface, but the factory returns this richer type
 * for internal framework use.
 */
export interface ExtendedExtensionContext extends ExtensionContext {
    /** Register an API route under /api/extensions/{vendor}/{name} */
    registerRoute: (route: RouteDefinition) => void;
    /** Inject a navigation item into the admin sidebar. */
    registerMenuItem: (item: MenuItem) => void;
    /** Register a full admin page under /admin/* */
    registerAdminPage: (page: AdminPage) => void;
    /** Register a dashboard widget. */
    registerWidget: (widget: Widget) => void;
    /** Register a content lifecycle hook. */
    registerContentHook: (hook: ContentHook) => void;
    /** Retrieve all registered routes from this extension. */
    getRoutes: () => RouteDefinition[];
    /** Retrieve all registered menu items from this extension. */
    getMenuItems: () => MenuItem[];
    /** Retrieve all registered admin pages from this extension. */
    getAdminPages: () => AdminPage[];
    /** Retrieve all registered widgets from this extension. */
    getWidgets: () => Widget[];
    /** Retrieve all registered content hooks from this extension. */
    getContentHooks: () => ContentHook[];
}
/**
 * createExtensionContext
 *
 * Factory function that produces a fully-featured ExtendedExtensionContext
 * for the given extension and installation.
 *
 * @param extensionId - The extension's unique id (e.g. "acme/blog").
 * @param installationId - The Volqan installation ID.
 * @returns A fresh ExtendedExtensionContext for this extension.
 */
export declare function createExtensionContext(extensionId: string, installationId: string): ExtendedExtensionContext;
/**
 * Clear all config data for a given extension.
 * Called during uninstall to clean up persisted settings.
 */
export declare function clearExtensionConfig(extensionId: string): void;
/**
 * Export all config for backup/migration purposes.
 */
export declare function exportAllConfigs(): Record<string, Record<string, unknown>>;
/**
 * Clear the global event bus (useful in tests).
 */
export declare function clearEventBus(): void;
//# sourceMappingURL=context-factory.d.ts.map