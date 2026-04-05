/**
 * @file base.ts
 * @description Abstract base class for building Volqan extensions with
 * class-based lifecycle hooks.
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
 * VolqanExtensionBase
 *
 * Abstract base class that provides a structured way to build Volqan extensions.
 * Override lifecycle methods to hook into the extension lifecycle.
 *
 * @example
 * ```ts
 * import { VolqanExtensionBase } from '@volqan/extension-sdk';
 *
 * class MyExtension extends VolqanExtensionBase {
 *   id = 'acme/my-extension';
 *   version = '1.0.0';
 *   name = 'My Extension';
 *   description = 'Does something useful';
 *   author = { name: 'Acme Corp' };
 *
 *   async onInstall(ctx) {
 *     ctx.logger.info('Installed!');
 *   }
 *
 *   async onActivate(ctx) {
 *     ctx.logger.info('Activated!');
 *   }
 * }
 *
 * export default new MyExtension().toExtension();
 * ```
 */
export abstract class VolqanExtensionBase {
  /** Globally unique extension identifier in "vendor/name" format. */
  abstract readonly id: string;

  /** Semantic version string. */
  abstract readonly version: string;

  /** Human-readable display name. */
  abstract readonly name: string;

  /** Short description shown in the Extension Manager. */
  abstract readonly description: string;

  /** Extension author information. */
  abstract readonly author: { name: string; url?: string };

  // ---------------------------------------------------------------------------
  // Optional metadata
  // ---------------------------------------------------------------------------

  /** Navigation items for the admin sidebar. */
  adminMenuItems?: MenuItem[];

  /** Full admin pages. */
  adminPages?: AdminPage[];

  /** Dashboard widgets. */
  adminWidgets?: Widget[];

  /** Extension settings fields. */
  adminSettings?: SettingField[];

  /** API routes. */
  apiRoutes?: RouteDefinition[];

  /** GraphQL SDL string. */
  graphqlSchema?: string;

  /** Content model lifecycle hooks. */
  contentHooks?: ContentHook[];

  /** Database migrations. */
  databaseMigrations?: Migration[];

  /** Bazarix marketplace metadata. */
  marketplace?: VolqanExtension['marketplace'];

  // ---------------------------------------------------------------------------
  // Lifecycle hooks — override these in your subclass
  // ---------------------------------------------------------------------------

  /**
   * Called once when the extension is first installed.
   * Use for one-time setup like creating config entries or database tables.
   */
  async onInstall(_ctx: ExtensionContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Called each time the extension is activated (enabled).
   * Maps to the core `onEnable` lifecycle hook.
   */
  async onActivate(_ctx: ExtensionContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Called each time the extension is deactivated (disabled).
   * Maps to the core `onDisable` lifecycle hook.
   */
  async onDeactivate(_ctx: ExtensionContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Called once when the extension is uninstalled.
   * Use for cleanup: removing config entries, dropping tables, etc.
   */
  async onUninstall(_ctx: ExtensionContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Called on every application boot while the extension is enabled.
   * Use for registering routes, hooks, and background services.
   */
  async onBoot(_ctx: ExtensionContext): Promise<void> {
    // Override in subclass
  }

  // ---------------------------------------------------------------------------
  // Conversion
  // ---------------------------------------------------------------------------

  /**
   * Convert this class instance to a plain VolqanExtension object
   * suitable for registration with the Volqan extension engine.
   *
   * @returns A VolqanExtension-conforming object.
   */
  toExtension(): VolqanExtension {
    const ext: VolqanExtension = {
      id: this.id,
      version: this.version,
      name: this.name,
      description: this.description,
      author: this.author,

      onInstall: (ctx) => this.onInstall(ctx),
      onEnable: (ctx) => this.onActivate(ctx),
      onDisable: (ctx) => this.onDeactivate(ctx),
      onUninstall: (ctx) => this.onUninstall(ctx),
      onBoot: (ctx) => this.onBoot(ctx),
    };

    if (this.adminMenuItems) ext.adminMenuItems = this.adminMenuItems;
    if (this.adminPages) ext.adminPages = this.adminPages;
    if (this.adminWidgets) ext.adminWidgets = this.adminWidgets;
    if (this.adminSettings) ext.adminSettings = this.adminSettings;
    if (this.apiRoutes) ext.apiRoutes = this.apiRoutes;
    if (this.graphqlSchema) ext.graphqlSchema = this.graphqlSchema;
    if (this.contentHooks) ext.contentHooks = this.contentHooks;
    if (this.databaseMigrations) ext.databaseMigrations = this.databaseMigrations;
    if (this.marketplace) ext.marketplace = this.marketplace;

    return ext;
  }
}
