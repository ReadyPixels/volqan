/**
 * @file database/index.ts
 * @description Barrel export for the Volqan database layer.
 *
 * @example
 * ```ts
 * import { db, runMigrations, seed } from '@volqan/core/database';
 * ```
 */
// Prisma client singleton
export { db, connectDb, disconnectDb } from './client.js';
export { default as prisma } from './client.js';
// Migration utilities
export { runMigrations, getMigrationStatus, generateClient, resetDatabase, MigrationError, } from './migrations.js';
// Seed utilities
export { seed } from './seed.js';
// ---------------------------------------------------------------------------
// Locally-defined types that mirror the Prisma schema.
// These are provided so the package compiles even when the Prisma client has
// not been generated (e.g. in CI type-check-only jobs or fresh clones).
// ---------------------------------------------------------------------------
// Enums -----------------------------------------------------------------------
export var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["EDITOR"] = "EDITOR";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (UserRole = {}));
export var AuthProvider;
(function (AuthProvider) {
    AuthProvider["google"] = "google";
    AuthProvider["github"] = "github";
    AuthProvider["credentials"] = "credentials";
})(AuthProvider || (AuthProvider = {}));
export var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "DRAFT";
    ContentStatus["PUBLISHED"] = "PUBLISHED";
    ContentStatus["ARCHIVED"] = "ARCHIVED";
})(ContentStatus || (ContentStatus = {}));
export var StorageProvider;
(function (StorageProvider) {
    StorageProvider["LOCAL"] = "LOCAL";
    StorageProvider["S3"] = "S3";
})(StorageProvider || (StorageProvider = {}));
//# sourceMappingURL=index.js.map