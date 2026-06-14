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
import type { LoadedExtension, ExtensionStatus } from '../loader.js';
import { type ExtendedExtensionContext } from './context-factory.js';
import { type SandboxOptions } from './sandbox.js';
/**
 * LifecyclePersistenceAdapter
 *
 * Optional adapter that persists extension status changes to a database.
 * Implement this interface to store extension states across restarts.
 */
export interface LifecyclePersistenceAdapter {
    /** Persist a new extension record after installation. */
    onInstall(extensionId: string, version: string): Promise<void>;
    /** Remove an extension record after uninstallation. */
    onUninstall(extensionId: string): Promise<void>;
    /** Update the status of an extension. */
    onStatusChange(extensionId: string, status: ExtensionStatus): Promise<void>;
}
export interface LifecycleManagerOptions {
    installationId: string;
    sandbox?: SandboxOptions;
    persistence?: LifecyclePersistenceAdapter;
    onError?: (extensionId: string, phase: string, error: Error) => void;
}
export declare class ExtensionLifecycleManager {
    private readonly installationId;
    private readonly sandboxOptions;
    private readonly persistence?;
    private readonly onError;
    constructor(options: LifecycleManagerOptions);
    /**
     * Install an extension.
     *
     * Calls `onInstall` hook and transitions status to 'installed'.
     * On failure the status is set to 'error'.
     */
    install(record: LoadedExtension): Promise<void>;
    /**
     * Uninstall an extension.
     *
     * Calls `onUninstall` hook. Errors during uninstall are logged but do not
     * prevent the record from being removed.
     */
    uninstall(record: LoadedExtension): Promise<void>;
    /**
     * Enable an installed or disabled extension.
     *
     * Calls `onEnable` hook and transitions status to 'enabled'.
     */
    enable(record: LoadedExtension): Promise<void>;
    /**
     * Disable an enabled extension.
     *
     * Calls `onDisable` hook and transitions status to 'disabled'.
     */
    disable(record: LoadedExtension): Promise<void>;
    /**
     * Boot an enabled extension.
     *
     * Calls `onBoot` hook. After booting, the extension's registered routes,
     * menu items, and hooks are available through the returned context.
     *
     * @returns The ExtendedExtensionContext populated during boot.
     */
    boot(record: LoadedExtension): Promise<ExtendedExtensionContext | null>;
    private makeContext;
    private setStatus;
}
//# sourceMappingURL=lifecycle.d.ts.map