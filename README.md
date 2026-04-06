<p align="center">
  <img src="logo.png" alt="Volqan" width="120" />
</p>

<h1 align="center">Volqan</h1>

<p align="center">The universal open-source application framework</p>

[![License: Open Core Attribution License v1.0](https://img.shields.io/badge/license-Open%20Core%20Attribution%20License%20v1.0-0f766e.svg)](./LICENSE-ATTRIBUTION.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-3c873a.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-f69220.svg)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6.svg)](https://www.typescriptlang.org)
[![Discussions](https://img.shields.io/badge/community-GitHub%20Discussions-1f6feb.svg)](https://github.com/ReadyPixels/volqan/discussions)
[![Sponsors](https://img.shields.io/badge/support-GitHub%20Sponsors-ea4aaa.svg)](https://github.com/sponsors/ReadyPixels)

Volqan is a CMS, admin panel generator, visual GUI builder, and backend framework in one. It is designed to let developers move fast with schema-as-code while giving non-technical teams a polished visual workspace for building and operating modern applications.

## Why Volqan

Volqan is built for teams that want one engine to power websites, internal tools, SaaS products, dashboards, directories, portals, and commerce experiences without stitching together a dozen unrelated systems.

### Feature highlights

- **Two modes: Developer + Visual**  
  Build with TypeScript and CLI scaffolding, or switch to a point-and-click visual workflow for content modeling, page building, and administration.

- **Extension engine**  
  Install, enable, disable, and configure extensions that add admin pages, widgets, routes, hooks, migrations, and marketplace-ready capabilities.

- **Theme engine**  
  Apply design tokens across the admin experience with runtime theme switching, CSS custom properties, and marketplace-distributed themes.

- **AI assistant**  
  Embed an assistant inside the admin panel with support for multiple LLM providers, including hosted APIs and local models.

- **Beautiful admin UI**  
  Built with shadcn/ui and Tailwind CSS v4 to feel like a premium product from the first launch, not a generic back office.

- **REST + GraphQL APIs**  
  Generate modern APIs automatically from your schema and runtime configuration.

- **Multi-database support**  
  Run on PostgreSQL, MySQL, or SQLite with Prisma-based data access.

- **Docker self-hosting**  
  Launch locally or self-host in containers with a Dockerfile and Docker Compose setup included from day one.

## Quick start

```bash
npx create-volqan-app my-project
cd my-project
pnpm install
pnpm dev
```

Open `http://localhost:3000/admin` to access the admin experience.

## Tech stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.x |
| App framework | Next.js 15 App Router |
| ORM | Prisma |
| Databases | PostgreSQL, MySQL, SQLite |
| Admin UI | shadcn/ui + Tailwind CSS v4 |
| Authentication | JWT + OAuth |
| APIs | REST + GraphQL |
| Storage | Local filesystem + S3-compatible adapter |
| Deployment | Docker + Docker Compose |
| Monorepo | pnpm workspaces |

## Monorepo layout

```text
volqan/
├── packages/
│   ├── core
│   ├── admin
│   ├── cli
│   ├── extension-sdk
│   ├── theme-sdk
│   └── cloud-bridge
├── extensions/
├── themes/
├── examples/
└── docs/
```

## Roadmap

### Phase 0 — Foundation
- Initialize the pnpm monorepo and core repo structure
- Configure GitHub Pages, Discussions, Sponsors, and CI
- Publish docs, legal documents, and licensing foundations
- Lock the extension and theme interfaces
- Establish the visual design system and admin UI baseline

### Phase 1 — Core MVP
- Ship the Prisma-based data layer with PostgreSQL, MySQL, and SQLite
- Add authentication and role-based access control
- Build visual content modeling and generated CRUD admin panels
- Generate REST and GraphQL APIs automatically
- Launch media handling, extension lifecycle management, theme switching, attribution checks, Docker workflows, and the CLI
- Cut the first alpha release

### Phase 2 — Beautiful and Accessible
- Launch the drag-and-drop page builder and dashboard widgets
- Embed the AI assistant with swappable providers
- Deliver responsive dark and light admin experiences
- Publish first-party extensions and first-party themes
- Add Stripe-based support plans and attribution license validation
- Complete public documentation and ship beta

### Phase 3 — Community and Marketplace
- Publish the Extension SDK and Theme SDK to npm
- Add extension scaffolding commands to the CLI
- Expand developer documentation for ecosystem builders
- Launch the Bazarix marketplace private beta
- Activate marketplace deep links and community showcase loops
- Reach stable v1.0.0 with the first community ecosystem wave

### Phase 4 — Pro and Growth
- Plan feature boundaries for Pro and hosted offerings
- Add multilingual support, advanced workflows, outbound webhooks, audit logs, and enterprise auth
- Introduce scaling infrastructure such as Redis-backed caching
- Grow toward v1.5.0 and broader commercial adoption

### Phase 5 — Scale
- Publicly launch the hosted cloud version
- Launch the closed-source Pro offering
- Expand into mobile, white-label licensing, and governance maturity
- Pursue grants and long-term ecosystem scaling

## Revenue streams

| # | Stream | System | Launch status |
| --- | --- | --- | --- |
| 1 | Support Plan Yearly | Framework | Build now |
| 2 | Support Plan Monthly (+25%) | Framework | Build now |
| 3 | GitHub Sponsors | Framework | Configure now |
| 4 | Marketplace Commission (30%) | Marketplace | Build now |
| 5 | Featured Listing Slots | Marketplace | Build now |
| 6 | Pro Version | Framework | Phase 4 |
| 7 | Hosted / Cloud Version | Framework | Phase 4 |
| 8 | Enterprise White-label | Framework | Phase 5 |
| 9 | Extension Certification | Marketplace | Phase 3 |
| 10 | Documentation Course | External | Phase 3 |

## Links

- **Documentation:** [volqan.link](https://volqan.link)
- **Marketplace:** [bazarix.link](https://bazarix.link)
- **GitHub Discussions:** [github.com/ReadyPixels/volqan/discussions](https://github.com/ReadyPixels/volqan/discussions)
- **Sponsors:** [github.com/sponsors/ReadyPixels](https://github.com/sponsors/ReadyPixels)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Security:** [SECURITY.md](./SECURITY.md)

## License

Volqan is distributed under the **Open Core Attribution License v1.0**. See [LICENSE-ATTRIBUTION.md](./LICENSE-ATTRIBUTION.md).

## Attribution

All qualifying deployments must retain the following attribution unless attribution removal is covered by an active validated support plan:

> Powered by Volqan — https://volqan.link

## Contributing

We welcome issues, pull requests, extension ideas, theme ideas, and ecosystem contributions. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and review the [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.
