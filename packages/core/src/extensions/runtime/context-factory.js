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
const globalEventBus = new Map();
function emitGlobal(event, payload) {
    const handlers = globalEventBus.get(event);
    if (!handlers)
        return;
    for (const handler of handlers) {
        void Promise.resolve(handler(payload)).catch((err) => {
            console.error(`[event-bus] Handler error for "${event}":`, err);
        });
    }
}
function onGlobal(event, handler) {
    let handlers = globalEventBus.get(event);
    if (!handlers) {
        handlers = new Set();
        globalEventBus.set(event, handlers);
    }
    handlers.add(handler);
}
function offGlobal(event, handler) {
    globalEventBus.get(event)?.delete(handler);
}
// ---------------------------------------------------------------------------
// Persistent config store (in-memory, swappable with DB adapter)
// ---------------------------------------------------------------------------
/** In-memory store. Replace with a DB-backed adapter in production. */
const configStores = new Map();
function getOrCreateStore(extensionId) {
    let store = configStores.get(extensionId);
    if (!store) {
        store = new Map();
        configStores.set(extensionId, store);
    }
    return store;
}
// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
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
export function createExtensionContext(extensionId, installationId) {
    const store = getOrCreateStore(extensionId);
    const prefix = `[${extensionId}]`;
    // Per-extension registries (populated during onBoot)
    const routes = [];
    const menuItems = [];
    const adminPages = [];
    const widgets = [];
    const contentHooks = [];
    return {
        // -----------------------------------------------------------------------
        // Base context
        // -----------------------------------------------------------------------
        installationId,
        config: {
            get(key) {
                return store.get(key);
            },
            async set(key, value) {
                store.set(key, value);
            },
            async delete(key) {
                store.delete(key);
            },
        },
        logger: {
            debug: (msg, meta) => console.debug(`${prefix} ${msg}`, meta ?? ''),
            info: (msg, meta) => console.info(`${prefix} ${msg}`, meta ?? ''),
            warn: (msg, meta) => console.warn(`${prefix} ${msg}`, meta ?? ''),
            error: (msg, error, meta) => console.error(`${prefix} ${msg}`, error ?? '', meta ?? ''),
        },
        events: {
            emit: (event, payload) => emitGlobal(`${extensionId}:${event}`, payload),
            on: (event, handler) => onGlobal(`${extensionId}:${event}`, handler),
            off: (event, handler) => offGlobal(`${extensionId}:${event}`, handler),
        },
        // -----------------------------------------------------------------------
        // Registration API
        // -----------------------------------------------------------------------
        registerRoute(route) {
            routes.push(route);
            console.debug(`${prefix} Registered API route: ${route.method} ${route.path}`);
        },
        registerMenuItem(item) {
            menuItems.push(item);
            console.debug(`${prefix} Registered menu item: ${item.label}`);
        },
        registerAdminPage(page) {
            adminPages.push(page);
            console.debug(`${prefix} Registered admin page: ${page.path}`);
        },
        registerWidget(widget) {
            widgets.push(widget);
            console.debug(`${prefix} Registered widget: ${widget.id}`);
        },
        registerContentHook(hook) {
            contentHooks.push(hook);
            console.debug(`${prefix} Registered content hook: ${hook.model}:${hook.event}`);
        },
        // -----------------------------------------------------------------------
        // Getters
        // -----------------------------------------------------------------------
        getRoutes: () => [...routes],
        getMenuItems: () => [...menuItems],
        getAdminPages: () => [...adminPages],
        getWidgets: () => [...widgets],
        getContentHooks: () => [...contentHooks],
    };
}
// ---------------------------------------------------------------------------
// Config store management
// ---------------------------------------------------------------------------
/**
 * Clear all config data for a given extension.
 * Called during uninstall to clean up persisted settings.
 */
export function clearExtensionConfig(extensionId) {
    configStores.delete(extensionId);
}
/**
 * Export all config for backup/migration purposes.
 */
export function exportAllConfigs() {
    const result = {};
    for (const [extId, store] of configStores.entries()) {
        result[extId] = Object.fromEntries(store.entries());
    }
    return result;
}
/**
 * Clear the global event bus (useful in tests).
 */
export function clearEventBus() {
    globalEventBus.clear();
}
//# sourceMappingURL=context-factory.js.map