# Volqan — Product Design Context

Saved context for product-design audits and future design QA sessions.

## Product surfaces

| Surface | Route | Notes |
|---|---|---|
| Dashboard | `/` | StatsCards, RecentEntries, ActivityFeed (live from `/api/dashboard/stats`) |
| Content types | `/content`, `/content/types` | Dynamic CMS collections |
| Content entries | `/content/[slug]`, `/content/[slug]/[id]`, `/content/[slug]/new` | Live from `/api/content/[type]` |
| Pages (builder) | `/pages`, `/pages/[id]`, `/pages/new` | Visual block builder; saves via `PATCH /api/pages/[id]` |
| Media library | `/media` | Grid/list, upload dropzone, delete via ConfirmDialog |
| Extensions | `/extensions` | Toggle, uninstall; Bazarix marketplace deep link |
| Themes | `/themes` | Activate + token editor |
| Users | `/users` | Invite (email), role badges, remove via ConfirmDialog |
| Analytics | `/analytics` | Daily activity chart, top actions |
| AI Assistant | `/ai` + floating panel | Provider config saved to `/api/settings` (`ai_provider`) |
| Billing | `/billing` | Status, upgrade, cancel (dialog), Stripe portal |
| Settings | `/settings` | Tabs: General, Email, Storage, API Keys, Installation |
| Profile | `/profile` | Name/avatar, password change |
| Auth | `/login`, `/forgot-password`, `/reset-password` | Reset uses 6-digit emailed code |

## Design system

- Tokens: CSS custom properties in `packages/admin/src/app/globals.css` (HSL variables: `--background`, `--foreground`, `--primary`, `--destructive`, `--border`, `--muted`, etc.). Dark-first; light/dark/system via `ThemeProvider`.
- Typography: Inter (UI), `--font-display`, `--font-mono` defined in globals.css.
- Component library: `packages/admin/src/components/ui/` — button, card, badge, input, dialog, confirm-dialog, async-states (LoadingState/ErrorState/EmptyState/PermissionDeniedState), data-table, tabs, toast, dropdown-menu, form-field, avatar.
- Layout: `packages/admin/src/components/layout/` — AdminShell, Sidebar, TopBar, MobileNav (bottom bar < 768px), MobileHeader, ThemeProvider, LocaleProvider.

## Status-state conventions (PD-005)

Every async surface uses the shared components from `components/ui/async-states.tsx`:
loading (`LoadingState`), error with retry (`ErrorState`), empty (`EmptyState`),
filtered-empty (`EmptyState filtered`), permission denied (`PermissionDeniedState`).
Destructive actions always go through `components/ui/confirm-dialog.tsx` with entity
name, consequence text, and a loading state. Success/error feedback uses
`role="status"` / `role="alert"` inline banners.

## Language requirement

English and Arabic ONLY. `LocaleProvider` drives `<html lang>` and `dir` from the
`site.locale` setting; RTL overrides live at the bottom of `globals.css`. Any new
locale-facing UI must be verified in both `dir="ltr"` and `dir="rtl"`.

## Test targets

- E2E/regression: `packages/admin/e2e/admin-regression.spec.ts` (Playwright, `pnpm --filter @volqan/admin test:e2e`).
- Accessibility: `packages/admin/e2e/a11y.spec.ts` (axe-core WCAG 2.1 AA scans, keyboard, dialog focus, RTL, reduced motion).
- Preferred capture viewports: 1440×900 (desktop), 390×844 (mobile).
- Test credentials come from `E2E_EMAIL` / `E2E_PASSWORD` env vars; server on port 3001.
