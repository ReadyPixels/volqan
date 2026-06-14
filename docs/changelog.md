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

Changes staged for the next release are tracked here before a version number is assigned.

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

- Fixed `UnhandledSchemeError: Reading from "node:child_process"` build error — removed `@volqan/core` import from middleware (edge runtime cannot resolve Node.js-only modules); middleware now checks session cookie existence only, with per-route auth validation preserved via `api-helpers.ts` (packages/admin)
- Fixed `useState in Server Component` error — added `'use client'` directive to `AdminShell.tsx` which manages sidebar collapse state (packages/admin)
- Removed runtime `@volqan/core` imports from client-rendered components (`AttributionFooter.tsx`, `pages/page.tsx`) to prevent Node.js module leakage into browser bundles (packages/admin)
- Added `aria-current="page"` to active sidebar links (packages/admin)
- Added `aria-expanded` and `aria-controls` to collapsible sidebar nav buttons (packages/admin)
- Decorative required-field asterisks now `aria-hidden`; added `sr-only` "(required)" text for screen readers (packages/admin)
- Added `role="alert"` to all form field error messages (packages/admin)
- Added `aria-pressed` to multiselect toggle buttons (packages/admin)
- File/image upload inputs are now keyboard-accessible via proper `<label>` wrapping; `className="sr-only"` replaces `className="hidden"` (packages/admin)
- Richtext toolbar format buttons now have `aria-label` and `title` attributes (packages/admin)
- Login page error message now uses `role="alert" aria-live="assertive"` (packages/admin)
- Fixed `passwordHash` field reference in `POST /api/users` — schema field is `password`, not `passwordHash` (packages/admin)
- Added `src/lib/email.ts` — lightweight email sender supporting Resend HTTP API (`EMAIL_TRANSPORT=resend`) with console fallback for development (packages/admin)
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
- Restricted locale selector to English and Arabic only — removed French, German, Spanish options (packages/admin settings)
- Updated roadmap, README, and changelog to replace multilingual/i18n references with English/Arabic scope

### Security

- Added magic bytes content validation to media upload route — rejects files whose binary signature doesn't match the declared extension (packages/admin)
- Added in-memory sliding-window rate limiter (`src/lib/rate-limit.ts`) applied to login (10/15 min), forgot-password (5/15 min), and reset-password (10/15 min) endpoints (packages/admin)
- Extended `PUBLIC_PATHS` in middleware to allow OAuth, forgot-password, reset-password, and verify-email routes without session (packages/admin)
- Fixed API key storage — `hash` field now stores a SHA-256 digest of the raw key instead of the plaintext value (`api-keys/route.ts`)
- Added scope allowlist validation on API key creation — rejects unknown or unauthorized scope values
- Added `Secure` cookie flag to session cookie in production environments (`api/auth/login/route.ts`)
- Added ownership enforcement to `GET /api/media` and `GET /api/media/[id]` — non-admin users can only list and access their own uploads
- Fixed XSS vulnerability in `HtmlBlock` and `RichTextBlock` page builder components — raw HTML from block props was passed directly to `dangerouslySetInnerHTML`; replaced with an allowlist-based `sanitizeHtml()` function that strips disallowed tags and removes all `on*` event handler and `javascript:` attributes
- Fixed XSS vulnerability in `AIMessage` markdown renderer — user-supplied content was regex-substituted then passed to `dangerouslySetInnerHTML` without escaping, allowing injected HTML and `javascript:` link URIs; input is now HTML-escaped before pattern matching and link `href` values are validated to `http`/`https` only
- Fixed `rel="noopener noreferrer"` missing `noreferrer` on AI-generated external links (previously only `noopener`), which allowed target pages to read the `Referer` header
- Fixed open redirect in billing checkout — `window.location.href` was set directly from an unvalidated API response URL; now validates the URL is `https:` and the hostname ends with `.stripe.com` before redirecting
- Restricted `images.remotePatterns` in `next.config.ts` — replaced the overly broad `**.cloudflare.com` wildcard (matches any Cloudflare subdomain) with the specific `imagedelivery.net` hostname
- Added HTTP security response headers to all routes via `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## [Post-0.0.1 Development] — April–May 2026

> Work completed after the initial public release but before the first runnable version tag. Documents the full implementation of the admin panel, core runtime, SDKs, CLI, and developer ecosystem built in preparation for `v0.1.0-alpha`.

---

### Added — Admin Panel (`packages/admin`) — Phase 1

**Layout & Navigation**
- Collapsible sidebar with icon-only collapsed state and smooth CSS transition
- Top bar with breadcrumb navigation, search button (⌘K), theme toggle, notification bell, and user menu
- Notification panel showing recent site events with timestamps
- User menu with Profile, Settings, and Sign out options
- Responsive mobile header and slide-out navigation components
- `Powered by Volqan` attribution footer on all pages

**Theme System**
- Light / Dark / System theme switching via `ThemeProvider`
- Theme preference persisted to `localStorage`
- Full CSS custom property token set for both light and dark modes injected on `<html>`
- Fixed Tailwind v4 dark mode — added `@variant dark (&:where(.dark, .dark *))` to `globals.css` so `dark:` utility classes are controlled by the `.dark` class rather than the OS media query

**Dashboard**
- Stats cards with live sparkline trend charts for Content Entries, Media Files, Active Extensions, and Users
- Content Activity bar chart showing entries created over the last 30 days with hover tooltips
- Recent Content feed showing latest entries across all content types with author avatars and status badges
- Recent Activity timeline showing user actions across the site
- Quick Actions grid with one-click links to common tasks (New Content, New Page, Upload Media, Install Extension, Manage Types, Settings)
- Storage Usage widget showing breakdown by file type (Images, Videos, Documents, Audio) with upgrade prompt
- System Health widget showing real-time status of Database, Cache, Extensions, and API Gateway

**Pages**
- `/` — Dashboard with all widgets above
- `/content` — Content type overview grid with entry counts and field counts
- `/content/types` — Content Types manager with field schema viewer and Browse/Add Entry actions
- `/content/types/new` — Schema builder for creating new content types with field editor
- `/content/[slug]` — Entry list view per content type with status badges and pagination
- `/content/[slug]/new` — Entry creation form driven by content type schema
- `/content/[slug]/[id]` — Entry edit form with field validation and auto-save
- `/pages` — Visual page builder list with status badges (Published, Draft, Scheduled, Archived) and block counts
- `/pages/new` — Page creation with block picker
- `/pages/[id]` — Full drag-and-drop page builder with live preview panel
- `/media` — Media Library with folder tree, file grid, drag-and-drop upload zone, and search
- `/extensions` — Installed extensions list with enable/disable toggles, update banners, settings and uninstall actions, and Bazarix Marketplace deep link
- `/themes` — Theme manager with installed theme cards, active indicator, Activate button, and Token Editor tab; Bazarix Themes deep link
- `/users` — Team members table with role badges, status, last-seen timestamps, and invite user action
- `/billing` — Subscription plan display, Support Plan upgrade cards (Yearly / Monthly), and attribution removal status
- `/billing/checkout` — Checkout flow with plan selector, fee breakdown (Platform Service Fee displayed pre-payment per ToS), and Stripe redirect
- `/settings` — Tabbed settings panel: General, Email (SMTP), Storage, API Keys, Installation Info

**UI Component Library**
- `button`, `card`, `input`, `badge`, `avatar`, `dialog`, `dropdown-menu`, `tabs`, `toast`, `data-table`, `form-field` — shadcn/ui-style component set with full dark mode support

**Visual Page Builder**
- 28-block drag-and-drop page builder with live side-by-side preview
- Block categories: Layout (`section`, `container`, `grid-2col`, `grid-3col`, `grid-4col`, `spacer`, `divider`), Content (`heading`, `paragraph`, `rich-text`, `image`, `video`, `button`, `link`), Data (`content-list`, `content-grid`, `content-detail`), Forms (`contact-form`, `newsletter`, `custom-form`), Navigation (`navbar`, `footer`, `breadcrumb`, `sidebar-nav`), Media (`hero`, `gallery`, `carousel`, `banner`), Advanced (`html`, `code`, `embed`, `map`)
- Block property editor with real-time style and prop updates
- Block palette with category tabs and drag-to-canvas interaction
- `BlockSettings` panel: text, color, spacing, border, and advanced class/ID overrides

**AI Assistant**
- Embedded AI panel with swappable LLM provider configuration
- Provider support: OpenAI, Claude (Anthropic), Gemini, Ollama (local)
- Chat interface with markdown rendering (bold, italic, code blocks, lists, headers, links)
- Prompt suggestions for common CMS tasks

**Billing UI**
- `FeeBreakdown` component — full Platform Service Fee formula display ($0.50 + 10%) required pre-checkout per ToS
- `InvoiceTable`, `PlanCard`, `SubscriptionStatus` components
- Checkout page with plan toggle (Yearly / Monthly with 25% monthly uplift), feature list, and Stripe redirect guard

**Bug Fixes — Admin Panel**
- Resolved webpack build error (`Can't resolve 'child_process'`) caused by `@volqan/core` barrel import pulling `sharp` (a Node.js-only native module) into the browser bundle — fixed by inlining marketplace URLs in `extensions/page.tsx` and `themes/page.tsx` and adding `sharp: false` / `detect-libc: false` webpack aliases for client builds in `next.config.ts`; removed `transpilePackages: ['@volqan/core']` which was the root cause of core being traversed by webpack
- Fixed React hydration mismatch on the dashboard — `ContentChart` was calling `Math.random()` and `new Date()` at module scope, producing different values on server and client; moved data generation into `useState` + `useEffect` so it only runs after hydration
- Added `public/favicon.svg` (Volqan logo — orange-to-red gradient M/volcano mark with flame and sparks) and wired it via `metadata.icons` in `app/layout.tsx` to resolve the 404 on `/favicon.ico`
- Fixed stat card percentage badges invisible in light mode — root cause was Tailwind v4 defaulting `dark:` variants to `@media (prefers-color-scheme: dark)` regardless of the `.dark` class on `<html>`

---

### Added — Core Runtime (`packages/core`) — Phase 1 & 2

**Extension Runtime**
- `sandbox.ts` — timeout-guarded extension execution with structured `SandboxError`
- `context-factory.ts` — per-extension isolated config, event bus, and registration API
- `lifecycle.ts` — install / uninstall / enable / disable / boot lifecycle with persistence adapter
- `registry.ts` — directory scanning and in-memory extension registry

**Theme Runtime**
- `applicator.ts` — CSS token flattening, stylesheet generation, DOM injection, and hot-swap
- `registry.ts` — directory scanning and active theme management
- `preview.ts` — temporary theme preview with auto-restore and diff

**AI Manager (`packages/core/src/ai`)**
- `AIManager` with pluggable provider interface
- Providers: OpenAI (`gpt-4o`), Anthropic Claude (`claude-3-5-sonnet`), Google Gemini, Ollama (local models)
- Streaming and non-streaming chat completion support
- Unified `AIMessage` and `AIStreamChunk` types

**Billing (`packages/core/src/billing`)**
- `plans.ts` — Support Plan definitions (Yearly $48/yr, Monthly $5/mo with 25% uplift)
- `checkout.ts` — Stripe Checkout Session creation with pre-populated fee metadata
- `subscription-manager.ts` — subscription CRUD, status queries, renewal tracking
- `webhook-handler.ts` — handles 8 Stripe webhook event types: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`, `customer.updated`, `payment_intent.payment_failed`
- `fee-calculator.ts` — Platform Service Fee: `$0.50 + 10%` of plan price

**License & Installation (`packages/core/src/license`)**
- `api.ts` — Bazarix license API client: check, activate, deactivate endpoints
- `checker.ts` — License verification with caching and grace period
- `installation.ts` — Installation ID generation, registration, and tracking
- `api-constants.ts` — Bazarix API base URL and endpoint paths

**Pages Repository (`packages/core/src/pages`)**
- `repository.ts` — CRUD operations for page records
- `types.ts` — `VolqanPage`, `PageBlock`, `PageStatus`, and builder type definitions

**Deep Link Integration (`packages/core/src/extensions`)**
- `deep-link.ts` — `buildMarketplaceURL()`, `buildThemeURL()`, `parseInstallURL()` helpers for Bazarix deep links
- Browse Marketplace / Browse Themes buttons wired in admin Extensions and Themes pages

---

### Added — CLI (`packages/cli`) — Phase 1 & 3

**`create-volqan-app` scaffolding**
- Interactive prompts (readline, zero external dependencies)
- Database adapter selection: PostgreSQL, MySQL, SQLite
- Auth provider selection: JWT, NextAuth, Clerk
- Generates: `package.json`, `tsconfig.json`, `.env`, `volqan.config.ts`, Prisma schema
- Colored ANSI logger, automated `pnpm install` + `prisma migrate dev` on scaffold completion

**`volqan create` sub-commands (Phase 3)**
- `volqan create extension <name>` — scaffolds a complete extension project with `defineExtension()` boilerplate, package.json, tsconfig, and README
- `volqan create theme <name>` — scaffolds a complete theme project with `defineTheme()` boilerplate, token definitions, and README

---

### Added — Extension SDK (`packages/extension-sdk`) — Phase 3

- `VolqanExtensionBase` abstract class with typed lifecycle hook stubs
- `defineExtension()` functional API for declaring extensions without subclassing
- Registration helpers: `registerRoute`, `registerAdminPage`, `registerContentType`, `registerAPIEndpoint`
- `hooks.ts` — `useExtensionConfig`, `useExtensionEvents`, `useContentHook` React hooks
- `testing.ts` — `createTestContext()` and `mockVolqanApp()` test utilities
- Full TypeScript types with JSDoc for all public surface area
- `README.md` with quick-start guide and API overview

---

### Added — Theme SDK (`packages/theme-sdk`) — Phase 3

- `VolqanThemeBase` abstract class with slot override system
- `defineTheme()` functional API with typed CSS token definitions
- Component override system: register custom React components per slot
- `createPreviewContext()` — SSR-safe theme preview context for marketplace screenshots
- `README.md` with quick-start guide and token reference

---

### Added — Official Extensions — Phase 2

**Blog (`extensions/blog`)**
- Post editor with rich text, featured image, SEO fields, categories, and tags
- Post list with bulk actions, status filters (Published / Draft / Scheduled)
- RSS feed generator (`rss.ts`) — valid RSS 2.0 output with per-post metadata
- `VolqanExtension` integration: `onBoot` registers content type and API routes

**SEO (`extensions/seo`)**
- Meta analyzer with per-field scoring (title length, description length, keyword density)
- Sitemap generator — dynamic XML sitemap from content entries and pages
- `robots.txt` builder with allow/disallow rule editor
- `SEOPanel` React component embeds into content entry edit forms

**Forms (`extensions/forms`)**
- Visual form builder with drag-and-drop field ordering
- Field types: text, email, phone, textarea, select, checkbox, radio, file upload, date
- `FormRenderer` — runtime form rendering with client-side validation
- Submission handler with storage adapter and webhook forwarding

---

### Added — Official Themes — Phase 2

**Default Theme (`themes/default`)**
- Blue/light professional design with Inter typeface
- Full CSS custom property token set wired to `volqan-color-*` variables
- Component overrides for card, button, input, navbar, and footer

**Minimal Theme (`themes/minimal`)**
- Dark/emerald modern aesthetic with JetBrains Mono accent
- High-contrast dark tokens, subtle animations, condensed spacing

---

### Added — Docker & Infrastructure — Phase 1

- Multi-stage `Dockerfile` (deps → build → runner) with non-root user for security
- `docker-compose.yml` — development setup with hot-reload volume mounts and PostgreSQL healthcheck
- `docker-compose.prod.yml` — production setup with restart policies, resource limits (`mem_limit: 512m`), and a `pg-backup` service with daily backup rotation

---

### Added — Developer Documentation — Phase 3

- `docs/developer-guide.md` — developer hub linking all SDK and API docs
- `docs/extensions/getting-started.md` — prerequisites, install, first extension walkthrough
- `docs/extensions/api-reference.md` — full `VolqanExtension` interface, `ExtensionContext` API, all lifecycle hooks, admin UI integration, API routes, GraphQL, content hooks, migrations
- `docs/extensions/publishing.md` — Bazarix Marketplace submission, review process, versioning
- `docs/extensions/examples.md` — annotated real-world extension examples (blog, payments, analytics)
- `docs/themes/getting-started.md` — theme scaffolding, token system, first theme walkthrough
- `docs/themes/api-reference.md` — `VolqanTheme` interface, design token system, component overrides
- `docs/themes/publishing.md` — theme submission guide and preview requirements

---

### Changed

- Replaced all `volqan.dev` / `bazarix.dev` domain references with `volqan.link` / `bazarix.link` across CLI templates, core auth constants, and documentation
- Added Volqan logo (`logo.png`) to repository root and updated `README.md` header
- Updated `packages/admin/tsconfig.json` — stricter compiler options, formatted consistently
- `packages/core/src/auth/jwt.ts` — updated issuer constant from `volqan.dev` to `volqan.link`

---

---

## [0.0.1] — April 2026

**Initial public repository. No runnable code yet — this release establishes the legal, structural, and interface foundation that all subsequent development builds on.**

### Added

**Repository and Project Structure**
- Initialized pnpm workspace monorepo with the following package layout:
  - `packages/core/` — Core framework engine (placeholder)
  - `packages/admin/` — Next.js 15 admin panel application (placeholder)
  - `packages/cli/` — `npx create-volqan-app` CLI (placeholder)
  - `packages/extension-sdk/` — Extension SDK for developers (placeholder)
  - `packages/theme-sdk/` — Theme SDK for developers (placeholder)
  - `packages/cloud-bridge/` — Cloud and licensing bridge (placeholder)
- Root `package.json` with workspace configuration and shared scripts
- `pnpm-workspace.yaml` defining the monorepo workspace glob patterns
- `tsconfig.json` base TypeScript configuration (strict mode, ESNext target, bundler module resolution)

**GitHub Configuration**
- `.github/ISSUE_TEMPLATE/bug_report.yml` — Structured bug report template
- `.github/ISSUE_TEMPLATE/feature_request.yml` — Feature request template
- `.github/ISSUE_TEMPLATE/extension_proposal.yml` — Extension proposal template
- `.github/DISCUSSION_TEMPLATE/general.yml` — General discussion starter template
- `.github/DISCUSSION_TEMPLATE/show-and-tell.yml` — Project showcase template
- `.github/DISCUSSION_TEMPLATE/extension_ideas.yml` — Extension idea proposal template
- `.github/workflows/ci.yml` — CI workflow: lint and type-check on every pull request
- `.github/workflows/deploy-docs.yml` — Deploy `/docs` to GitHub Pages on push to `main`
- `.github/workflows/release.yml` — Semantic versioning and release creation workflow
- `.github/workflows/attribution-check.yml` — Attribution license validation check
- `.github/FUNDING.yml` — GitHub Sponsors configuration pointing to `github: ReadyPixels`

**Legal Documents** (published to GitHub Pages via `/docs/legal/`)
- `docs/legal/terms-of-service.md` — Full Terms of Service including attribution requirement, Platform Service Fee formula and justification, Support Plan subscription terms, Wyoming USA governing law, binding arbitration clause, and Stripe payment processor disclaimer
- `docs/legal/privacy-policy.md` — Privacy Policy covering collected data (email, installation ID, Stripe customer ID, usage analytics), GDPR and CCPA compliance statements, data retention schedule, no-sale-of-data commitment, and deletion request procedure
- `docs/legal/refund-policy.md` — Refund Policy: 14-day prorated refund for yearly plans, non-refundable monthly plans, non-refundable Platform Service Fees, immediate revocation of attribution removal on refund
- `docs/legal/attribution-policy.md` — Attribution Policy: required footer text, valid attribution definition, license verification procedure, purchase path for attribution removal, legal consequences of unauthorized removal
- `docs/legal/fee-disclosure.md` — Fee Disclosure: complete `$0.50 + 10% + $0.50 PayPal` formula, worked numeric examples across multiple price points, PayPal surcharge disclosure, pre-payment display confirmation
- `docs/legal/contributor-license-agreement.md` — CLA: IP assignment of contributions to the project owner, warranty of original work, agreement that contributions may be used in commercial derivatives

**License**
- `LICENSE-ATTRIBUTION.md` — Open Core Attribution License v1.0. Grants free use with attribution requirement. Attribution may be removed exclusively for active Support Plan subscribers validated by the Bazarix license API. Commercial redistribution of the core framework requires written permission. Extensions and themes built using the framework may be sold freely.

**TypeScript Interfaces**
- `VolqanExtension` interface defined and locked in `packages/extension-sdk/src/types.ts`:
  - Core identity fields: `id`, `version`, `name`, `description`, `author`
  - Lifecycle hooks: `onInstall`, `onUninstall`, `onEnable`, `onDisable`, `onBoot`
  - Admin UI integration: `adminMenuItems`, `adminPages`, `adminWidgets`, `adminSettings`
  - API surface: `apiRoutes`, `graphqlSchema`, `contentHooks`, `databaseMigrations`
  - Marketplace metadata: `marketplace` (category, tags, screenshots, demo URL, price, license key)
- `VolqanTheme` interface defined and locked in `packages/theme-sdk/src/types.ts`:
  - Identity: `id`, `name`, `version`
  - Design token system: `tokens.colors`, `tokens.typography`, `tokens.spacing`, `tokens.radius`, `tokens.shadows`, `tokens.animation`
  - Component overrides: `components` record
  - Marketplace metadata: `marketplace` (category, preview URL, price, license key)

**Documentation** (published to GitHub Pages via `/docs/`)
- `docs/index.md` — Documentation landing page with hero section, feature overview, quick start, and community links
- `docs/getting-started.md` — Complete getting started guide: prerequisites, `npx create-volqan-app`, project structure, configuration reference, development mode, production build, Docker deployment, first content model, first page, first extension
- `docs/pricing.md` — Pricing page: free tier explanation, Support Plan tiers, Platform Service Fee formula with worked examples, marketplace revenue split, FAQ
- `docs/roadmap.md` — Full public roadmap: all phases 0–5 with status indicators, revenue streams table
- `docs/changelog.md` — This file
- `docs/extension-api.md` — Complete Extension API documentation: `VolqanExtension` interface reference, `ExtensionContext` API, lifecycle hooks, admin UI integration, API routes, GraphQL schema extension, content hooks, database migrations, marketplace metadata, worked example, SDK setup guide
- `docs/theme-api.md` — Complete Theme API documentation: `VolqanTheme` interface reference, design token system, CSS custom properties injection, component overrides, marketplace metadata, worked example, SDK setup guide

**Project Files**
- `README.md` — Project overview, quick start, feature list, tech stack, license summary, community links
- `CONTRIBUTING.md` — Contribution guide: setup, coding standards, PR process, CLA acknowledgment
- `CODE_OF_CONDUCT.md` — Contributor Covenant Code of Conduct v2.1
- `SECURITY.md` — Security vulnerability reporting policy
- Extension stubs: `extensions/blog/`, `extensions/ecommerce/`, `extensions/forms/`, `extensions/seo/`
- Theme stubs: `themes/default/`, `themes/minimal/`
- Example application stubs: `examples/blog/`, `examples/saas-dashboard/`, `examples/ecommerce/`, `examples/portfolio/`

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
