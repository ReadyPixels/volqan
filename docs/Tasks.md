# Volqan — Task List

All outstanding work identified across the codebase audit (May 2026).

---

## In Progress

- [ ] Cut **v0.1.0-alpha** GitHub release (tag, release notes, binary/Docker image)
- [ ] Complete documentation on GitHub Pages (Phase 2 blocker)

---

## Security

- [x] **API keys**: SHA-256 hash stored instead of plaintext — `key` field stores digest, raw key returned only once on creation (`packages/admin/src/app/api/settings/api-keys/route.ts`)
- [x] Rate limiting added to `POST /api/auth/login` — 10 attempts per 15 min per IP via in-memory sliding window (`src/lib/rate-limit.ts`); also applied to forgot-password and reset-password routes
- [x] CSRF: `SameSite=Lax` + `HttpOnly` is sufficient for same-origin admin use (admin panel is same-origin only; no cross-origin form POST attack surface). Documented in middleware.
- [x] `Secure` flag added to session cookie in production environments (`api/auth/login/route.ts`)
- [x] File upload MIME type validation — media upload route enforces upload-root boundaries and blocks HTML/SVG/JS/executable content (`packages/admin/src/app/api/media/route.ts`)
- [x] Scriptable uploads blocked — upload route rejects `.html`, `.svg`, `.js`, `.ts`, `.php` and other browser-executable extensions
- [ ] Validate uploaded file type by reading magic bytes (content-based validation), not just client-supplied MIME/extension — not yet implemented; relies on extension allowlist only
- [x] API key scope validated against allowlist on creation; non-admin users cannot escalate permissions (`packages/admin/src/app/api/settings/api-keys/route.ts`)
- [x] Media ownership enforced — non-admin users can only list/read their own uploads (`packages/admin/src/app/api/media/route.ts`, `packages/admin/src/app/api/media/[id]/route.ts`)

---

## Authentication & Users

- [x] OAuth callback routes — `GET /api/auth/oauth/[provider]` redirects to provider; `GET /api/auth/oauth/[provider]/callback` handles code exchange, creates/links accounts, sets session cookie. Supports Google and GitHub.
- [x] Email verification flow — `POST /api/auth/verify-email` verifies HMAC-signed token and sets `emailVerified`. Token generation helper exported from the route.
- [x] Password reset flow — `POST /api/auth/forgot-password` generates signed reset token (logs URL in dev); `POST /api/auth/reset-password` verifies token and updates password.
- [ ] Invite email — `POST /api/users` creates a user and returns a `tempPassword` but never sends an email; requires email provider integration (out of scope until Phase 2 email service is configured)
- [x] User profile edit page (`/profile`) — full profile page with name/avatar editor and password change form; backed by `PATCH /api/auth/me`

---

## Admin Pages (Mock → Real API)

- [x] **AI Assistant** (`packages/admin/src/app/ai/page.tsx`) — page created; opens AI panel with `initialOpen`; provider config saved to `/api/settings` as `ai_provider` key

---

## Infrastructure & DevOps

- [ ] Run and commit Prisma migrations — confirm `packages/core/prisma/migrations/` is up to date with the current schema (requires live database; run `prisma migrate dev` locally)

---

## Phase 2 Remaining (roadmap)

- [ ] Analytics overview widget — page views, API requests, user activity (📋)
- [ ] WCAG 2.1 AA accessibility audit and remediation across all admin UI (📋)
- [ ] **v0.5.0-beta** release (📋)
- [ ] Soft Product Hunt launch (📋)

---

## Phase 3 — Community & Marketplace (roadmap, all 📋)

- [ ] Publish `@volqan/extension-sdk` to npm
- [ ] Publish `@volqan/theme-sdk` to npm
- [ ] Launch Bazarix marketplace platform (private beta)
- [ ] Extension Manager deep link to Bazarix in admin panel
- [ ] Seller onboarding and approval workflow in Bazarix
- [ ] License key system: `MKT-[PRODUCT_ID]-[INSTALL_ID]-[EXPIRY_HASH]` format
- [ ] License validation API: `GET /api/v1/license/validate`
- [ ] Stripe Connect integration for seller payouts (70/30 split)
- [ ] Featured listing slots (paid promotional placements)
- [ ] Extension Certification program
- [ ] Community Showcase category on GitHub Discussions
- [ ] First 10 community extensions on Bazarix
- [ ] Documentation course (Gumroad)
- [ ] **v1.0.0** stable release
- [ ] Full Product Hunt launch

---

## Phase 4 — Pro & Growth (roadmap, all 📋)

- [ ] Pro version feature differentiation planning and architecture
- [ ] Hosted/Cloud version infrastructure design (multi-tenant)
- [ ] Enterprise license tier — white-label, SLA, dedicated support
- [x] ~~Remove references to other languages~~ — done: settings locale dropdown, roadmap, README, changelog all updated to English/Arabic only
- [ ] Advanced content workflow engine (draft/review/publish approval chains)
- [ ] Content scheduling (publish/unpublish at specific date/time)
- [ ] Outbound webhook system
- [ ] Full audit log — every admin action recorded
- [ ] SSO support: SAML 2.0 and LDAP/Active Directory
- [ ] Redis caching layer for content API
- [ ] **v1.5.0** release

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
