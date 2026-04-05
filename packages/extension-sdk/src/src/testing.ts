/**
 * @file testing.ts
 * @description Testing utilities for Volqan extensions.
 *
 * Provides helpers to create mock contexts and simulate the Volqan app
 * environment for unit and integration testing of extensions.
 */

import type {
  ExtensionContext,
  VolqanExtension,
} from '@volqan/core';

// ---------------------------------------------------------------------------
// Test context
// ---------------------------------------------------------------------------

/**
 * A test-friendly ExtensionContext with inspection capabilities.
 */
export interface TestContext extends ExtensionContext {
  /** Access the underlying config store for test assertions. */
  _configStore: Map<string, unknown>;

  /** Access all emitted events for test assertions. */
  _emittedEvents: Array<{ event: string; payload: unknown }>;

  /** Access all log messages for test assertions. */
  _logs: Array<{ level: string; message: string; meta?: Record<string, unknown> }>;
}

/**
 * Create a test-friendly ExtensionContext for use in unit tests.
 *
 * The returned context provides the same interface as a real ExtensionContext
 * but stores all state in-memory and exposes internal stores for assertions.
 *
 * @param installationId - Optional installation ID override. Defaults to "test-install".
 * @returns A TestContext with inspectable internal state.
 *
 * @example
 * ```ts
 * import { createTestContext } from '@volqan/extension-sdk';
 *
 * const ctx = createTestContext();
 *
 * await myExtension.onInstall?.(ctx);
 *
 * // Assert config was set
 * expect(ctx._configStore.get('initialized')).toBe(true);
 *
 * // Assert events were emitted
 * expect(ctx._emittedEvents).toContainEqual({
 *   event: 'extension:ready',
 *   payload: undefined,
 * });
 *
 * // Assert log messages
 * expect(ctx._logs.some(l => l.level === 'info')).toBe(true);
 * ```
 */
export function createTestContext(installationId = 'test-install'): TestContext {
  const configStore = new Map<string, unknown>();
  const emittedEvents: Array<{ event: string; payload: unknown }> = [];
  const logs: Array<{ level: string; message: string; meta?: Record<string, unknown> }> = [];
  const eventHandlers = new Map<string, Array<(payload: unknown) => void | Promise<void>>>();

  return {
    installationId,

    _configStore: configStore,
    _emittedEvents: emittedEvents,
    _logs: logs,

    config: {
      get<T = unknown>(key: string): T | undefined {
        return configStore.get(key) as T | undefined;
      },
      async set<T = unknown>(key: string, value: T): Promise<void> {
        configStore.set(key, value);
      },
      async delete(key: string): Promise<void> {
        configStore.delete(key);
      },
    },

    logger: {
      debug(message: string, meta?: Record<string, unknown>): void {
        logs.push({ level: 'debug', message, meta });
      },
      info(message: string, meta?: Record<string, unknown>): void {
        logs.push({ level: 'info', message, meta });
      },
      warn(message: string, meta?: Record<string, unknown>): void {
        logs.push({ level: 'warn', message, meta });
      },
      error(message: string, _error?: Error, meta?: Record<string, unknown>): void {
        logs.push({ level: 'error', message, meta });
      },
    },

    events: {
      emit(event: string, payload?: unknown): void {
        emittedEvents.push({ event, payload });
        const handlers = eventHandlers.get(event) ?? [];
        for (const handler of handlers) {
          void Promise.resolve(handler(payload));
        }
      },
      on(event: string, handler: (payload: unknown) => void | Promise<void>): void {
        const existing = eventHandlers.get(event) ?? [];
        eventHandlers.set(event, [...existing, handler]);
      },
      off(event: string, handler: (payload: unknown) => void | Promise<void>): void {
        const existing = eventHandlers.get(event) ?? [];
        eventHandlers.set(
          event,
          existing.filter((h) => h !== handler),
        );
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Mock Volqan app
// ---------------------------------------------------------------------------

/**
 * A mock Volqan application for integration testing extensions.
 */
export interface MockVolqanApp {
  /** Install an extension into the mock app. */
  install(ext: VolqanExtension): Promise<void>;

  /** Enable an installed extension. */
  enable(extensionId: string): Promise<void>;

  /** Disable an extension. */
  disable(extensionId: string): Promise<void>;

  /** Boot all enabled extensions. */
  bootAll(): Promise<void>;

  /** Uninstall an extension. */
  uninstall(extensionId: string): Promise<void>;

  /** Get the test context for a specific extension. */
  getContext(extensionId: string): TestContext | undefined;

  /** Get an installed extension by ID. */
  getExtension(extensionId: string): VolqanExtension | undefined;

  /** List all installed extension IDs. */
  listExtensions(): string[];
}

interface InstalledRecord {
  extension: VolqanExtension;
  context: TestContext;
  status: 'installed' | 'enabled' | 'disabled';
}

/**
 * Create a mock Volqan application for integration-testing extensions.
 *
 * The mock app simulates the full extension lifecycle without requiring
 * a real Volqan server. Each extension receives its own isolated TestContext.
 *
 * @param installationId - Optional installation ID. Defaults to "test-app".
 * @returns A MockVolqanApp instance.
 *
 * @example
 * ```ts
 * import { mockVolqanApp } from '@volqan/extension-sdk';
 * import myExtension from '../src/index.js';
 *
 * const app = mockVolqanApp();
 *
 * await app.install(myExtension);
 * await app.enable(myExtension.id);
 * await app.bootAll();
 *
 * const ctx = app.getContext(myExtension.id)!;
 * // Assert on ctx._logs, ctx._configStore, etc.
 * ```
 */
export function mockVolqanApp(installationId = 'test-app'): MockVolqanApp {
  const registry = new Map<string, InstalledRecord>();

  return {
    async install(ext: VolqanExtension): Promise<void> {
      const ctx = createTestContext(installationId);
      await ext.onInstall?.(ctx);
      registry.set(ext.id, { extension: ext, context: ctx, status: 'installed' });
    },

    async enable(extensionId: string): Promise<void> {
      const record = registry.get(extensionId);
      if (!record) throw new Error(`Extension "${extensionId}" is not installed.`);
      await record.extension.onEnable?.(record.context);
      record.status = 'enabled';
    },

    async disable(extensionId: string): Promise<void> {
      const record = registry.get(extensionId);
      if (!record) throw new Error(`Extension "${extensionId}" is not installed.`);
      await record.extension.onDisable?.(record.context);
      record.status = 'disabled';
    },

    async bootAll(): Promise<void> {
      for (const record of registry.values()) {
        if (record.status === 'enabled') {
          await record.extension.onBoot?.(record.context);
        }
      }
    },

    async uninstall(extensionId: string): Promise<void> {
      const record = registry.get(extensionId);
      if (!record) throw new Error(`Extension "${extensionId}" is not installed.`);
      await record.extension.onUninstall?.(record.context);
      registry.delete(extensionId);
    },

    getContext(extensionId: string): TestContext | undefined {
      return registry.get(extensionId)?.context;
    },

    getExtension(extensionId: string): VolqanExtension | undefined {
      return registry.get(extensionId)?.extension;
    },

    listExtensions(): string[] {
      return Array.from(registry.keys());
    },
  };
}
