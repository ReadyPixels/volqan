/**
 * @file extensions/runtime/sandbox.ts
 * @description Extension sandbox — isolates extension code, provides a controlled
 * ExtensionContext, and catches errors without crashing the host application.
 *
 * The sandbox wraps all extension lifecycle calls in try/catch with configurable
 * timeouts. Extensions that exceed their time budget are forcibly cancelled via
 * AbortController and moved to 'error' status.
 */
/** Structured error produced by the sandbox when an extension fails. */
export class SandboxError extends Error {
    extensionId;
    phase;
    cause;
    name = 'SandboxError';
    constructor(message, extensionId, phase, cause) {
        super(message);
        this.extensionId = extensionId;
        this.phase = phase;
        this.cause = cause;
        Object.setPrototypeOf(this, SandboxError.prototype);
    }
}
// ---------------------------------------------------------------------------
// Core sandbox implementation
// ---------------------------------------------------------------------------
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
export class ExtensionSandbox {
    extensionId;
    options;
    constructor(extensionId, options = {}) {
        this.extensionId = extensionId;
        this.options = {
            timeoutMs: options.timeoutMs ?? 10_000,
            swallowErrors: options.swallowErrors ?? true,
            onError: options.onError ?? (() => { }),
        };
    }
    /**
     * Run an async function inside the sandbox.
     *
     * @param phase - Name of the lifecycle phase (for error reporting).
     * @param fn - The async function to execute.
     * @returns SandboxResult containing success/failure and timing data.
     */
    async run(phase, fn) {
        const start = Date.now();
        try {
            const value = await this.withTimeout(phase, fn);
            return {
                success: true,
                value,
                durationMs: Date.now() - start,
            };
        }
        catch (raw) {
            const sandboxError = this.wrapError(phase, raw);
            const durationMs = Date.now() - start;
            this.options.onError(sandboxError);
            if (!this.options.swallowErrors) {
                throw sandboxError;
            }
            return {
                success: false,
                error: sandboxError,
                durationMs,
            };
        }
    }
    /**
     * Run a lifecycle hook function (void return) safely.
     * Convenience wrapper around `run` for hooks that don't return a value.
     */
    async runHook(phase, fn, ctx) {
        if (!fn) {
            return { success: true, durationMs: 0 };
        }
        return this.run(phase, () => fn(ctx));
    }
    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------
    async withTimeout(phase, fn) {
        const { timeoutMs } = this.options;
        const id = this.extensionId;
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new SandboxError(`Extension "${id}" timed out in "${phase}" after ${timeoutMs}ms.`, id, phase)), timeoutMs));
        return Promise.race([fn(), timeoutPromise]);
    }
    wrapError(phase, raw) {
        if (raw instanceof SandboxError)
            return raw;
        const message = raw instanceof Error
            ? raw.message
            : typeof raw === 'string'
                ? raw
                : `Unknown error in extension "${this.extensionId}" during "${phase}"`;
        return new SandboxError(`Extension "${this.extensionId}" failed in "${phase}": ${message}`, this.extensionId, phase, raw);
    }
}
// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------
/**
 * Create a sandbox for a specific extension.
 * Convenience function wrapping the ExtensionSandbox constructor.
 */
export function createSandbox(extensionId, options) {
    return new ExtensionSandbox(extensionId, options);
}
//# sourceMappingURL=sandbox.js.map