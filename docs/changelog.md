---
title: Changelog — Volqan
description: Version history and release notes for the Volqan framework.
---

# Changelog

All notable changes to Volqan are documented in this file.

This project adheres to [Semantic Versioning](https://semver.org). The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Versions marked **alpha** are pre-release and should not be used in production.
Versions marked **beta** are feature-complete for the release scope but may contain bugs.
Versions with neither label are stable.

---

## [Unreleased]

Changes not yet assigned to a date.

---

## 2026-06-14

### Security
- Added `Content-Security-Policy` header to `next.config.ts` — strict CSP with `strict-dynamic`, `frame-ancestors 'none'`, and `form-action 'self'` (packages/admin)
- Added `orderBy`/`direction` whitelist validation to content list route — validates against content type field names and system columns to prevent SQL injection (packages/admin)
- Replaced in-memory rate limiter with Redis-backed implementation — uses Redis when `REDIS_URL` is set, falls back to in-memory for development (packages/admin)
- Made `CRON_SECRET` required — returns 503 when unset instead of allowing unauthenticated access (packages/admin)
- Added `SESSION_SECRET` enforcement in production — throws error if unset in token-generation routes instead of falling back to hardcoded dev secret (packages/admin)
- Removed `localhost:4000` from `serverActions.allowedOrigins` — only `localhost:3001` remains (packages/admin)
- Generated cryptographically random `oauth_state` using `randomBytes(32)` and added `Secure` flag to OAuth state cookie in production (packages/admin)
- Fixed user enumeration via OAuth callback — unified find-or-create flow with `upsert` for account linking, consistent response timing (packages/admin)
- Added session invalidation on password change and password reset — calls `destroyAllUserSessions(userId)` before updating password (packages/admin)
- Added request body size limits (1MB) to all JSON API routes via `checkContentLength` helper (packages/admin)
- Added `requirePasswordChange` flag to admin-created users — forces password change on first login (packages/admin)
- Added `SECURITY.md` at repo root with vulnerability reporting instructions
- Added cleanup infrastructure — `.tmp/` directory, `.claude/cleanup.ps1` script, and session cleanup instructions in `CLAUDE.md`

### Changed
- Added `requirePasswordChange` field to `User` Prisma schema (packages/core)
- Removed `CLAUDE.md` from `.gitignore` — it is a project file that should be tracked
- Added warning comment to `docker-compose.yml` about default PostgreSQL credentials being for development only
- Added comment to `docker-compose.prod.yml` documenting that `scripts/postgres/init.sql` is optional

### Fixed
- Fixed `rateLimit` function to be async-compatible with Redis backend — updated all callers to `await` (packages/admin)

---

## 2026-06-11 (v1.5.0)

### Added
- Added `GET /api/analytics` — activity overview with totals, daily activity buckets, and top audit actions (packages/admin)
- Added `/analytics` page — bar chart, top actions list, stat cards, period selector (packages/admin)
- Added `GET/POST /api/settings/webhooks` and `PATCH/DELETE /api/settings/webhooks/[id]` — full outbound webhook CRUD with HMAC-signed delivery (packages/admin)
- Added `src/lib/webhook.ts` — fire-and-forget webhook dispatcher with per-hook `lastStatus` tracking (packages/admin)
- Added `POST /api/cron/content-scheduler` — cron endpoint to publish/unpublish content entries by `scheduledAt`/`unpublishAt` fields (packages/admin)
- Added `POST/GET /api/content/[type]/[id]/workflow` — content approval workflow with submit/approve/reject/publish/unpublish/archive/restore transitions (packages/admin)
- Added `GET/POST /api/auth/sso` — SAML 2.0 and LDAP/AD configuration endpoints (packages/admin)
- Added `POST /api/auth/sso/saml/acs` — SAML ACS with full `node-saml` v3 response validation and SSO user provisioning (packages/admin)
- Added `POST /api/auth/sso/ldap/test` — LDAP connectivity test using `ldapts` bind verification (packages/admin)
- Added `POST/GET /api/v1/license/validate` — public license key validation endpoint; validates HMAC signature and expiry (packages/admin)
- Added `src/lib/license.ts` — `MKT-[PRODUCT_ID]-[INSTALL_ID]-[EXPIRY_HASH]` key generation and validation (packages/admin)
- Added `src/lib/cache.ts` — Redis-backed cache with in-process LRU fallback; `cached()` helper for cache-aside pattern (packages/admin)
- Added `src/lib/audit.ts` — `audit()` helper for writing AuditLog entries; wired into content and user routes (packages/admin)
- Added `scheduledAt` and `unpublishAt` fields to `ContentEntry` schema (packages/core)
- Added `Webhook` model to Prisma schema (packages/core)
- Added Prisma migration `20260601000000_webhooks_scheduling` for new schema fields (packages/core)
- Added `publishConfig` to `@volqan/extension-sdk` and `@volqan/theme-sdk` for npm publish (packages/extension-sdk, packages/theme-sdk)
- Added `LICENSE_SECRET`, `CRON_SECRET`, and `REDIS_URL` to `.env.example`
- Added Analytics and AI Assistant entries to admin sidebar navigation (packages/admin)
- Added `docs/pro-architecture.md` — Pro tier feature matrix, plan gating mechanism, activation flow, white-label spec
- Added `docs/cloud-architecture.md` — multi-tenant hosted architecture: schema-per-tenant, tenant router, control plane design
- Added `docs/enterprise-license.md` — Enterprise tier feature set, pricing, SLA commitments, white-label scope

### Fixed
- Fixed `UnhandledSchemeError: Reading from "node:child_process"` build error — removed `@volqan/core` import from middleware (packages/admin)
- Fixed `useState in Server Component` error — added `'use client'` directive to `AdminShell.tsx` (packages/admin)
- Removed runtime `@volqan/core` imports from client-rendered components to prevent Node.js module leakage into browser bundles (packages/admin)
- Refactored core package to remove all `next/server` dependencies — replaced `NextRequest`/`NextResponse` with standard Web API `Request`/`Response` types (packages/core)
- Fixed `UserRole` type mismatch between Prisma's `$Enums.UserRole` and core's local `UserRole` enum in `auth/session.ts` (packages/core)
- Removed `deletedAt` references from `ContentEntry` repository — field does not exist in Prisma schema (packages/core)
- Added `scheduledAt` and `unpublishAt` fields to `ContentEntry` local interface to match Prisma schema (packages/core)
- Removed `thumbnailUrl`, `width`, `height`, `caption`, `storageKey`, and `updatedAt` from `MediaFile` type and `MediaManager` — fields do not exist in Prisma schema (packages/core)
- Removed `InputJsonValue` cast issues in `content/repository.ts` and `content/schema-builder.ts` by using `as never` for JSON field values (packages/core)
- Added ESLint v9 flat config to all packages and extensions (packages/core, packages/admin, extensions/*, themes/*)
- Fixed admin `tsc --noEmit` typecheck: changed `moduleResolution` from `NodeNext` to `Bundler`, fixed `@/*` path mapping, disabled `verbatimModuleSyntax`, added `skipLibCheck` — reduced errors from 359 to 25 (packages/admin)
- Fixed extension-sdk/theme-sdk/extensions typecheck: added `paths` to tsconfig pointing to core `dist/` output (extensions/blog, extensions/seo, extensions/forms, packages/extension-sdk, packages/theme-sdk)
- Fixed `passwordHash` → `password` field reference in login route (packages/admin)
- Fixed OAuth callback `provider` enum values: changed uppercase `GOOGLE`/`GITHUB` to lowercase `google`/`github` (packages/admin)
- Fixed SSO route `Record<string, unknown>` → `InputJsonValue` cast for Prisma JSON fields (packages/admin)
- Fixed workflow route JSON data cast with `as unknown as InputJsonValue` (packages/admin)
- Fixed `repo.list()` → `repo.findMany()` and `repo.getById()` → `repo.findById()` method name mismatches in content API routes (packages/admin)
- Added placeholder `src/index.ts` to cloud-bridge package to satisfy tsconfig (packages/cloud-bridge)
- Added `aria-current="page"` to active sidebar links (packages/admin)
- Added `aria-expanded` and `aria-controls` to collapsible sidebar nav buttons (packages/admin)
- Decorative required-field asterisks now `aria-hidden`; added `sr-only` "(required)" text for screen readers (packages/admin)
- Added `role="alert"` to all form field error messages (packages/admin)
- Added `aria-pressed` to multiselect toggle buttons (packages/admin)
- File/image upload inputs are now keyboard-accessible via proper `<label>` wrapping (packages/admin)
- Richtext toolbar format buttons now have `aria-label` and `title` attributes (packages/admin)
- Login page error message now uses `role="alert" aria-live="assertive"` (packages/admin)
- Fixed `passwordHash` field reference in `POST /api/users` — schema field is `password`, not `passwordHash` (packages/admin)
- Added `src/lib/email.ts` — lightweight email sender supporting Resend HTTP API with console fallback for development (packages/admin)
- Added invite email to `POST /api/users` — sends temporary password to newly created user; email failure is non-fatal (packages/admin)
- Added initial Prisma migration SQL (`packages/core/prisma/migrations/20260405000000_init/`) generated from current schema
- Added `EMAIL_TRANSPORT`, `EMAIL_FROM`, and `RESEND_API_KEY` to `.env.example`
- Added `GET /api/auth/oauth/[provider]` — OAuth redirect initiation for Google and GitHub with CSRF state cookie (packages/admin)
- Added `GET /api/auth/oauth/[provider]/callback` — OAuth code exchange, account linking, and session creation (packages/admin)
- Added `POST /api/auth/forgot-password` — generates HMAC-signed time-limited reset token; logs URL in development (packages/admin)
- Added `POST /api/auth/reset-password` — verifies reset token and updates user password (packages/admin)
- Added `POST /api/auth/verify-email` — verifies HMAC-signed email token and sets `emailVerified` timestamp (packages/admin)
- Added `PATCH /api/auth/me` — profile update (name, avatar) and password change with current-password verification (packages/admin)
- Added `/profile` page — account info, profile editor, and password change form (packages/admin)
- Added `/ai` page — AI assistant with `initialOpen`, wired to save provider config to `/api/settings` (packages/admin)
- Added `/forgot-password` and `/reset-password` pages with standalone layouts (packages/admin)
- Added Google and GitHub OAuth buttons to login page (packages/admin)
- Added "Forgot password?" link to login form (packages/admin)
- Added `GET/POST /api/extensions` and `PATCH/DELETE /api/extensions/[id]` — full extension lifecycle management (packages/admin)
- Added `GET/POST /api/themes` and `PATCH/DELETE /api/themes/[id]` — theme install, activation, and token editing (packages/admin)
- Added `GET /api/billing/status`, `POST /api/billing/portal`, `POST /api/billing/webhook` — Stripe billing integration (packages/admin)
- Added `GET /api/audit-log` — paginated audit log for admin and dashboard (packages/admin)
- Added `GET/POST /api/pages` and `GET/PATCH/DELETE /api/pages/[id]` — page builder persistence via core PageRepository (packages/admin)
- Added `GET /api/dashboard/stats` — aggregate counts, recent entries, and activity feed (packages/admin)
- Wired Billing page to `/api/billing/status`, cancel, and Stripe Customer Portal (packages/admin)
- Wired Extensions page to `/api/extensions` with live enable/disable toggle and uninstall (packages/admin)
- Wired Themes page to `/api/themes` with activate and token editor persistence (packages/admin)
- Wired Pages manager to `/api/pages` replacing mock data (packages/admin)
- Wired dashboard StatsCards, RecentEntries, and ActivityFeed to `/api/dashboard/stats` (packages/admin)
- Added `.env.example` at repo root documenting all required environment variables
- Added `SESSION_SECRET` and `VOLQAN_UPLOAD_DIR` environment variables to `docker-compose.yml`
- Added `prisma migrate deploy` step to CI build job
- Restricted locale selector to English and Arabic only — removed French, German, Spanish options (packages/admin)
- Updated roadmap, README, and changelog to replace multilingual/i18n references with English/Arabic scope

### Security
- Added magic bytes content validation to media upload route — rejects files whose binary signature doesn't match the declared extension (packages/admin)
- Added in-memory sliding-window rate limiter applied to login, forgot-password, and reset-password endpoints (packages/admin)
- Extended `PUBLIC_PATHS` in middleware to allow OAuth, forgot-password, reset-password, and verify-email routes without session (packages/admin)
- Fixed API key storage — `hash` field now stores a SHA-256 digest of the raw key instead of the plaintext value (packages/admin)
- Added scope allowlist validation on API key creation — rejects unknown or unauthorized scope values (packages/admin)
- Added `Secure` cookie flag to session cookie in production environments (packages/admin)
- Added ownership enforcement to `GET /api/media` and `GET /api/media/[id]` — non-admin users can only list and access their own uploads (packages/admin)
- Fixed XSS vulnerability in `HtmlBlock` and `RichTextBlock` page builder components — replaced with allowlist-based `sanitizeHtml()` function (packages/admin)
- Fixed XSS vulnerability in `AIMessage` markdown renderer — input is now HTML-escaped before pattern matching and link `href` values are validated to `http`/`https` only (packages/admin)
- Fixed `rel="noopener noreferrer"` missing `noreferrer` on AI-generated external links (packages/admin)
- Fixed open redirect in billing checkout — validates URL is `https:` and hostname ends with `.stripe.com` before redirecting (packages/admin)
- Restricted `images.remotePatterns` in `next.config.ts` — replaced overly broad `**.cloudflare.com` wildcard with specific `imagedelivery.net` hostname (packages/admin)
- Added HTTP security response headers to all routes via `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (packages/admin)

---

## 2026-05-22

### Added
- Added `api-helpers.ts` — `getSessionUser`, response helpers (packages/admin)
- Added `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` endpoints (packages/admin)
- Added `/api/content/types`, `/api/content/types/[id]` endpoints (packages/admin)
- Added `/api/content/[type]`, `/api/content/[type]/[id]` endpoints (packages/admin)
- Added `/api/media`, `/api/media/[id]` endpoints (packages/admin)
- Added `/api/users`, `/api/users/[id]` endpoints (packages/admin)
- Added `/api/settings`, `/api/settings/api-keys`, `/api/settings/api-keys/[id]` endpoints (packages/admin)
- Added `/api/billing/checkout`, `/api/billing/cancel` endpoints (packages/admin)
- Added `/api/health` endpoint (packages/admin)
- Added `middleware.ts` — session-based route protection (packages/admin)
- Added `app/login/` — login page and standalone layout (packages/admin)
- Wired content, users, settings, media pages to real APIs (packages/admin)
- Wired TopBar sign-out to `/api/auth/logout` (packages/admin)

---

## 2026-05-20

### Security
- Fixed XSS vulnerabilities in `AIMessage.tsx` (escapeHtml, safeHref) (packages/admin)
- Added HTML sanitizer in page builder (`sanitizeHtml` allowlist) (packages/admin)
- Fixed open redirect in billing checkout page (packages/admin)
- Added HTTP security headers in `next.config.ts` (packages/admin)
- Admin middleware now validates session cookies before route gating (packages/admin)
- Media upload route now enforces upload-root boundaries and blocks obvious scriptable file types (packages/admin)
- API keys now stored as SHA-256 hash, not plaintext (packages/admin)
- API key scope creation validated against an allowlist (packages/admin)
- Session cookie now includes `Secure` flag in production (packages/admin)
- Media list and GET-by-ID now enforce ownership — non-admin users only see their own uploads (packages/admin)

---

## 2026-05-19

### Added
- Added complete admin panel layout and components — sidebar, top bar, dashboard, content types, entries, media, extensions, themes, users, billing, settings pages (packages/admin)
- Added visual page builder with 28-block drag-and-drop and live preview (packages/admin)
- Added AI assistant panel with swappable LLM provider configuration (packages/admin)
- Added billing UI with FeeBreakdown, InvoiceTable, PlanCard, SubscriptionStatus components (packages/admin)
- Added shadcn/ui-style component library: button, card, input, badge, avatar, dialog, dropdown-menu, tabs, toast, data-table, form-field (packages/admin)
- Added light/dark/system theme switching with CSS custom property tokens (packages/admin)
- Added extension runtime: sandbox, context-factory, lifecycle, registry (packages/core)
- Added theme runtime: applicator, registry, preview (packages/core)
- Added AI Manager with pluggable provider interface: OpenAI, Claude, Gemini, Ollama (packages/core)
- Added billing: plans, checkout, subscription-manager, webhook-handler, fee-calculator (packages/core)
- Added license & installation: API client, checker, installation ID (packages/core)
- Added Pages repository (packages/core)
- Added deep link integration for Bazarix marketplace (packages/core)
- Added CLI `create-volqan-app` scaffolding with interactive prompts (packages/cli)
- Added `volqan create extension` and `volqan create theme` sub-commands (packages/cli)
- Added Extension SDK: `VolqanExtensionBase`, `defineExtension()`, registration helpers, React hooks, test utilities (packages/extension-sdk)
- Added Theme SDK: `VolqanThemeBase`, `defineTheme()`, component override system, preview context (packages/theme-sdk)
- Added Blog extension: post editor, post list, RSS feed generator (extensions/blog)
- Added SEO extension: meta analyzer, sitemap generator, robots.txt builder, SEOPanel (extensions/seo)
- Added Forms extension: visual form builder, FormRenderer, submission handler (extensions/forms)
- Added Default Theme: blue/light professional design with Inter typeface (themes/default)
- Added Minimal Theme: dark/emerald modern aesthetic with JetBrains Mono accent (themes/minimal)
- Added multi-stage Dockerfile and docker-compose.yml for development (packages/core)
- Added docker-compose.prod.yml for production with resource limits and backup service (packages/core)
- Added developer documentation: extension and theme getting-started, API references, publishing guides (docs/)

### Fixed
- Resolved webpack build error (`Can't resolve 'child_process'`) — added `sharp: false` / `detect-libc: false` webpack aliases for client builds (packages/admin)
- Fixed React hydration mismatch on dashboard — moved data generation into `useState` + `useEffect` (packages/admin)
- Added `public/favicon.svg` and wired it via `metadata.icons` in `app/layout.tsx` (packages/admin)
- Fixed stat card percentage badges invisible in light mode — fixed Tailwind v4 dark mode variant (packages/admin)

---

## 2026-04-08

### Changed
- Replaced all `volqan.dev` / `bazarix.dev` domain references with `volqan.link` / `bazarix.link` across CLI templates, core auth constants, and documentation
- Added Volqan logo (`logo.png`) to repository root and updated `README.md` header
- Updated `packages/admin/tsconfig.json` — stricter compiler options, formatted consistently
- `packages/core/src/auth/jwt.ts` — updated issuer constant from `volqan.dev` to `volqan.link`

---

## 2026-04-05 (v0.0.1 — v0.5.0-beta)

### Added
- Initialized pnpm workspace monorepo: `packages/core/`, `packages/admin/`, `packages/cli/`, `packages/extension-sdk/`, `packages/theme-sdk/`, `packages/cloud-bridge/`
- Root `package.json` with workspace configuration and shared scripts
- `pnpm-workspace.yaml` defining monorepo workspace glob patterns
- Base `tsconfig.json` (strict mode, ESNext target, bundler module resolution)
- GitHub issue templates: bug report, feature request, extension proposal
- GitHub discussion templates: general, show-and-tell, extension ideas
- CI workflows: lint/type-check, deploy docs, release, attribution check
- GitHub Sponsors configuration pointing to `github: ReadyPixels`
- Legal documents: Terms of Service, Privacy Policy, Refund Policy, Attribution Policy, Fee Disclosure, Contributor License Agreement
- `LICENSE-ATTRIBUTION.md` — Open Core Attribution License v1.0
- `VolqanExtension` and `VolqanTheme` TypeScript interfaces
- Documentation: index, getting-started, pricing, roadmap, extension API, theme API
- `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- Extension stubs: blog, ecommerce, forms, seo
- Theme stubs: default, minimal
- Example application stubs: blog, saas-dashboard, ecommerce, portfolio

---

## Upcoming Releases

| Version | Phase | Target | Description |
|---|---|---|---|
| v0.1.0-alpha | Phase 1 | June 2026 | First runnable release — database layer, auth, CRUD, APIs, Docker, CLI |
| v0.5.0-beta | Phase 2 | August 2026 | Full-featured beta — page builder, AI assistant, Stripe, first-party extensions |
| v1.0.0 | Phase 3 | December 2026 | Stable release — marketplace live, SDK on npm, community ecosystem |
| v1.5.0 | Phase 4 | June 2027 | Enterprise features — Arabic/English locale, workflows, audit log, SSO, Redis |

---

[0.0.1]: https://github.com/ReadyPixels/volqan/releases/tag/v0.0.1
[Unreleased]: https://github.com/ReadyPixels/volqan/compare/v0.0.1...HEAD
