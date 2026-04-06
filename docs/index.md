---
title: Volqan — Build Anything. Own Everything.
description: The open-source framework that is a CMS, admin panel, visual page builder, and backend application platform — all in one.
layout: home
---

# Volqan

**Build Anything. Own Everything.**

Volqan is an open-source application framework that functions as a CMS, an admin panel generator, a visual page builder, and a backend application platform simultaneously. It is content-agnostic, self-hostable, and designed for both developers who prefer code and non-developers who prefer clicks.

It ships free. It stays free. You own every byte of it.

---

## Why Volqan?

Most frameworks make you choose. You either get a CMS or a backend framework or a page builder — never all three, never without a vendor lock-in. Volqan removes that choice.

You define your data. Volqan generates the admin panel, the REST API, the GraphQL API, the forms, and the content management interface — automatically. Then you ship it with a single Docker command and walk away.

---

## Core Features

### Two Usage Modes, One Engine

**Developer Mode**
Write schemas as TypeScript code. Use the CLI to scaffold content models, extensions, and API routes. Run it locally with `pnpm dev`. Deploy to any server with Docker. Full programmatic control at every layer.

**Visual Mode**
Design content models with a point-and-click schema builder. Build pages with the drag-and-drop block editor. Configure everything from the admin panel. No code required to launch a complete data-driven application.

### Auto-Generated APIs

Every content model you define — whether in code or in the visual builder — instantly becomes a full REST API and a GraphQL API. No routes to write. No resolvers to maintain. Schema change reflects in the API immediately.

### Extension Engine

Volqan ships with a first-class extension engine. Extensions can register admin menu items, custom pages, dashboard widgets, API routes, GraphQL schema additions, database migrations, and content lifecycle hooks — all through a single TypeScript interface.

Browse, install, and manage extensions directly from the Extension Manager in your admin panel. Community-built extensions are distributed through [Bazarix](https://bazarix.link), the official Volqan marketplace.

### Theme Engine

The entire admin UI is styled through a design token system. Swap themes instantly from the Theme Manager. Every color, font, spacing value, border radius, shadow, and animation curve is configurable. Build your own theme and publish it to the marketplace.

### Embedded AI Assistant

An AI assistant lives inside the admin panel. It understands your content models, can generate content, summarize data, answer questions about your site, and help non-technical users accomplish complex tasks. Connect it to any LLM provider you choose:

- OpenAI (GPT-4o, o3)
- Anthropic Claude
- Google Gemini
- Ollama (fully local, no data leaves your server)

### Beautiful by Default

Volqan is not functional-but-ugly. It is built with [shadcn/ui](https://ui.shadcn.com) and Tailwind CSS v4. The admin panel looks and feels like a premium SaaS product on first load. Non-technical users feel comfortable. Developers feel respected.

### Self-Hosted Forever

Volqan is a Docker-first application. One command starts the entire stack — application server, database, and file storage. You own your data, your infrastructure, and your deployment. No usage limits, no per-seat pricing, no vendor sending you an enterprise upsell email.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.x |
| App Framework | Next.js 15 with App Router |
| ORM | Prisma |
| Databases | PostgreSQL (default), MySQL, SQLite |
| Admin UI | shadcn/ui + Tailwind CSS v4 |
| Auth | Built-in JWT + OAuth (Google, GitHub) |
| APIs | Auto-generated REST + GraphQL |
| File Storage | Local filesystem + S3-compatible adapter |
| Search | Built-in full-text search |
| Email | Nodemailer with SMTP adapter |
| Deployment | Docker + Docker Compose |
| Package Manager | pnpm workspaces |

---

## Quick Start

```bash
npx create-volqan-app my-project
cd my-project
pnpm dev
```

Your admin panel is live at `http://localhost:3000/admin`.

[Full getting started guide →](./getting-started.md)

---

## Documentation

| Section | Description |
|---|---|
| [Getting Started](./getting-started.md) | Install, configure, and launch your first Volqan project |
| [Extension API](./extension-api.md) | Build extensions that add features to any Volqan installation |
| [Theme API](./theme-api.md) | Build and publish themes for the Volqan admin panel |
| [Pricing](./pricing.md) | Free tier, Support Plans, and the Platform Service Fee explained |
| [Roadmap](./roadmap.md) | What is built, what is coming, and when |
| [Changelog](./changelog.md) | Version history and release notes |

### Legal

| Document | |
|---|---|
| [Terms of Service](./legal/terms-of-service.md) | Usage terms for the Volqan framework |
| [Privacy Policy](./legal/privacy-policy.md) | What data is collected and how it is used |
| [Refund Policy](./legal/refund-policy.md) | Refund eligibility for Support Plans |
| [Attribution Policy](./legal/attribution-policy.md) | How the attribution requirement works and how to remove it |
| [Fee Disclosure](./legal/fee-disclosure.md) | Full Platform Service Fee formula and worked examples |
| [Contributor License Agreement](./legal/contributor-license-agreement.md) | IP terms for contributors |

---

## The Marketplace

**[Bazarix](https://bazarix.link)** is the official curated marketplace for Volqan extensions and themes. Every listing is reviewed before it goes live. Quality is the only filter.

Browse extensions and themes directly from your admin panel's Extension Manager, or visit [bazarix.link](https://bazarix.link) in your browser.

Want to sell on Bazarix? [Apply to become a seller →](https://bazarix.link/sellers/apply)

---

## Community

| | |
|---|---|
| [GitHub Discussions](https://github.com/ReadyPixels/volqan/discussions) | Ask questions, share what you built, propose extension ideas |
| [Q&A](https://github.com/ReadyPixels/volqan/discussions/categories/q-a) | Get help from the community and maintainer |
| [Show and Tell](https://github.com/ReadyPixels/volqan/discussions/categories/show-and-tell) | Showcase projects you built with Volqan |
| [Extension Ideas](https://github.com/ReadyPixels/volqan/discussions/categories/extension-ideas) | Propose and vote on extension ideas |
| [GitHub Issues](https://github.com/ReadyPixels/volqan/issues) | Report bugs and request features |
| [GitHub Sponsors](https://github.com/sponsors/ReadyPixels) | Support the project financially |

---

## Support the Project

Volqan is free and open source, sustained by the people who use it.

**[Sponsor on GitHub →](https://github.com/sponsors/ReadyPixels)**

If you depend on Volqan for commercial work, consider a [Support Plan](./pricing.md#support-plans). It funds continued development and gives you priority access to the maintainer.

---

## License

Volqan is released under the [Open Core Attribution License v1.0](https://github.com/ReadyPixels/volqan/blob/main/LICENSE-ATTRIBUTION.md). You may use, modify, and distribute it freely. Deployments must display the "Powered by Volqan" attribution notice unless you hold an active Support Plan subscription.

---

*Volqan is built and maintained by [ReadyPixels](https://github.com/ReadyPixels). Released April 2026.*
