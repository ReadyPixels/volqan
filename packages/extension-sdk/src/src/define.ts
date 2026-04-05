/**
 * @file define.ts
 * @description Functional API for defining Volqan extensions.
 */

import type {
  VolqanExtension,
  ExtensionContext,
  MenuItem,
  AdminPage,
  Widget,
  SettingField,
  RouteDefinition,
  ContentHook,
  Migration,
} from '@volqan/core';

/**
 * Options accepted by {@link defineExtension}.
 *
 * Extends the core VolqanExtension interface with SDK-specific lifecycle
 * aliases (`onActivate` / `onDeactivate`) that map to `onEnable` / `onDisable`.
 */
export interface DefineExtensionOptions {
  // --- Required metadata ---

  /** Globally unique extension identifier ("vendor/name"). */
  id: string;

  /** Semantic version string (e.g. "1.0.0"). */
  version: string;

  /** Human-readable display name. */
  name: string;

  /** Short description shown in the Extension Manager. */
  description: string;

  /** Extension author information. */
  author: { name: string; url?: string };

  // --- Lifecycle hooks ---

  /** Called once when the extension is first installed. */
  onInstall?: (ctx: ExtensionContext) => Promise<void>;

  /**
   * Called each time the extension is activated (enabled).
   * This is an SDK alias for the core `onEnable` hook.
   */
  onActivate?: (ctx: ExtensionContext) => Promise<void>;

  /**
   * Called each time the extension is deactivated (disabled).
   * This is an SDK alias for the core `onDisable` hook.
   */
  onDeactivate?: (ctx: ExtensionContext) => Promise<void>;

  /** Called once when the extension is uninstalled. */
  onUninstall?: (ctx: ExtensionContext) => Promise<void>;

  /** Called on every application boot while the extension is enabled. */
  onBoot?: (ctx: ExtensionContext) => Promise<void>;

  // --- Admin UI contributions ---

  /** Navigation items for the admin sidebar. */
  adminMenuItems?: MenuItem[];

  /** Full admin pages. */
  adminPages?: AdminPage[];

  /** Dashboard widgets. */
  adminWidgets?: Widget[];

  /** Extension settings fields. */
  adminSettings?: SettingField[];

  // --- Backend contributions ---

  /** API routes. */
  apiRoutes?: RouteDefinition[];

  /** Raw GraphQL SDL string. */
  graphqlSchema?: string;

  /** Content model lifecycle hooks. */
  contentHooks?: ContentHook[];

  /** Database migrations. */
  databaseMigrations?: Migration[];

  // --- Marketplace ---

  /** Bazarix marketplace metadata. */
  marketplace?: VolqanExtension['marketplace'];
}

/**
 * Define a Volqan extension using the functional API.
 *
 * This is the recommended way to create extensions. It provides a clean
 * interface with SDK-specific lifecycle aliases and returns a fully-typed
 * VolqanExtension object ready for registration.
 *
 * @param options - Extension definition options.
 * @returns A VolqanExtension-conforming object.
 *
 * @example
 * ```ts
 * import { defineExtension } from '@volqan/extension-sdk';
 *
 * export default defineExtension({
 *   id: 'acme/analytics',
 *   version: '1.0.0',
 *   name: 'Analytics',
 *   description: 'Track page views and user events',
 *   author: { name: 'Acme Corp' },
 *
 *   async onInstall(ctx) {
 *     ctx.logger.info('Analytics extension installed');
 *   },
 *
 *   async onActivate(ctx) {
 *     ctx.logger.info('Analytics tracking started');
 *   },
 *
 *   apiRoutes: [
 *     {
 *       method: 'POST',
 *       path: '/track',
 *       public: true,
 *       handler: async (req) => ({
 *         status: 200,
 *         body: { ok: true },
 *       }),
 *     },
 *   ],
 * });
 * ```
 */
export function defineExtension(options: DefineExtensionOptions): VolqanExtension {
  const ext: VolqanExtension = {
    id: options.id,
    version: options.version,
    name: options.name,
    description: options.description,
    author: options.author,
  };

  // Lifecycle hooks — map SDK aliases to core hooks
  if (options.onInstall) ext.onInstall = options.onInstall;
  if (options.onActivate) ext.onEnable = options.onActivate;
  if (options.onDeactivate) ext.onDisable = options.onDeactivate;
  if (options.onUninstall) ext.onUninstall = options.onUninstall;
  if (options.onBoot) ext.onBoot = options.onBoot;

  // Admin UI
  if (options.adminMenuItems) ext.adminMenuItems = options.adminMenuItems;
  if (options.adminPages) ext.adminPages = options.adminPages;
  if (options.adminWidgets) ext.adminWidgets = options.adminWidgets;
  if (options.adminSettings) ext.adminSettings = options.adminSettings;

  // Backend
  if (options.apiRoutes) ext.apiRoutes = options.apiRoutes;
  if (options.graphqlSchema) ext.graphqlSchema = options.graphqlSchema;
  if (options.contentHooks) ext.contentHooks = options.contentHooks;
  if (options.databaseMigrations) ext.databaseMigrations = options.databaseMigrations;

  // Marketplace
  if (options.marketplace) ext.marketplace = options.marketplace;

  return ext;
}
