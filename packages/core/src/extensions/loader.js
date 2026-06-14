/**
 * @file extensions/loader.ts
 * @description Volqan Extension Engine — loads, validates, sandboxes, and
 * lifecycle-manages extension packages at runtime.
 */
// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
/**
 * Validate that an extension object conforms to the VolqanExtension interface.
 * Throws a descriptive error for each validation failure.
 *
 * @param ext - The candidate extension object.
 * @throws {ExtensionValidationError} when the object fails validation.
 */
export function validateExtension(ext) {
    if (!ext || typeof ext !== 'object') {
        throw new ExtensionValidationError('Extension must be a non-null object.');
    }
    const candidate = ext;
    // Required string fields
    for (const field of ['id', 'version', 'name', 'description']) {
        if (typeof candidate[field] !== 'string' || !candidate[field].trim()) {
            throw new ExtensionValidationError(`Extension field "${field}" must be a non-empty string.`);
        }
    }
    // id format: "vendor/extension-name"
    const id = candidate['id'];
    if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(id)) {
        throw new ExtensionValidationError(`Extension id "${id}" must follow the format "vendor/extension-name" (lowercase alphanumeric and hyphens).`);
    }
    // version: semver
    const version = candidate['version'];
    if (!/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(version)) {
        throw new ExtensionValidationError(`Extension version "${version}" must be a valid semver string (e.g. "1.2.3").`);
    }
    // author
    if (!candidate['author'] ||
        typeof candidate['author'] !== 'object' ||
        typeof candidate['author']['name'] !== 'string') {
        throw new ExtensionValidationError('Extension "author" must be an object with at least a "name" string property.');
    }
    // Optional lifecycle hooks must be functions if present
    for (const hook of [
        'onInstall',
        'onUninstall',
        'onEnable',
        'onDisable',
        'onBoot',
    ]) {
        if (candidate[hook] !== undefined && typeof candidate[hook] !== 'function') {
            throw new ExtensionValidationError(`Extension lifecycle hook "${hook}" must be a function when defined.`);
        }
    }
    // Optional array fields
    const arrayFields = [
        'adminMenuItems',
        'adminPages',
        'adminWidgets',
        'adminSettings',
        'apiRoutes',
        'contentHooks',
        'databaseMigrations',
    ];
    for (const field of arrayFields) {
        if (candidate[field] !== undefined && !Array.isArray(candidate[field])) {
            throw new ExtensionValidationError(`Extension field "${field}" must be an array when defined.`);
        }
    }
}
/** Thrown when an extension fails the static validation check. */
export class ExtensionValidationError extends Error {
    name = 'ExtensionValidationError';
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ExtensionValidationError.prototype);
    }
}
/** Thrown when an extension lifecycle operation fails. */
export class ExtensionLifecycleError extends Error {
    extensionId;
    name = 'ExtensionLifecycleError';
    constructor(message, extensionId) {
        super(message);
        this.extensionId = extensionId;
        Object.setPrototypeOf(this, ExtensionLifecycleError.prototype);
    }
}
// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------
/**
 * Create a sandboxed ExtensionContext for the given extension.
 * Each extension receives its own isolated config and logger namespace.
 */
function createExtensionContext(extensionId, installationId) {
    const configStore = new Map();
    const eventHandlers = new Map();
    const prefix = `[${extensionId}]`;
    return {
        installationId,
        config: {
            get(key) {
                return configStore.get(key);
            },
            async set(key, value) {
                configStore.set(key, value);
            },
            async delete(key) {
                configStore.delete(key);
            },
        },
        logger: {
            debug: (msg, meta) => console.debug(`${prefix} ${msg}`, meta ?? ''),
            info: (msg, meta) => console.info(`${prefix} ${msg}`, meta ?? ''),
            warn: (msg, meta) => console.warn(`${prefix} ${msg}`, meta ?? ''),
            error: (msg, error, meta) => console.error(`${prefix} ${msg}`, error ?? '', meta ?? ''),
        },
        events: {
            emit(event, payload) {
                const handlers = eventHandlers.get(event) ?? [];
                for (const handler of handlers) {
                    void Promise.resolve(handler(payload)).catch((err) => {
                        console.error(`${prefix} Event handler error for "${event}":`, err);
                    });
                }
            },
            on(event, handler) {
                const existing = eventHandlers.get(event) ?? [];
                eventHandlers.set(event, [...existing, handler]);
            },
            off(event, handler) {
                const existing = eventHandlers.get(event) ?? [];
                eventHandlers.set(event, existing.filter((h) => h !== handler));
            },
        },
    };
}
// ---------------------------------------------------------------------------
// Extension registry
// ---------------------------------------------------------------------------
/** In-memory registry of all loaded extensions. */
const registry = new Map();
/** Shared installation ID (set once at framework boot). */
let _installationId = 'local';
/**
 * Set the global installation ID used for extension contexts.
 * Must be called before any extension is booted.
 */
export function setInstallationId(id) {
    _installationId = id;
}
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
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
export async function loadExtension(ext) {
    validateExtension(ext);
    if (registry.has(ext.id)) {
        throw new ExtensionLifecycleError(`Extension "${ext.id}" is already registered. Call unloadExtension() first to replace it.`, ext.id);
    }
    const ctx = createExtensionContext(ext.id, _installationId);
    try {
        await ext.onInstall?.(ctx);
    }
    catch (err) {
        throw new ExtensionLifecycleError(`Extension "${ext.id}" onInstall hook failed: ${String(err)}`, ext.id);
    }
    const record = {
        extension: ext,
        status: 'installed',
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    registry.set(ext.id, record);
    console.info(`[volqan/loader] Extension loaded: ${ext.id}@${ext.version}`);
    return record;
}
/**
 * Enable a previously loaded extension.
 *
 * Calls `onEnable` and transitions the extension to "enabled" status.
 *
 * @param extensionId - The extension id (e.g. "acme/blog").
 */
export async function enableExtension(extensionId) {
    const record = requireRecord(extensionId);
    if (record.status === 'enabled') {
        console.warn(`[volqan/loader] Extension "${extensionId}" is already enabled.`);
        return;
    }
    const ctx = createExtensionContext(extensionId, _installationId);
    try {
        await record.extension.onEnable?.(ctx);
    }
    catch (err) {
        setError(record, String(err));
        throw new ExtensionLifecycleError(`Extension "${extensionId}" onEnable hook failed: ${String(err)}`, extensionId);
    }
    record.status = 'enabled';
    record.updatedAt = new Date().toISOString();
    delete record.lastError;
    console.info(`[volqan/loader] Extension enabled: ${extensionId}`);
}
/**
 * Disable a running extension.
 *
 * Calls `onDisable` and transitions the extension to "disabled" status.
 *
 * @param extensionId - The extension id.
 */
export async function disableExtension(extensionId) {
    const record = requireRecord(extensionId);
    if (record.status === 'disabled') {
        console.warn(`[volqan/loader] Extension "${extensionId}" is already disabled.`);
        return;
    }
    const ctx = createExtensionContext(extensionId, _installationId);
    try {
        await record.extension.onDisable?.(ctx);
    }
    catch (err) {
        setError(record, String(err));
        throw new ExtensionLifecycleError(`Extension "${extensionId}" onDisable hook failed: ${String(err)}`, extensionId);
    }
    record.status = 'disabled';
    record.updatedAt = new Date().toISOString();
    delete record.lastError;
    console.info(`[volqan/loader] Extension disabled: ${extensionId}`);
}
/**
 * Boot an enabled extension on application startup.
 *
 * Called automatically for every enabled extension during the Volqan boot
 * sequence. Registers API routes, content hooks, and other runtime services.
 *
 * @param extensionId - The extension id.
 */
export async function bootExtension(extensionId) {
    const record = requireRecord(extensionId);
    if (record.status !== 'enabled') {
        throw new ExtensionLifecycleError(`Cannot boot extension "${extensionId}" — current status is "${record.status}". Only enabled extensions can be booted.`, extensionId);
    }
    record.status = 'booting';
    const ctx = createExtensionContext(extensionId, _installationId);
    try {
        await record.extension.onBoot?.(ctx);
    }
    catch (err) {
        setError(record, String(err));
        throw new ExtensionLifecycleError(`Extension "${extensionId}" onBoot hook failed: ${String(err)}`, extensionId);
    }
    // Re-enable after successful boot (booting is a transient state)
    record.status = 'enabled';
    record.updatedAt = new Date().toISOString();
    delete record.lastError;
    console.info(`[volqan/loader] Extension booted: ${extensionId}`);
}
/**
 * Unload (uninstall) an extension.
 *
 * Calls `onUninstall`, then removes the extension from the registry.
 *
 * @param extensionId - The extension id.
 */
export async function unloadExtension(extensionId) {
    const record = requireRecord(extensionId);
    const ctx = createExtensionContext(extensionId, _installationId);
    try {
        await record.extension.onUninstall?.(ctx);
    }
    catch (err) {
        // Log but don't prevent removal
        console.error(`[volqan/loader] Extension "${extensionId}" onUninstall hook failed: ${String(err)}`);
    }
    registry.delete(extensionId);
    console.info(`[volqan/loader] Extension unloaded: ${extensionId}`);
}
/**
 * Retrieve all installed extensions.
 *
 * @returns An array of all LoadedExtension records in the registry.
 */
export function getInstalledExtensions() {
    return Array.from(registry.values());
}
/**
 * Retrieve a single extension record by id.
 *
 * @param extensionId - The extension id.
 * @returns The LoadedExtension record or undefined if not found.
 */
export function getExtension(extensionId) {
    return registry.get(extensionId);
}
/**
 * Collect all adminMenuItems from enabled extensions.
 *
 * @returns A merged flat array of MenuItem objects.
 */
export function collectMenuItems() {
    const items = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.adminMenuItems) {
            items.push(...extension.adminMenuItems);
        }
    }
    return items;
}
/**
 * Collect all adminPages from enabled extensions.
 */
export function collectAdminPages() {
    const pages = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.adminPages) {
            pages.push(...extension.adminPages);
        }
    }
    return pages;
}
/**
 * Collect all adminWidgets from enabled extensions.
 */
export function collectWidgets() {
    const widgets = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.adminWidgets) {
            widgets.push(...extension.adminWidgets);
        }
    }
    return widgets;
}
/**
 * Collect all adminSettings from enabled extensions.
 */
export function collectSettings() {
    const result = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.adminSettings?.length) {
            result.push({
                extensionId: extension.id,
                fields: extension.adminSettings,
            });
        }
    }
    return result;
}
/**
 * Collect all apiRoutes from enabled extensions.
 */
export function collectApiRoutes() {
    const result = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.apiRoutes?.length) {
            result.push({ extensionId: extension.id, routes: extension.apiRoutes });
        }
    }
    return result;
}
/**
 * Collect all contentHooks from enabled extensions.
 */
export function collectContentHooks() {
    const hooks = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.contentHooks) {
            hooks.push(...extension.contentHooks);
        }
    }
    return hooks;
}
/**
 * Collect all pending databaseMigrations from enabled extensions.
 */
export function collectMigrations() {
    const result = [];
    for (const { extension, status } of registry.values()) {
        if (status === 'enabled' && extension.databaseMigrations?.length) {
            result.push({
                extensionId: extension.id,
                migrations: extension.databaseMigrations,
            });
        }
    }
    return result;
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function requireRecord(extensionId) {
    const record = registry.get(extensionId);
    if (!record) {
        throw new ExtensionLifecycleError(`Extension "${extensionId}" is not registered. Load it first with loadExtension().`, extensionId);
    }
    return record;
}
function setError(record, message) {
    record.status = 'error';
    record.lastError = message;
    record.updatedAt = new Date().toISOString();
}
//# sourceMappingURL=loader.js.map