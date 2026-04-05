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
export {
  runMigrations,
  getMigrationStatus,
  generateClient,
  resetDatabase,
  MigrationError,
} from './migrations.js';
export type { MigrationStatus } from './migrations.js';

// Seed utilities
export { seed } from './seed.js';

// ---------------------------------------------------------------------------
// Locally-defined types that mirror the Prisma schema.
// These are provided so the package compiles even when the Prisma client has
// not been generated (e.g. in CI type-check-only jobs or fresh clones).
// ---------------------------------------------------------------------------

// Enums -----------------------------------------------------------------------

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum AuthProvider {
  google = 'google',
  github = 'github',
  credentials = 'credentials',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
}

// Model interfaces ------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerAccountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: unknown;
  settings: unknown;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentEntry {
  id: string;
  contentTypeId: string;
  data: unknown;
  status: ContentStatus;
  slug: string | null;
  authorId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  folder: string | null;
  storageProvider: StorageProvider;
  uploadedById: string | null;
  createdAt: Date;
}

export interface Extension {
  id: string;
  extensionId: string;
  name: string;
  version: string;
  enabled: boolean;
  settings: unknown;
  installedAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  themeId: string;
  name: string;
  version: string;
  active: boolean;
  tokens: unknown;
  installedAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  group: string;
  isPublic: boolean;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: unknown;
  userId: string | null;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: unknown | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface Installation {
  id: string;
  installationId: string;
  licenseKey: string | null;
  plan: string;
  domain: string | null;
  createdAt: Date;
}

// Prisma namespace stub -------------------------------------------------------
// Provides the subset of Prisma utility types used by repository.ts and
// manager.ts so that consumers compile without a generated client.

export type Prisma = {
  InputJsonValue: unknown;
  ContentEntryWhereInput: Record<string, unknown>;
  ContentEntryOrderByWithRelationInput: Record<string, unknown>;
  MediaCreateInput: Record<string, unknown>;
  MediaWhereInput: Record<string, unknown>;
  MediaOrderByWithRelationInput: Record<string, unknown>;
  MediaUpdateInput: Record<string, unknown>;
};
