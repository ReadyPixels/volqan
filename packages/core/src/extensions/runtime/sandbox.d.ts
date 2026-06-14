/**
 * @file extensions/runtime/sandbox.ts
 * @description Extension sandbox — isolates extension code, provides a controlled
 * ExtensionContext, and catches errors without crashing the host application.
 *
 * The sandbox wraps all extension lifecycle calls in try/catch with configurable
 * timeouts. Extensions that exceed their time budget are forcibly cancelled via
 * AbortController and moved to 'error' status.
 */
import type { ExtensionContext } from '../types.js';
/** Result of a sandboxed execution. */
export interface SandboxResult<T = void> {
    success: boolean;
    value?: T;
    error?: SandboxError;
    durationMs: number;
}
/** Structured error produced by the sandbox when an extension fails. */
export declare class SandboxError extends Error {
    readonly extensionId: string;
    readonly phase: string;
    readonly cause?: unknown | undefined;
    readonly name = "SandboxError";
    constructor(message: string, extensionId: string, phase: string, cause?: unknown | undefined);
}
export interface SandboxOptions {
    /**
     * Maximum execution time in milliseconds before the hook is considered timed out.
     * @default 10000
     */
    timeoutMs?: number;
    /**
     * Whether to swallow errors (return success: false) or re-throw them.
     * Set to false in test mode to surface errors immediately.
     * @default true
     */
    swallowErrors?: boolean;
    /**
     * Optional error reporter invoked when a sandboxed execution fails.
     */
    onError?: (error: SandboxError) => void;
}
/**
 * ExtensionSandbox
 *
 * Wraps individual lifecycle hook invocations with:
 * - Timeout enforcement via AbortSignal + Promise.race
 * - Structured error capture
 * - Execution duration tracking
 * - Error reporting callback
 *
 * @example
 * ```ts
 * const sandbox = new ExtensionSandbox('acme/blog', { timeoutMs: 5000 });
 * const result = await sandbox.run('onBoot', async () => {
 *   await ext.onBoot?.(ctx);
 * });
 * if (!result.success) {
 *   console.error(result.error?.message);
 * }
 * ```
 */
export declare class ExtensionSandbox {
    private readonly extensionId;
    private readonly options;
    constructor(extensionId: string, options?: SandboxOptions);
    /**
     * Run an async function inside the sandbox.
     *
     * @param phase - Name of the lifecycle phase (for error reporting).
     * @param fn - The async function to execute.
     * @returns SandboxResult containing success/failure and timing data.
     */
    run<T = void>(phase: string, fn: () => Promise<T>): Promise<SandboxResult<T>>;
    /**
     * Run a lifecycle hook function (void return) safely.
     * Convenience wrapper around `run` for hooks that don't return a value.
     */
    runHook(phase: string, fn: ((ctx: ExtensionContext) => Promise<void>) | undefined, ctx: ExtensionContext): Promise<SandboxResult<void>>;
    private withTimeout;
    private wrapError;
}
/**
 * Create a sandbox for a specific extension.
 * Convenience function wrapping the ExtensionSandbox constructor.
 */
export declare function createSandbox(extensionId: string, options?: SandboxOptions): ExtensionSandbox;
//# sourceMappingURL=sandbox.d.ts.map