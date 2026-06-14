/**
 * @file extensions/runtime/lifecycle.ts
 * @description Extension lifecycle manager.
 *
 * Exposes install(), uninstall(), enable(), disable(), boot() operations.
 * Each operation:
 * 1. Calls the respective hook on the extension via the sandbox.
 * 2. Updates the in-memory Extension record status.
 * 3. Optionally persists the status change to the database (via injected adapter).
 *
 * All operations are guarded by the ExtensionSandbox to prevent extension
 * errors from crashing the host application.
 */
import { createExtensionContext } from './context-factory.js';
import { createSandbox } from './sandbox.js';
export class ExtensionLifecycleManager {
    installationId;
    sandboxOptions;
    persistence;
    onError;
    constructor(options) {
        this.installationId = options.installationId;
        this.sandboxOptions = options.sandbox ?? { timeoutMs: 10_000, swallowErrors: true };
        this.persistence = options.persistence;
        this.onError =
            options.onError ??
                ((id, phase, err) => console.error(`[lifecycle] Extension "${id}" failed in "${phase}":`, err));
    }
    // ---------------------------------------------------------------------------
    // install
    // ---------------------------------------------------------------------------
    /**
     * Install an extension.
     *
     * Calls `onInstall` hook and transitions status to 'installed'.
     * On failure the status is set to 'error'.
     */
    async install(record) {
        const { extension } = record;
        const ctx = this.makeContext(extension.id);
        const sandbox = createSandbox(extension.id, this.sandboxOptions);
        const result = await sandbox.runHook('onInstall', extension.onInstall, ctx);
        if (!result.success && result.error) {
            this.setStatus(record, 'error', result.error.message);
            this.onError(extension.id, 'onInstall', result.error);
            return;
        }
        this.setStatus(record, 'installed');
        await this.persistence?.onInstall(extension.id, extension.version);
        console.info(`[lifecycle] Installed "${extension.id}@${extension.version}" in ${result.durationMs}ms`);
    }
    // ---------------------------------------------------------------------------
    // uninstall
    // ---------------------------------------------------------------------------
    /**
     * Uninstall an extension.
     *
     * Calls `onUninstall` hook. Errors during uninstall are logged but do not
     * prevent the record from being removed.
     */
    async uninstall(record) {
        const { extension } = record;
        const ctx = this.makeContext(extension.id);
        const sandbox = createSandbox(extension.id, this.sandboxOptions);
        const result = await sandbox.runHook('onUninstall', extension.onUninstall, ctx);
        if (!result.success && result.error) {
            this.onError(extension.id, 'onUninstall', result.error);
        }
        await this.persistence?.onUninstall(extension.id);
        console.info(`[lifecycle] Uninstalled "${extension.id}"`);
    }
    // ---------------------------------------------------------------------------
    // enable
    // ---------------------------------------------------------------------------
    /**
     * Enable an installed or disabled extension.
     *
     * Calls `onEnable` hook and transitions status to 'enabled'.
     */
    async enable(record) {
        if (record.status === 'enabled') {
            console.warn(`[lifecycle] Extension "${record.extension.id}" is already enabled.`);
            return;
        }
        const { extension } = record;
        const ctx = this.makeContext(extension.id);
        const sandbox = createSandbox(extension.id, this.sandboxOptions);
        const result = await sandbox.runHook('onEnable', extension.onEnable, ctx);
        if (!result.success && result.error) {
            this.setStatus(record, 'error', result.error.message);
            this.onError(extension.id, 'onEnable', result.error);
            await this.persistence?.onStatusChange(extension.id, 'error');
            return;
        }
        this.setStatus(record, 'enabled');
        await this.persistence?.onStatusChange(extension.id, 'enabled');
        console.info(`[lifecycle] Enabled "${extension.id}" in ${result.durationMs}ms`);
    }
    // ---------------------------------------------------------------------------
    // disable
    // ---------------------------------------------------------------------------
    /**
     * Disable an enabled extension.
     *
     * Calls `onDisable` hook and transitions status to 'disabled'.
     */
    async disable(record) {
        if (record.status === 'disabled') {
            console.warn(`[lifecycle] Extension "${record.extension.id}" is already disabled.`);
            return;
        }
        const { extension } = record;
        const ctx = this.makeContext(extension.id);
        const sandbox = createSandbox(extension.id, this.sandboxOptions);
        const result = await sandbox.runHook('onDisable', extension.onDisable, ctx);
        if (!result.success && result.error) {
            this.setStatus(record, 'error', result.error.message);
            this.onError(extension.id, 'onDisable', result.error);
            await this.persistence?.onStatusChange(extension.id, 'error');
            return;
        }
        this.setStatus(record, 'disabled');
        await this.persistence?.onStatusChange(extension.id, 'disabled');
        console.info(`[lifecycle] Disabled "${extension.id}" in ${result.durationMs}ms`);
    }
    // ---------------------------------------------------------------------------
    // boot
    // ---------------------------------------------------------------------------
    /**
     * Boot an enabled extension.
     *
     * Calls `onBoot` hook. After booting, the extension's registered routes,
     * menu items, and hooks are available through the returned context.
     *
     * @returns The ExtendedExtensionContext populated during boot.
     */
    async boot(record) {
        if (record.status !== 'enabled') {
            throw new Error(`Cannot boot "${record.extension.id}" — status is "${record.status}". Must be "enabled".`);
        }
        const { extension } = record;
        const ctx = this.makeContext(extension.id);
        const sandbox = createSandbox(extension.id, this.sandboxOptions);
        record.status = 'booting';
        const result = await sandbox.runHook('onBoot', extension.onBoot, ctx);
        if (!result.success && result.error) {
            this.setStatus(record, 'error', result.error.message);
            this.onError(extension.id, 'onBoot', result.error);
            await this.persistence?.onStatusChange(extension.id, 'error');
            return null;
        }
        this.setStatus(record, 'enabled');
        console.info(`[lifecycle] Booted "${extension.id}" in ${result.durationMs}ms`);
        return ctx;
    }
    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------
    makeContext(extensionId) {
        return createExtensionContext(extensionId, this.installationId);
    }
    setStatus(record, status, error) {
        record.status = status;
        record.updatedAt = new Date().toISOString();
        if (error) {
            record.lastError = error;
        }
        else {
            delete record.lastError;
        }
    }
}
//# sourceMappingURL=lifecycle.js.map