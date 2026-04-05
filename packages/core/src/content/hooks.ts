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
// Hook Names
// ---------------------------------------------------------------------------

/**
 * All supported content lifecycle hook names.
 */
export type ContentHookName =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeDelete'
  | 'afterDelete'
  | 'beforePublish'
  | 'afterPublish';

// ---------------------------------------------------------------------------
// Hook Payloads
// ---------------------------------------------------------------------------

/** Common fields present in all hook payloads. */
interface BaseHookPayload {
  /** Slug of the content type triggering the hook. */
  contentTypeSlug: string;
}

/** Payload passed to beforeCreate hooks. May be mutated by the handler. */
export interface BeforeCreatePayload extends BaseHookPayload {
  /** Mutable entry data that will be persisted. */
  data: Record<string, unknown>;
  /** ID of the user creating the entry, if available. */
  authorId?: string;
}

/** Payload passed to afterCreate hooks. */
export interface AfterCreatePayload extends BaseHookPayload {
  /** The newly created entry. */
  entry: Record<string, unknown>;
}

/** Payload passed to beforeUpdate hooks. May be mutated by the handler. */
export interface BeforeUpdatePayload extends BaseHookPayload {
  /** The entry ID being updated. */
  id: string;
  /** Mutable partial data that will be merged into the existing entry. */
  data: Record<string, unknown>;
  /** The entry's current state before the update. */
  existing: Record<string, unknown>;
}

/** Payload passed to afterUpdate hooks. */
export interface AfterUpdatePayload extends BaseHookPayload {
  /** The updated entry after persistence. */
  entry: Record<string, unknown>;
}

/** Payload passed to beforeDelete hooks. */
export interface BeforeDeletePayload extends BaseHookPayload {
  /** The entry about to be deleted. */
  entry: Record<string, unknown>;
}

/** Payload passed to afterDelete hooks. */
export interface AfterDeletePayload extends BaseHookPayload {
  /** The ID of the deleted entry. */
  id: string;
}

/** Payload passed to beforePublish hooks. */
export interface BeforePublishPayload extends BaseHookPayload {
  /** The entry about to be published. */
  entry: Record<string, unknown>;
}

/** Payload passed to afterPublish hooks. */
export interface AfterPublishPayload extends BaseHookPayload {
  /** The newly published entry. */
  entry: Record<string, unknown>;
}

/** Union of all possible hook payloads. */
export type HookPayload =
  | BeforeCreatePayload
  | AfterCreatePayload
  | BeforeUpdatePayload
  | AfterUpdatePayload
  | BeforeDeletePayload
  | AfterDeletePayload
  | BeforePublishPayload
  | AfterPublishPayload;

// ---------------------------------------------------------------------------
// Handler Type
// ---------------------------------------------------------------------------

/**
 * A hook handler function. Receives the payload and may return a mutated version.
 * For `before*` hooks, the return value replaces the `data` field in the payload.
 * For `after*` hooks, the return value is ignored.
 */
export type HookHandler<P extends HookPayload = HookPayload> = (
  payload: P,
) => void | P | Promise<void> | Promise<P>;

/** Internal registration record. */
interface HookRegistration {
  name: ContentHookName;
  handler: HookHandler;
  /** Lower priority = runs first. Default 100. */
  priority: number;
}

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
  private readonly _hooks: HookRegistration[] = [];

  /**
   * Registers a handler for a lifecycle hook.
   *
   * @param name The hook lifecycle event to listen for.
   * @param handler The async or sync callback to invoke.
   * @param priority Execution order (lower = earlier). Defaults to 100.
   * @returns A deregistration function — call it to remove the handler.
   */
  register<P extends HookPayload>(
    name: ContentHookName,
    handler: HookHandler<P>,
    priority = 100,
  ): () => void {
    const registration: HookRegistration = {
      name,
      handler: handler as unknown as HookHandler,
      priority,
    };
    this._hooks.push(registration);
    this._hooks.sort((a, b) => a.priority - b.priority);

    return () => {
      const idx = this._hooks.indexOf(registration);
      if (idx !== -1) this._hooks.splice(idx, 1);
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
  async fire<P extends HookPayload>(name: ContentHookName, payload: P): Promise<P> {
    const handlers = this._hooks.filter((h) => h.name === name);
    if (handlers.length === 0) return payload;

    const isBefore = name.startsWith('before');
    let current: P = payload;

    for (const { handler } of handlers) {
      try {
        const result = await handler(current);
        if (isBefore && result !== undefined && result !== null) {
          current = result as P;
        }
      } catch (err) {
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
  clearHook(name: ContentHookName): void {
    const toRemove = this._hooks.filter((h) => h.name === name);
    for (const reg of toRemove) {
      const idx = this._hooks.indexOf(reg);
      if (idx !== -1) this._hooks.splice(idx, 1);
    }
  }

  /**
   * Removes all registered handlers across all hooks.
   * Useful for testing teardown.
   */
  clearAll(): void {
    this._hooks.length = 0;
  }

  /**
   * Returns the number of handlers registered for a given hook.
   * Useful for debugging and testing.
   */
  count(name: ContentHookName): number {
    return this._hooks.filter((h) => h.name === name).length;
  }

  /**
   * Returns all registered hook names (deduplicated).
   */
  registeredHooks(): ContentHookName[] {
    return [...new Set(this._hooks.map((h) => h.name))];
  }
}
