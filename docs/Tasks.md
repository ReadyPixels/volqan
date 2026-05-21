---
title: Tasks — Volqan
description: Active and planned work items for the Volqan project, tracked with VOLQ-NNN IDs.
---

# Tasks

Work items are tracked with VOLQ-NNN identifiers. Status: **Open** → **In Progress** → **Done**.

> **Priority order** (from roadmap): v0.1.0-alpha release → Analytics widget → WCAG audit → Docs on GitHub Pages → v0.5.0-beta + Product Hunt → Phase 3 npm publish.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| 🔴 Open | Not yet started |
| 🔵 In Progress | Actively being worked on |
| ✅ Done | Complete and browser-verified |

---

## Bug Fixes (discovered during browser testing — May 20, 2026)

### VOLQ-001 — Billing: "Save 17% vs monthly" savings badge is wrong

**Status:** ✅ Done — May 20, 2026, 3:55 PM  
**File:** `packages/admin/src/app/billing/page.tsx:174`  
**Description:** The Yearly plan card displays `savingsBadge="Save 17% vs monthly"`. The correct savings calculation is: $5/mo × 12 = $60/yr vs $48/yr → ($60 − $48) / $60 = **20%**. The 17% figure is wrong and misleads users.  
**Acceptance criteria:** The badge reads "Save 20% vs monthly".

---

### VOLQ-002 — Attribution footer shows even when attribution removal is active

**Status:** ✅ Done — May 20, 2026, 4:05 PM  
**File:** `packages/admin/src/components/layout/AdminShell.tsx`  
**Description:** The billing page shows "Attribution removal active — The 'Powered by Volqan' footer is hidden on your site." But `AdminShell.tsx` always renders `<ClientAttributionFooter />` unconditionally, so the footer still appears on every page. The mock data `attributionRemoved: true` is never checked by the shell.  
**Acceptance criteria:** When the mock `attributionRemoved` flag is true (and later when the real license API says so), the attribution footer is not rendered.

---

### VOLQ-003 — ContentChart total count is random on every page load

**Status:** ✅ Done — May 20, 2026, 4:15 PM  
**File:** `packages/admin/src/components/dashboard/ContentChart.tsx:16–28`  
**Description:** `generateData()` calls `Math.random()` inside `useEffect`. Every page load produces different totals (observed 186, 193, 211). This is visually jarring and creates a false inconsistency with the StatsCard "1,248 Content Entries" stat. Data should be deterministic mock data.  
**Acceptance criteria:** The ContentChart shows the same bar data on every load. The total displayed (e.g. 193) matches a fixed seed and is not random.

---

### VOLQ-004 — "View Live Site" Quick Action links to the admin panel itself

**Status:** ✅ Done — May 20, 2026, 4:20 PM  
**File:** `packages/admin/src/components/dashboard/QuickActions.tsx:114–122`  
**Description:** The "View Live Site" anchor has `href="/"` which opens the admin panel at `/` in a new tab. It should link to the user's public site URL (from Settings). As a placeholder, it should open `https://example.com` (the default site URL mock) or show a tooltip that the URL needs to be configured.  
**Acceptance criteria:** "View Live Site" opens `https://example.com` (the mock site URL) in a new tab, or shows a `[not configured]` state when the site URL is the default placeholder.

---

## Roadmap Alignment

### VOLQ-005 — roadmap.md does not reflect actual build state

**Status:** ✅ Done — May 20, 2026, 4:25 PM  
**File:** `docs/roadmap.md`  
**Description:** The roadmap shows all Phase 1 items as 📋 Planned and all Phase 2 items as 📋 Planned. In reality:
- Phase 1: Admin UI, Core runtime, CLI, Extension engine, Theme engine, Media manager UI, Page builder, Attribution footer, Docker, and Billing UI are **all built** (see changelog).
- Phase 2: Page builder, Dashboard widgets, AI assistant panel, Dark/light mode, Mobile admin, Stripe billing UI, and official extensions (Blog, SEO, Forms) are **all built**.
- Phase 3: Extension SDK, Theme SDK, CLI `create extension/theme` subcommands, and developer documentation are **all built**.
- Still genuinely missing (Phase 1): Live database integration, real authentication/login, real API wiring.

**Acceptance criteria:** roadmap.md accurately marks completed items as ✅ and in-progress items as 🔄. Items that are UI-only (no real backend) remain 🔄 or 📋 as appropriate.

---

## Phase 1 — Core MVP Gaps (v0.1.0-alpha blockers)

### VOLQ-006 — No login page / authentication guard

**Status:** ✅ Done — May 21, 2026, 9:33 AM  
**Priority:** P0 — v0.1.0-alpha blocker  
**Description:** All admin routes (`/`, `/content`, `/media`, `/billing`, etc.) are publicly accessible — no authentication required. There is no `/login` route and no `middleware.ts`. The core auth system (`packages/core/src/auth/`) is fully built (bcrypt, JWT, session, middleware helpers) but not wired into the admin panel.

**Implementation plan:**
1. `packages/admin/src/lib/stub-auth.ts` — HMAC-SHA256 helpers (Web Crypto API, no deps) for signing/verifying a stateless session token. Credentials: `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars (fallback: `admin@volqan.link` / `changeme`).
2. `packages/admin/src/app/api/auth/login/route.ts` — POST handler: verifies credentials, signs token, sets `volqan_session` httpOnly cookie.
3. `packages/admin/src/app/api/auth/logout/route.ts` — POST handler: clears the cookie.
4. `packages/admin/src/app/(auth)/login/page.tsx` — Login form (email + password, client component, calls the login API, redirects on success).
5. `packages/admin/middleware.ts` — Next.js Edge middleware: reads `volqan_session` cookie, verifies HMAC, redirects to `/login` if missing/invalid. Excludes `/login` and `/api/auth/` paths.

**Acceptance criteria:**
- Visiting `http://localhost:3099/` without a session cookie redirects to `/login`
- Submitting `admin@volqan.link` / `changeme` on the login form redirects to `/` (dashboard)
- The top bar "Sign out" button successfully logs out and returns to `/login`
- Wrong credentials show an error message on the login form

---

### VOLQ-007 — All data is mock / hardcoded — no real database integration

**Status:** ✅ Done — May 21, 2026, 9:57 AM  
**Priority:** P0 — v0.1.0-alpha blocker  
**Description:** Every page uses hardcoded mock data. Content types, entries, media files, users, extensions, pages, billing, and system health are all static fixtures. The Prisma schema exists in `packages/core/prisma/schema.prisma` but is not wired to any admin API routes.

**Implementation plan:**
1. Change Prisma schema provider to `sqlite` (for local dev; production uses PostgreSQL).
2. Create `packages/core/.env` with `DATABASE_URL=file:./dev.db`.
3. Run `pnpm --filter @volqan/core db:push` to create the schema.
4. Run `pnpm --filter @volqan/core db:seed` to seed the admin user (`admin@volqan.link` / `changeme`).
5. Create `packages/admin/src/app/api/content-types/route.ts` — GET (list) and POST (create) endpoints backed by Prisma.
6. Update `packages/admin/src/app/content/types/page.tsx` to fetch from the API instead of mock data.
7. Update `packages/admin/src/app/content/types/new/page.tsx` to POST to the API on save.

**Acceptance criteria:**
- Running `pnpm --filter @volqan/core db:push` succeeds
- `dev.db` file is created and the schema is applied
- Creating a content type in the admin UI persists to SQLite
- After a full page refresh, the new content type still appears in the list

---

## Phase 2 — Planned Features

### VOLQ-008 — Analytics overview widget missing from dashboard

**Status:** ✅ Done — May 21, 2026, 4:22 PM  
**Priority:** Phase 2 planned  
**Description:** The roadmap commits to an analytics overview widget showing page views, API requests, and user activity. The dashboard currently has Stats, ContentChart, QuickActions, StorageUsage, and SystemHealth widgets but no analytics traffic widget.

**Implementation plan:**
1. `packages/admin/src/components/dashboard/AnalyticsWidget.tsx` — `'use client'` card with:
   - Three metric tiles: Page Views (30-day total + % change), API Requests (30-day), Active Users (daily unique)
   - 30-day sparkline for page views using the same pure-SVG approach as StatsCards
   - Deterministic mock data (seeded by day index, anchored to May 20 2026)
   - Footer note: "Connect a provider in Settings → Analytics"
2. Import and place `<AnalyticsWidget />` in `packages/admin/src/app/page.tsx` between `<ContentChart />` and the main grid

**Acceptance criteria:**
- A new `AnalyticsWidget` component exists on the dashboard
- Shows page views (mock data acceptable for pre-launch), API requests count, and user activity sparkline
- Wires to a real analytics provider (Plausible, GA4, or internal) when configured

---

### VOLQ-009 — WCAG 2.1 AA accessibility audit and remediation

**Status:** ✅ Done — May 21, 2026, 4:45 PM  
**Priority:** Phase 2 planned  
**Description:** No accessibility audit has been performed. The admin panel uses `hsl(var(--))` colours whose contrast ratios under both light and dark themes have not been verified. Known areas to check: muted-foreground text on card backgrounds, badge text contrast, focus indicators on interactive elements, missing `aria-label` on icon-only buttons.

**Issues found and resolved:**
- A1: Icon-only buttons in TopBar (theme toggle, notifications) have `aria-label` ✓
- A2: Login page inputs — `autocomplete` added in VOLQ-006 ✓
- A3: ✅ Added `aria-current="page"` to active links in `Sidebar.tsx` (nav links + child links)
- A4: ✅ Global `:focus-visible` rule already set — `outline: 2px solid hsl(var(--ring)); outline-offset: 2px` in `globals.css`
- A5: ✅ Decorative icons in `QuickActions.tsx` marked `aria-hidden="true"`
- A6: CSS variable contrast — `--muted-foreground` is `oklch(0.556 0 0)` (gray 55% lightness), meets 4.5:1 on card background
- A7: ✅ Added `aria-current="page"` to active `<Link>` items in `MobileNav.tsx`
- A8: ✅ `QuickActions` card links now have compound `aria-label="${label} — ${description}"`
- A9: ✅ `ContentChart` SVG now has `role="img"` and `aria-label` describing totals
- A10: ✅ MetricTile trend badge already has `aria-label` describing direction and % (added in VOLQ-008)

**Acceptance criteria:**
- All text meets 4.5:1 contrast ratio (normal text) or 3:1 (large text/UI components) under WCAG 2.1 AA
- All interactive elements are keyboard-navigable with visible focus rings
- No critical or serious axe-core violations remain

---

## Phase 1 Release

### VOLQ-010 — Prepare and publish v0.1.0-alpha GitHub release

**Status:** ✅ Done — May 21, 2026, 5:05 PM  
**Priority:** Phase 1 goal (June 2026)  
**Description:** The first GitHub release tag `v0.1.0-alpha` has not been published. Blockers: VOLQ-006 (auth) and VOLQ-007 (database) must be resolved first. The release notes should match the changelog and roadmap.

**Implementation plan:**
1. Verify `pnpm build` passes clean in `packages/admin`
2. Check and update version in `packages/admin/package.json` to `0.1.0-alpha`
3. Update `docs/roadmap.md` to mark Phase 1 items complete
4. Write release notes in `docs/release-notes-v0.1.0-alpha.md`
5. Commit, tag `v0.1.0-alpha`, push tag

**Acceptance criteria:**
- Auth and database wired (VOLQ-006, VOLQ-007 done) ✅
- `pnpm build` passes clean with no errors
- Version bumped to `0.1.0-alpha` in admin `package.json`
- Git tag `v0.1.0-alpha` pushed
- `roadmap.md` updated to show v0.1.0-alpha ✅

---

## Phase 2 Release

### VOLQ-011 — Prepare v0.5.0-beta release and soft Product Hunt launch

**Status:** 🔴 Open  
**Priority:** Phase 2 goal (August 2026)  
**Description:** After completing the Phase 2 feature set (analytics widget, accessibility audit, full documentation), publish the v0.5.0-beta release and execute the Product Hunt soft launch.  
**Acceptance criteria:**
- VOLQ-008 (analytics widget) done
- VOLQ-009 (WCAG audit) done
- VOLQ-010 (docs on GitHub Pages) complete
- Git tag `v0.5.0-beta` published
- Product Hunt listing live

---

## Phase 3 — npm Publish

### VOLQ-012 — Publish @volqan/extension-sdk and @volqan/theme-sdk to npm

**Status:** 🔴 Open  
**Priority:** Phase 3 planned (September–December 2026)  
**Description:** The Extension SDK and Theme SDK packages exist in `packages/extension-sdk/` and `packages/theme-sdk/` but are not yet published to npm. The CI workflow at `.github/workflows/release.yml` guards publish with `NPM_CONFIGURED`.  
**Acceptance criteria:**
- `@volqan/extension-sdk` published to npm (public)
- `@volqan/theme-sdk` published to npm (public)
- Versions follow semver and match the monorepo tag
- README and API documentation are up to date

---

*Last updated: May 20, 2026. Bugs VOLQ-001 through VOLQ-005 found during browser testing session.*
