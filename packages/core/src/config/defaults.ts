/**
 * @file config/defaults.ts
 * @description Sensible default values for all Volqan configuration options.
 *
 * These defaults are designed for a local development environment.
 * Production deployments must override sensitive values (JWT secret, database URL)
 * via environment variables or the `volqan.config.ts` file.
 */

import { join } from 'node:path';
import type { VolqanConfig } from './types.js';

/** Absolute path to the current working directory */
const cwd = process.cwd();

/**
 * Default Volqan configuration.
 *
 * Values here are overridden by (in ascending priority):
 * 1. `volqan.config.ts` file
 * 2. Environment variables (see {@link ./loader.ts})
 */
export const DEFAULT_CONFIG: VolqanConfig = {
  // ─────────────────────────────────────────────────────────────────────────
  // Database
  // ─────────────────────────────────────────────────────────────────────────
  database: {
    url: 'postgresql://postgres:postgres@localhost:5432/volqan',
    provider: 'postgresql',
    debug: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Auth
  // ─────────────────────────────────────────────────────────────────────────
  auth: {
    jwtSecret: 'volqan-insecure-dev-secret-please-set-JWT_SECRET',
    accessTokenTtl: 15 * 60,       // 15 minutes
    refreshTokenTtl: 7 * 24 * 3600, // 7 days
    sessionDuration: 7 * 24 * 3600, // 7 days
    sessionCookieName: 'volqan_session',
    allowRegistration: false,
    requireEmailVerification: false,
    oauth: {},
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Server
  // ─────────────────────────────────────────────────────────────────────────
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origins: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    trustProxy: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Storage
  // ─────────────────────────────────────────────────────────────────────────
  storage: {
    provider: 'local',
    maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB
    allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    local: {
      path: join(cwd, 'uploads'),
      publicUrl: '/uploads',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Email
  // ─────────────────────────────────────────────────────────────────────────
  email: {
    host: 'localhost',
    port: 1025, // MailHog / SMTP dev server default
    secure: false,
    from: 'Volqan <noreply@volqan.link>',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Extensions
  // ─────────────────────────────────────────────────────────────────────────
  extensions: {
    directory: join(cwd, 'extensions'),
    marketplaceEnabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Themes
  // ─────────────────────────────────────────────────────────────────────────
  themes: {
    directory: join(cwd, 'themes'),
  },
};
