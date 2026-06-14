/**
 * @file content/hooks.ts
 * @description Content lifecycle hook system for the Volqan CMS.
 *
 * Hooks allow extensions and application code to intercept content operations
 * at specific points in their lifecycle. They support both synchronous and
 * asynchronous handlers and are executed in registration order.
 *
 * @example
 * ```ts
 * const hooks = new HookRegistry();
 *
 * hooks.register('afterCreate', async ({ contentTypeSlug, entry }) => {
 *   if (contentTypeSlug === 'blog-post') {
 *     await notifySubscribers(entry);
 *   }
 * });
 * ```
 */
// ---------------------------------------------------------------------------
// HookRegistry
// ---------------------------------------------------------------------------
/**
 * Central registry for content lifecycle hooks.
 *
 * Thread safety: Node.js is single-threaded for JS execution, so concurrent
 * modification of the registry during `fire` is not a concern.
 */
export class HookRegistry {
    _hooks = [];
    /**
     * Registers a handler for a lifecycle hook.
     *
     * @param name The hook lifecycle event to listen for.
     * @param handler The async or sync callback to invoke.
     * @param priority Execution order (lower = earlier). Defaults to 100.
     * @returns A deregistration function — call it to remove the handler.
     */
    register(name, handler, priority = 100) {
        const registration = {
            name,
            handler: handler,
            priority,
        };
        this._hooks.push(registration);
        this._hooks.sort((a, b) => a.priority - b.priority);
        return () => {
            const idx = this._hooks.indexOf(registration);
            if (idx !== -1)
                this._hooks.splice(idx, 1);
        };
    }
    /**
     * Fires all handlers registered for the given hook name in priority order.
     *
     * For `before*` hooks the payload is threaded through each handler so that
     * one handler's mutations are visible to the next. The final payload is
     * returned from this method.
     *
     * For `after*` hooks the payload is passed to each handler but return values
     * are ignored, and the original payload is returned.
     *
     * @param name The hook to fire.
     * @param payload The initial payload object.
     * @returns The (potentially mutated) payload.
     */
    async fire(name, payload) {
        const handlers = this._hooks.filter((h) => h.name === name);
        if (handlers.length === 0)
            return payload;
        const isBefore = name.startsWith('before');
        let current = payload;
        for (const { handler } of handlers) {
            try {
                const result = await handler(current);
                if (isBefore && result !== undefined && result !== null) {
                    current = result;
                }
            }
            catch (err) {
                console.error(`[HookRegistry] Error in "${name}" handler:`, err);
                // Don't rethrow — a hook error should not abort the operation unless
                // the handler itself decides to throw. Re-throw only critical signals.
                throw err;
            }
        }
        return current;
    }
    /**
     * Removes all registered handlers for a specific hook name.
     *
     * @param name The hook to clear.
     */
    clearHook(name) {
        const toRemove = this._hooks.filter((h) => h.name === name);
        for (const reg of toRemove) {
            const idx = this._hooks.indexOf(reg);
            if (idx !== -1)
                this._hooks.splice(idx, 1);
        }
    }
    /**
     * Removes all registered handlers across all hooks.
     * Useful for testing teardown.
     */
    clearAll() {
        this._hooks.length = 0;
    }
    /**
     * Returns the number of handlers registered for a given hook.
     * Useful for debugging and testing.
     */
    count(name) {
        return this._hooks.filter((h) => h.name === name).length;
    }
    /**
     * Returns all registered hook names (deduplicated).
     */
    registeredHooks() {
        return [...new Set(this._hooks.map((h) => h.name))];
    }
}
//# sourceMappingURL=hooks.js.map