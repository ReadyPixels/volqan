/**
 * @file index.ts
 * @description @volqan/extension-sdk — Developer SDK for building Volqan extensions.
 *
 * This package provides the complete toolkit for creating extensions that plug into
 * the Volqan headless CMS. It re-exports all extension types from @volqan/core and
 * adds higher-level utilities: a base class, a functional `defineExtension()` API,
 * hook registration helpers, and testing utilities.
 *
 * @example
 * ```ts
 * import { defineExtension } from '@volqan/extension-sdk';
 *
 * export default defineExtension({
 *   id: 'acme/hello',
 *   version: '1.0.0',
 *   name: 'Hello World',
 *   description: 'A simple example extension',
 *   author: { name: 'Acme Corp' },
 *
 *   async onInstall(ctx) {
 *     ctx.logger.info('Hello extension installed!');
 *   },
 * });
 * ```
 *
 * @packageDocumentation
 */

// Re-export all extension types from @volqan/core
export type {
  VolqanExtension,
  ExtensionContext,
  MenuItem,
  AdminPage,
  Widget,
  SettingField,
  RouteDefinition,
  ExtensionRequest,
  ExtensionResponse,
  ContentHook,
  ContentHookPayload,
  Migration,
} from '@volqan/core';

// Re-export loader types and utilities
export type {
  LoadedExtension,
  ExtensionStatus,
  ExtensionManagerOptions,
  LicenseValidationResult,
} from '@volqan/core';

export {
  ExtensionManager,
  validateExtension,
  ExtensionValidationError,
  ExtensionLifecycleError,
} from '@volqan/core';

// SDK-specific APIs
export { VolqanExtensionBase } from './base.js';
export { defineExtension } from './define.js';
export type { DefineExtensionOptions } from './define.js';
export {
  registerRoute,
  registerAdminPage,
  registerContentType,
  registerAPIEndpoint,
} from './hooks.js';
export type {
  RouteRegistration,
  AdminPageRegistration,
  ContentTypeRegistration,
  APIEndpointRegistration,
} from './hooks.js';
export { createTestContext, mockVolqanApp } from './testing.js';
export type { TestContext, MockVolqanApp } from './testing.js';
