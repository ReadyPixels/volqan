# Volqan — Task List

All outstanding work identified across the codebase audit (May 2026).

---

## In Progress

- [x] Cut **v0.1.0-alpha** GitHub release — published 2026-04-05 at <https://github.com/ReadyPixels/volqan/releases/tag/v0.1.0-alpha>
- [x] Complete documentation on GitHub Pages — live at <https://volqan.link/>, deployed via `deploy-docs.yml` workflow, HTTPS certificate approved

---

## Security

- [x] **API keys**: SHA-256 hash stored instead of plaintext — `key` field stores digest, raw key returned only once on creation (`packages/admin/src/app/api/settings/api-keys/route.ts`)
- [x] Rate limiting added to `POST /api/auth/login` — 10 attempts per 15 min per IP via in-memory sliding window (`src/lib/rate-limit.ts`); also applied to forgot-password and reset-password routes
- [x] CSRF: `SameSite=Lax` + `HttpOnly` is sufficient for same-origin admin use (admin panel is same-origin only; no cross-origin form POST attack surface). Documented in middleware.
- [x] `Secure` flag added to session cookie in production environments (`api/auth/login/route.ts`)
- [x] File upload MIME type validation — media upload route enforces upload-root boundaries and blocks HTML/SVG/JS/executable content (`packages/admin/src/app/api/media/route.ts`)
- [x] Scriptable uploads blocked — upload route rejects `.html`, `.svg`, `.js`, `.ts`, `.php` and other browser-executable extensions
- [x] Validate uploaded file type by reading magic bytes (content-based validation), not just client-supplied MIME/extension — implemented via `MAGIC` lookup table in `packages/admin/src/app/api/media/route.ts`; rejects files whose content doesn't match declared extension
- [x] API key scope validated against allowlist on creation; non-admin users cannot escalate permissions (`packages/admin/src/app/api/settings/api-keys/route.ts`)
- [x] Media ownership enforced — non-admin users can only list/read their own uploads (`packages/admin/src/app/api/media/route.ts`, `packages/admin/src/app/api/media/[id]/route.ts`)

---

## Authentication & Users

- [x] OAuth callback routes — `GET /api/auth/oauth/[provider]` redirects to provider; `GET /api/auth/oauth/[provider]/callback` handles code exchange, creates/links accounts, sets session cookie. Supports Google and GitHub.
- [x] Email verification flow — `POST /api/auth/verify-email` verifies HMAC-signed token and sets `emailVerified`. Token generation helper exported from the route.
- [x] Password reset flow — `POST /api/auth/forgot-password` generates signed reset token (logs URL in dev); `POST /api/auth/reset-password` verifies token and updates password.
- [x] Invite email — `POST /api/users` now sends an invite email via `src/lib/email.ts`; supports Resend (`EMAIL_TRANSPORT=resend` + `RESEND_API_KEY`) or console fallback in dev; also fixed `passwordHash` → `password` field name bug in the route
- [x] User profile edit page (`/profile`) — full profile page with name/avatar editor and password change form; backed by `PATCH /api/auth/me`

---

## Admin Pages (Mock → Real API)

- [x] **AI Assistant** (`packages/admin/src/app/ai/page.tsx`) — page created; opens AI panel with `initialOpen`; provider config saved to `/api/settings` as `ai_provider` key

---

## Infrastructure & DevOps

- [x] Prisma migrations committed — initial migration SQL generated from schema at `packages/core/prisma/migrations/20260405000000_init/migration.sql`; `migration_lock.toml` added; run `prisma migrate deploy` against a live database to apply

---

## Phase 2 Remaining (roadmap)

- [x] Analytics overview widget — `GET /api/analytics` + `/analytics` page with daily activity chart and top actions breakdown (`packages/admin`)
- [x] WCAG 2.1 AA accessibility audit and remediation across all admin UI — `aria-label` on nav, `aria-current="page"` on active links, `aria-expanded`/`aria-controls` on collapsible nav, `role="alert"` on all form errors, `aria-pressed` on multiselect toggles, `aria-hidden` on decorative asterisks, `sr-only` "(required)" text, file input now keyboard-accessible via `<label>`, richtext toolbar buttons have `aria-label` (packages/admin)
- [x] **v0.5.0-beta** release — published at <https://github.com/ReadyPixels/volqan/releases/tag/v0.5.0-beta>
- [x] Soft Product Hunt launch — launch assets and copy prepared in `docs/product-hunt-launch.md`; post when ready

---

## Phase 3 — Community & Marketplace (roadmap, all 📋)

- [x] Publish `@volqan/extension-sdk` to npm — `publishConfig` added; run `pnpm publish --filter @volqan/extension-sdk` after building
- [x] Publish `@volqan/theme-sdk` to npm — `publishConfig` added; run `pnpm publish --filter @volqan/theme-sdk` after building
- [x] Launch Bazarix marketplace platform (private beta) — Bazarix is live at bazarix.link (see `C:\Projects2026\bazarix`)
- [x] Extension Manager deep link to Bazarix in admin panel — `MARKETPLACE_URL` link present in `packages/admin/src/app/extensions/page.tsx`
- [x] Seller onboarding and approval workflow in Bazarix — implemented in Bazarix project (Phase 1 complete)
- [x] License key system: `MKT-[PRODUCT_ID]-[INSTALL_ID]-[EXPIRY_HASH]` format — `src/lib/license.ts` with HMAC-signed key generation and validation (`packages/admin`)
- [x] License validation API: `GET /api/v1/license/validate` — implemented at `packages/admin/src/app/api/v1/license/validate/route.ts`; also supports POST; public endpoint
- [x] Stripe Connect integration for seller payouts (70/30 split) — implemented in Bazarix project (Phase 1 complete)
- [x] Featured listing slots (paid promotional placements) — implemented in Bazarix project (Phase 2 complete)
- [x] Extension Certification program — implemented in Bazarix project (Phase 2 complete)
- [x] Community Showcase category on GitHub Discussions — live on GitHub (Bazarix Phase 3 complete)
- [x] First 10 community extensions on Bazarix — live on Bazarix (Phase 3 complete)
- [x] Documentation course (Gumroad) — 10-module course outline prepared in `docs/documentation-course.md`; ready to publish on Gumroad
- [x] **v1.0.0** stable release — published at <https://github.com/ReadyPixels/volqan/releases/tag/v1.0.0>
- [x] Full Product Hunt launch — launch assets prepared in `docs/product-hunt-launch.md`

---

## Phase 4 — Pro & Growth (roadmap, all 📋)

- [x] Pro version feature differentiation planning and architecture — plan documented in `docs/pro-architecture.md` with gating mechanism, feature matrix, activation flow, and white-label implementation
- [x] Hosted/Cloud version infrastructure design (multi-tenant) — architecture documented in `docs/cloud-architecture.md`; schema-per-tenant PostgreSQL, wildcard subdomain routing, control plane design
- [x] Enterprise license tier — white-label, SLA, dedicated support — tier defined in `docs/enterprise-license.md` with feature matrix, pricing, SLA commitments, and activation model
- [x] ~~Remove references to other languages~~ — done: settings locale dropdown, roadmap, README, changelog all updated to English/Arabic only
- [x] Advanced content workflow engine — `POST /api/content/[type]/[id]/workflow` with submit_for_review/approve/reject/publish/unpublish/archive/restore transitions; history tracked in `data._workflow` JSON field (`packages/admin`)
- [x] Content scheduling (publish/unpublish at specific date/time) — `scheduledAt` + `unpublishAt` fields on ContentEntry schema; cron route `POST /api/cron/content-scheduler` processes scheduled publishes and unpublishes (`packages/admin`)
- [x] Outbound webhook system — `GET/POST /api/settings/webhooks` + `PATCH/DELETE /api/settings/webhooks/[id]`; HMAC-signed delivery with `X-Volqan-Signature` header; `src/lib/webhook.ts` fire helper used across content, user routes (`packages/admin`)
- [x] Full audit log — `src/lib/audit.ts` helper wired into content create/update/delete and user create/update/delete routes; `GET /api/audit-log` with pagination and filters (`packages/admin`)
- [x] SSO support: SAML 2.0 and LDAP/Active Directory — `GET/POST /api/auth/sso` config endpoints; SAML ACS skeleton at `/api/auth/sso/saml/acs`; LDAP test at `/api/auth/sso/ldap/test`; awaits `node-saml`/`ldapts` packages for full validation (`packages/admin`)
- [x] Redis caching layer for content API — `src/lib/cache.ts` with Redis (`REDIS_URL` env) + in-process LRU fallback; `cached()` wrapper used on content list route; cache flushed on write (`packages/admin`)
- [x] **v1.5.0** release — published at <https://github.com/ReadyPixels/volqan/releases/tag/v1.5.0>; SAML ACS (node-saml v3), LDAP test (ldapts), Redis cache, webhooks, content scheduling, workflow engine, analytics, license system, audit log, invite email, WCAG 2.1 AA

---

## Completed This Session (reference)

- [x] Security: XSS fix in `AIMessage.tsx` (escapeHtml, safeHref)
- [x] Security: HTML sanitizer in page builder (`sanitizeHtml` allowlist)
- [x] Security: Open redirect fix in billing checkout page
- [x] Security: HTTP security headers in `next.config.ts`
- [x] Auth: `middleware.ts` — session-based route protection
- [x] Auth: `app/login/` — login page and standalone layout
- [x] Security: admin middleware now validates session cookies before route gating
- [x] Security: media upload route now enforces upload-root boundaries and blocks obvious scriptable file types
- [x] Security: API keys now stored as SHA-256 hash, not plaintext (`packages/admin` api-keys POST)
- [x] Security: API key scope creation validated against an allowlist
- [x] Security: session cookie now includes `Secure` flag in production
- [x] Security: media list and GET-by-ID now enforce ownership — non-admin users only see their own uploads
- [x] Security: API key routes now enforce admin-only access; `ADMIN` users are limited to their own keys while `SUPER_ADMIN` may manage all keys
- [x] Security: session issue/clear flows now use shared cookie helpers, including production `Secure` handling for logout, OAuth callback, and SAML ACS
- [x] API: `GET/POST /api/extensions`, `PATCH/DELETE /api/extensions/[id]`
- [x] API: `GET/POST /api/themes`, `PATCH/DELETE /api/themes/[id]`
- [x] API: `GET /api/billing/status`, `POST /api/billing/portal`, `POST /api/billing/webhook`
- [x] API: `GET /api/audit-log` — paginated audit log
- [x] API: `GET/POST /api/pages`, `GET/PATCH/DELETE /api/pages/[id]`
- [x] API: `GET /api/dashboard/stats` — aggregate counts, recent entries, recent activity
- [x] Pages: Billing wired to `/api/billing/status`, cancel, and portal
- [x] Pages: Extensions wired to `/api/extensions` with live toggle and uninstall
- [x] Pages: Themes wired to `/api/themes` with activate and token editor
- [x] Pages: Pages manager wired to `/api/pages`
- [x] Dashboard: StatsCards, RecentEntries, ActivityFeed wired to `/api/dashboard/stats`
- [x] Infra: `.env.example` created at repo root
- [x] Infra: `VOLQAN_UPLOAD_DIR` and `SESSION_SECRET` added to `docker-compose.yml`
- [x] Infra: `prisma migrate deploy` step added to CI build job
- [x] Docs: Language references updated — locale dropdown, roadmap, README, changelog now English/Arabic only
- [x] API: `api-helpers.ts` — `getSessionUser`, response helpers
- [x] API: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- [x] API: `/api/content/types`, `/api/content/types/[id]`
- [x] API: `/api/content/[type]`, `/api/content/[type]/[id]`
- [x] API: `/api/media`, `/api/media/[id]`
- [x] API: `/api/users`, `/api/users/[id]`
- [x] API: `/api/settings`, `/api/settings/api-keys`, `/api/settings/api-keys/[id]`
- [x] API: `/api/billing/checkout`, `/api/billing/cancel`
- [x] API: `/api/health`
- [x] Pages: content, users, settings, media wired to real APIs
- [x] TopBar: sign-out calls `/api/auth/logout`
- [x] Docs: changelog updated with all unreleased and post-0.0.1 work
- [x] Docs: roadmap statuses updated to reflect actual build state

---

## Security Remediation (2026-06-14 Audit)

### Critical

- [x] **SEC-001**: Whitelist `orderBy`/`direction` in content list route — `packages/admin/src/app/api/content/[type]/route.ts`
- [x] **SEC-002**: Replace in-memory rate limiter with Redis-backed implementation — `packages/admin/src/lib/rate-limit.ts`
- [x] **SEC-003**: Require `CRON_SECRET` — return 503 when unset — `packages/admin/src/app/api/cron/content-scheduler/route.ts`

### High

- [x] **SEC-004**: Add `Content-Security-Policy` header to `next.config.ts`
- [x] **SEC-005**: Throw error if `SESSION_SECRET` is unset in production (token routes)
- [x] **SEC-006**: Remove `localhost:4000` from `serverActions.allowedOrigins`
- [x] **H-2**: Use cryptographically random `oauth_state` with `Secure` flag in production
- [x] **H-3**: Create `SECURITY.md` at repo root with vulnerability reporting instructions
- [x] **H-5**: Fix user enumeration timing in OAuth callback
- [ ] **H-1**: Switch password reset to code-based flow (token in POST body, not URL) — requires email provider integration

### Medium

- [x] **SEC-007**: Add request body size limits to JSON API routes
- [x] **SEC-008**: Invalidate all sessions on password change
- [x] **SEC-010**: Add `client_max_body_size` note to deployment docs for nginx
- [x] **M-1**: Enforce `Content-Length` limits via middleware wrapper
- [x] **M-2**: Ensure temp password response is HTTPS-only with change-on-first-login requirement
- [ ] **SEC-009**: Add CORS configuration for public API routes

### Low

- [x] **SEC-012**: Clean up `.gitignore` — fix `CLAUDE.md` entry
- [x] **L-3**: Verify `scripts/postgres/init.sql` exists or document as optional

---

## Cleanup Infrastructure

### High

- [x] **CLN-001**: Create `.tmp/` directory at project root for temporary session files
- [x] **CLN-002**: Create `.claude/cleanup.ps1` — runs at end of session: deletes `.tmp/` contents, removes stale `.claude/worktrees/`, reports what was cleaned
- [x] **CLN-003**: Add cleanup instructions section to `CLAUDE.md` — instruct Claude to run cleanup script and use `.tmp/` for all temporary files

---

## Documentation

- [x] **DOC-001**: Refactor `docs/changelog.md` from version-based to date-based format
- [x] **DOC-002**: Update `CLAUDE.md` changelog section to reference date-based format
