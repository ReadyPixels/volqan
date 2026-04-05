---
title: Roadmap — Volqan
description: The full public roadmap for Volqan from initial foundation through scale.
---

# Roadmap

This is the complete public roadmap for Volqan. Everything here is planned and committed to. Dates are estimates — if a phase ships early, the next one starts early. Nothing is removed from this list without a public announcement in [GitHub Discussions](https://github.com/Shaerif/volqan/discussions).

Want to influence priorities? Support Plan holders have direct roadmap input. Community members can vote and comment in [Extension Ideas](https://github.com/Shaerif/volqan/discussions/categories/extension-ideas).

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ Done | Shipped and available |
| 🔄 In Progress | Actively being built |
| 📋 Planned | Committed, not yet started |
| 💡 Considering | Under evaluation, not committed |

---

## Phase 0 — Foundation
**Weeks 1–3 · April 2026**

The groundwork phase. No user-facing features — only the infrastructure, legal, and design system that everything else is built on.

| Status | Item |
|---|---|
| ✅ | Initialize pnpm monorepo and push to GitHub |
| ✅ | Configure GitHub Pages for the `/docs` folder |
| ✅ | Enable GitHub Discussions (General, Q&A, Show and Tell, Extension Ideas, Announcements) |
| ✅ | Enable GitHub Sponsors and configure FUNDING.yml |
| ✅ | Enable GitHub Issues with bug report, feature request, and extension proposal templates |
| ✅ | Set up GitHub Actions: CI linting, type-checking, docs deployment, release automation, attribution check |
| ✅ | Publish all legal documents to GitHub Pages (Terms of Service, Privacy Policy, Refund Policy, Attribution Policy, Fee Disclosure, CLA) |
| ✅ | Commit LICENSE-ATTRIBUTION.md (Open Core Attribution License v1.0) |
| ✅ | Establish Tailwind CSS v4 design token system and shadcn/ui component base |
| ✅ | Define and lock Extension TypeScript interface (`VolqanExtension`) |
| ✅ | Define and lock Theme TypeScript interface (`VolqanTheme`) |
| ✅ | Write README with vision, features, and roadmap |
| ✅ | Write full documentation suite (index, getting started, pricing, roadmap, changelog, extension API, theme API) |

---

## Phase 1 — Core MVP
**Weeks 4–10 · April–June 2026**

The foundational application layer. Everything needed for a functional, self-hosted CMS and admin panel.

| Status | Item |
|---|---|
| 📋 | Database layer with Prisma supporting PostgreSQL, MySQL, and SQLite |
| 📋 | Authentication — email/password login with bcrypt password hashing |
| 📋 | OAuth — Google and GitHub social login via NextAuth.js |
| 📋 | Role-based access control (super admin, admin, editor, viewer) |
| 📋 | Content modeling GUI — visual schema builder with field type library |
| 📋 | Auto-generated CRUD admin panels from schema definitions |
| 📋 | Auto-generated REST API — full CRUD endpoints with filtering, sorting, pagination |
| 📋 | Auto-generated GraphQL API — queries, mutations, and subscriptions |
| 📋 | Media manager — local filesystem storage with drag-and-drop upload |
| 📋 | S3-compatible storage adapter for media (Cloudflare R2, AWS S3, MinIO) |
| 📋 | Extension engine — load, validate, enable, disable, configure, and lifecycle-manage extensions |
| 📋 | Theme engine — token injection, CSS custom properties, live preview switcher |
| 📋 | Attribution footer — license check with 24-hour cache, graceful fallback to display |
| 📋 | Docker image and Docker Compose stack for one-command self-hosting |
| 📋 | CLI: `npx create-volqan-app` with interactive setup wizard |
| 📋 | First GitHub release: **v0.1.0-alpha** |

---

## Phase 2 — Beautiful and Accessible
**Weeks 11–16 · June–August 2026**

The polish phase. Make the product genuinely beautiful, accessible, and AI-powered. Prepare for public launch.

| Status | Item |
|---|---|
| 📋 | Visual drag-and-drop page builder with composable block system |
| 📋 | Dashboard widgets — content counts, activity feed, quick actions |
| 📋 | Analytics overview widget — page views, API requests, user activity |
| 📋 | Embedded AI assistant panel with swappable LLM provider (OpenAI, Anthropic, Gemini, Ollama) |
| 📋 | Dark and light mode with instant theme switcher in admin header |
| 📋 | Fully responsive mobile admin panel — usable on tablet and phone |
| 📋 | WCAG 2.1 AA accessibility audit and remediation across all admin UI |
| 📋 | Official first-party extension: **Blog** (posts, categories, tags, RSS) |
| 📋 | Official first-party extension: **SEO** (meta tags, Open Graph, sitemap) |
| 📋 | Official first-party extension: **Forms** (form builder, submissions, email notifications) |
| 📋 | Official first-party theme: **Default** (current shadcn/ui base) |
| 📋 | Official first-party theme: **Minimal** (stripped-back, high-density) |
| 📋 | Stripe integration for Support Plan subscriptions (yearly and monthly) |
| 📋 | Licensing API for attribution removal validation (Bazarix backend) |
| 📋 | Stripe webhook handler — activate, refresh, revoke, grace period on payment events |
| 📋 | Complete documentation on GitHub Pages |
| 📋 | **v0.5.0-beta** release |
| 📋 | Soft Product Hunt launch |

---

## Phase 3 — Community and Marketplace
**Months 4–6 · September–December 2026**

Open the ecosystem. Launch the marketplace. Reach v1.0.

| Status | Item |
|---|---|
| 📋 | Extension SDK (`@volqan/extension-sdk`) published to npm |
| 📋 | Theme SDK (`@volqan/theme-sdk`) published to npm |
| 📋 | CLI command: `npx create-volqan-app --extension my-extension` scaffolding |
| 📋 | Full developer documentation for building and publishing extensions |
| 📋 | Full developer documentation for building and publishing themes |
| 📋 | Bazarix marketplace platform launched (private beta for approved sellers) |
| 📋 | Extension Manager deep link to Bazarix marketplace live in admin panel |
| 📋 | Seller onboarding and approval workflow in Bazarix |
| 📋 | License key system: `MKT-[PRODUCT_ID]-[INSTALL_ID]-[EXPIRY_HASH]` format |
| 📋 | License validation API: `GET /api/v1/license/validate` (server-side only) |
| 📋 | Stripe Connect integration for seller payouts (70/30 split) |
| 📋 | Featured listing slots — paid promotional placements |
| 📋 | Extension Certification program (quality badge for reviewed extensions) |
| 📋 | Community Showcase category active on GitHub Discussions |
| 📋 | First 10 community extensions available on Bazarix |
| 📋 | Documentation course (Gumroad) — step-by-step guide to building with Volqan |
| 📋 | **v1.0.0** stable release |
| 📋 | Full Product Hunt launch |

---

## Phase 4 — Pro and Growth
**Months 7–12 · January–June 2027**

Enterprise-readiness, internationalization, and the Pro product line.

| Status | Item |
|---|---|
| 📋 | Pro version feature differentiation planning and architecture |
| 📋 | Hosted/Cloud version infrastructure design (multi-tenant) |
| 📋 | Enterprise license tier — white-label, SLA, dedicated support |
| 📋 | Multilingual and i18n support built into core (content translation, admin UI localization) |
| 📋 | Advanced content workflow engine — draft/review/publish approval chains |
| 📋 | Content scheduling — publish and unpublish at a specific date and time |
| 📋 | Outbound webhook system — trigger HTTP events on content changes |
| 📋 | Full audit log — every admin action recorded with actor, timestamp, and delta |
| 📋 | SSO support: SAML 2.0 and LDAP/Active Directory for enterprise deployments |
| 📋 | Redis caching layer — content API response caching for high-traffic installations |
| 📋 | **v1.5.0** release |

---

## Phase 5 — Scale
**Year 2 and Beyond · 2027+**

Volqan at full scale.

| Status | Item |
|---|---|
| 💡 | Public launch of Volqan Cloud — fully managed hosting, no servers required |
| 💡 | Public launch of Volqan Pro — closed-source version with advanced features |
| 💡 | React Native mobile companion app for content editing on the go |
| 💡 | White-label licensing for agencies and large custom forks |
| 💡 | Open governance model — contributor steering committee |
| 💡 | Grant applications: NLnet Foundation, GitHub Octoverse Fund |
| 💡 | Plugin marketplace expansion — SaaS integrations (Zapier, n8n, Make) |

---

## Revenue Streams

| # | Stream | System | Status |
|---|---|---|---|
| 1 | Support Plan — Yearly | Framework | Active at Phase 2 |
| 2 | Support Plan — Monthly (+25%) | Framework | Active at Phase 2 |
| 3 | GitHub Sponsors | Framework | Active at Phase 0 |
| 4 | Marketplace Commission (30%) | Bazarix | Active at Phase 3 |
| 5 | Featured Listing Slots | Bazarix | Active at Phase 3 |
| 6 | Extension Certification | Bazarix | Active at Phase 3 |
| 7 | Documentation Course | Gumroad | Planned Phase 3 |
| 8 | Volqan Pro Version | Framework | Planned Phase 4 |
| 9 | Volqan Cloud (Hosted) | Framework | Planned Phase 4 |
| 10 | Enterprise White-label | Framework | Planned Phase 5 |

---

## Not on the Roadmap

The following are explicitly out of scope and will not be added to this roadmap without a public announcement:

- **Page caching** at the framework level (use a CDN or Nginx proxy instead)
- **Headless storefront** — Volqan is not a Shopify replacement; the ecommerce extension handles simple product management
- **Mobile SDK** — the REST and GraphQL APIs are the mobile integration layer
- **Shared code between Volqan and Bazarix** — these two products connect via deep link and license API only; no shared codebase, ever

---

*Last updated: April 2026. [Discuss this roadmap →](https://github.com/Shaerif/volqan/discussions)*
