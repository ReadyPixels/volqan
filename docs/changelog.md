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

### Added — May 21, 2026, 9:57 AM

**VOLQ-007** · Wired real SQLite database for local development. Converted `packages/core/prisma/schema.prisma` provider from `postgresql` to `sqlite` (enums and Json fields replaced with `String` for SQLite compatibility; comments preserve valid values). Created `packages/core/.env` (`DATABASE_URL=file:./prisma/dev.db`) and `packages/admin/.env.local` (`DATABASE_URL=file:C:/...absolute path.../dev.db` — absolute path required because Next.js detects the monorepo root as the workspace root). Ran `prisma db push` (creates `packages/core/prisma/dev.db`, 258KB) and `prisma db seed` (creates admin user `admin@volqan.link` and 8 default settings). Created `packages/admin/src/lib/db.ts` — dev-singleton PrismaClient using the workspace's hoisted `@prisma/client`. Created `packages/admin/src/app/api/content-types/route.ts` — GET (list with entry count) and POST (create with slug uniqueness check). Updated `packages/admin/src/app/content/types/page.tsx` to fetch from `/api/content-types` instead of mock data (shows loading state, empty state, and real records). Updated `packages/admin/src/app/content/types/new/page.tsx` to POST to the API on save (slug derived from name). Browser-verified: created "Article" content type; survived full page refresh.

---

### Added — May 21, 2026, 9:33 AM

**VOLQ-006** · Implemented stateless HMAC-SHA256 stub authentication for the admin panel. Created `packages/admin/src/lib/stub-auth.ts` (Web Crypto API, Edge-compatible token sign/verify), `packages/admin/src/app/api/auth/login/route.ts` (POST: validates `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars, sets `volqan_session` httpOnly cookie), `packages/admin/src/app/api/auth/logout/route.ts` (POST: clears cookie), `packages/admin/src/app/(auth)/login/page.tsx` (email + password form with inline error state), and `packages/admin/src/middleware.ts` (Next.js Edge middleware: reads and verifies `volqan_session`, redirects to `/login` if missing or invalid, excludes `/login` and `/api/auth/` from protection). The `AdminShell` is updated to detect the `/login` pathname via `usePathname()` and render a clean full-page centered layout without the sidebar or topbar. The top bar "Sign out" button now calls `POST /api/auth/logout` and redirects to `/login`. Default credentials: `admin@volqan.link` / `changeme` (overridable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars).

---

### Fixed — May 20, 2026, 4:50 PM

**VOLQ-001** · Billing: Corrected yearly plan savings badge from "Save 17% vs monthly" to "Save 20% vs monthly". The correct calculation is $5/mo × 12 = $60/yr vs $48/yr → 20% savings. Updated both the `savingsBadge` prop and the introductory paragraph in `packages/admin/src/app/billing/page.tsx`.

**VOLQ-002** · Attribution footer now correctly hidden when attribution removal is active. Extracted `MOCK_SUBSCRIPTION` into `packages/admin/src/lib/mock-subscription.ts` as a shared module. `AdminShell` now reads `attributionRemoved` from this module and conditionally omits `<ClientAttributionFooter />`. Both `AdminShell` and `BillingPage` now use the same source of truth.

**VOLQ-003** · ContentChart total count is now deterministic across page loads. Replaced `Math.random()` in `generateData()` with a seeded integer hash (`(seed * 1103515245 + 12345) & 0x7fffffff`) anchored to a fixed reference date (May 20, 2026), eliminating the jarring per-load variation (was: 186–214; now: always 195).

**VOLQ-004** · "View Live Site" Quick Action no longer links to the admin root (`/`). Now links to `https://example.com` (the default mock site URL from Settings). Will resolve to the user-configured Site URL once the Settings API is wired.

**VOLQ-005** · `docs/roadmap.md` updated to accurately reflect the current build state. Phase 1 items that have been implemented are now marked ✅; items with UI-only or partial implementation are marked 🔄; Phase 2 built items (page builder, AI assistant, dark mode, mobile, official extensions, Stripe UI) are now ✅; Phase 3 SDK items are 🔄 (built, not yet published). Last-updated date corrected from April 2026 to May 20, 2026.

### Added — May 20, 2026, 4:50 PM

**VOLQ-000** · Created `docs/Tasks.md` — project-level task tracker with VOLQ-NNN IDs, acceptance criteria, and priority order aligned to the public roadmap. Covers bug fixes VOLQ-001 through VOLQ-005, Phase 1 blockers (auth, database), and planned Phase 2/3 milestones.

### Security

**Admin Panel (`packages/admin`)**
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
| v1.5.0 | Phase 4 | June 2027 | Enterprise features — i18n, workflows, audit log, SSO, Redis |

---

[0.0.1]: https://github.com/ReadyPixels/volqan/releases/tag/v0.0.1
[Unreleased]: https://github.com/ReadyPixels/volqan/compare/v0.0.1...HEAD
