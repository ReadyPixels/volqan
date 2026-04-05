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
- `.github/FUNDING.yml` — GitHub Sponsors configuration pointing to `github: Shaerif`

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

[0.0.1]: https://github.com/Shaerif/volqan/releases/tag/v0.0.1
[Unreleased]: https://github.com/Shaerif/volqan/compare/v0.0.1...HEAD
