/**
 * @file extensions/runtime/index.ts
 * @description Barrel export for the extension runtime.
 */
export { ExtensionSandbox, SandboxError, createSandbox } from './sandbox.js';
export { createExtensionContext, clearExtensionConfig, exportAllConfigs, clearEventBus, } from './context-factory.js';
export { ExtensionLifecycleManager, } from './lifecycle.js';
export { ExtensionRegistry, extensionRegistry, } from './registry.js';
//# sourceMappingURL=index.js.map