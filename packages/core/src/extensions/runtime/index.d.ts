/**
 * @file extensions/runtime/index.ts
 * @description Barrel export for the extension runtime.
 */
export { ExtensionSandbox, SandboxError, createSandbox } from './sandbox.js';
export type { SandboxResult, SandboxOptions } from './sandbox.js';
export { createExtensionContext, clearExtensionConfig, exportAllConfigs, clearEventBus, } from './context-factory.js';
export type { ExtendedExtensionContext } from './context-factory.js';
export { ExtensionLifecycleManager, } from './lifecycle.js';
export type { LifecycleManagerOptions, LifecyclePersistenceAdapter } from './lifecycle.js';
export { ExtensionRegistry, extensionRegistry, } from './registry.js';
export type { ExtensionManifest } from './registry.js';
//# sourceMappingURL=index.d.ts.map