# Volqan — Task List

All outstanding work identified across the codebase audit (May 2026).

---

## In Progress

- [ ] Cut **v0.1.0-alpha** GitHub release (tag, release notes, binary/Docker image)
- [ ] Complete documentation on GitHub Pages (Phase 2 blocker)

---

## Security

- [ ] **API keys**: Store only a hash of the key in DB, not the plaintext value (`packages/admin/src/app/api/settings/api-keys/route.ts` — `hash` field currently stores raw key)
- [ ] Add rate limiting to `POST /api/auth/login` (brute-force protection)
- [ ] Add CSRF protection to state-mutating API routes (or document that session cookie + SameSite=Lax is sufficient)
- [ ] Verify `SameSite` and `Secure` flags are set on the session cookie in production (`packages/core/src/auth.ts`)
- [ ] Review file upload MIME type validation in `POST /api/media` — currently accepts any file extension

---

## Authentication & Users

- [ ] OAuth callback routes — `/api/auth/oauth/google` and `/api/auth/oauth/github` do not exist yet; the roadmap marks OAuth as ✅ but no admin-side routes are implemented
- [ ] Email verification flow — no route to verify email token; `emailVerified` field exists in DB but is never set
- [ ] Password reset flow — no forgot-password or reset-password routes
- [ ] Invite email — `POST /api/users` creates a user and returns a `tempPassword` but never sends an email; wire up email sender from `@volqan/core` (or queue it)
- [ ] User profile edit page (`/profile`) — linked from TopBar user menu but route does not exist

---

## Admin Pages (Mock → Real API)

- [ ] **Dashboard** (`packages/admin/src/app/page.tsx`) — widgets still use hardcoded/mock data; wire to `/api/content/types`, `/api/users`, `/api/media`, and audit log endpoints
- [ ] **Extensions** (`packages/admin/src/app/extensions/page.tsx`) — list, enable/disable, configure extensions via `@volqan/core` ExtensionEngine; currently mock
- [ ] **Themes** (`packages/admin/src/app/themes/page.tsx`) — list, activate, preview themes via `@volqan/core` ThemeEngine; currently mock
- [ ] **Billing** (`packages/admin/src/app/billing/page.tsx`) — subscription status, plan details, and cancel flow use mock data; wire to `/api/billing/*` and Stripe Customer Portal
- [ ] **Page Builder** (`packages/admin/src/app/pages/page.tsx`) — save/load pages; no persistence API exists yet
- [ ] **AI Assistant** (`packages/admin/src/app/ai/page.tsx`) — LLM provider configuration; needs `/api/settings` integration for API key storage

---

## Missing API Routes

- [ ] `GET/POST /api/extensions` — list installed extensions, install from marketplace deep link
- [ ] `PATCH /api/extensions/[id]` — enable/disable/configure extension
- [ ] `GET/POST /api/themes` — list themes, activate theme
- [ ] `GET /api/billing/status` — current subscription status from Stripe
- [ ] `POST /api/billing/portal` — create Stripe Customer Portal session
- [ ] `POST /api/billing/webhook` — Stripe webhook handler (activate, refresh, revoke, grace period); roadmap marks this ✅ but no route exists in admin
- [ ] `GET /api/audit-log` — paginated audit log for dashboard and admin audit view
- [ ] `GET /api/pages`, `POST /api/pages`, `PATCH /api/pages/[id]`, `DELETE /api/pages/[id]` — page builder persistence
- [ ] `GET /api/dashboard/stats` — aggregate stats for dashboard widgets (content counts, media count, user count, recent activity)

---

## Infrastructure & DevOps

- [ ] Create `.env.example` at repo root documenting all required environment variables (`DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_YEARLY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_WEBHOOK_SECRET`, `VOLQAN_UPLOAD_DIR`, `NEXT_PUBLIC_APP_URL`, OAuth client IDs/secrets)
- [ ] Run and commit Prisma migrations — confirm `packages/core/prisma/migrations/` is up to date with the current schema
- [ ] Docker image: ensure `VOLQAN_UPLOAD_DIR` volume is configured in `docker-compose.yml`
- [ ] CI: add `prisma migrate deploy` step to the deployment workflow

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
- [ ] **Remove references to other languages — this app should only support English and Arabic. Remove any reference to other languages in all documents and code files.**
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