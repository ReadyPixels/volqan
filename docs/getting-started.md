---
title: Getting Started — Volqan
description: Install, configure, and launch your first Volqan project from scratch.
---

# Getting Started

This guide takes you from zero to a running Volqan application. By the end you will have a local development instance with a working admin panel, a connected database, and a clear understanding of how the project is structured.

---

## Prerequisites

Before you begin, ensure the following are installed on your machine:

| Dependency | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 22 LTS | The 22 LTS release line is required. Older versions are not supported. |
| [pnpm](https://pnpm.io) | 9.x or later | Volqan uses pnpm workspaces for its monorepo. `npm install -g pnpm` |
| Database | Any of the below | PostgreSQL is recommended for production. SQLite works with no setup for local development. |

**Supported databases:**

- **PostgreSQL** 14 or later — recommended for production
- **MySQL** 8.0 or later
- **SQLite** — no installation needed, database is a local file

**Optional:**

- [Docker](https://docker.com) and Docker Compose — required only if you want to use the Docker deployment path
- [Git](https://git-scm.com) — strongly recommended

---

## Quick Start

The fastest way to create a new Volqan project is the `create-volqan-app` CLI:

```bash
npx create-volqan-app my-project
```

This command:
1. Downloads the latest stable Volqan scaffold
2. Creates a `my-project/` directory with the full project structure
3. Installs all dependencies via pnpm
4. Runs an interactive setup wizard for your database and admin credentials

**Interactive setup wizard:**

```
? Which database would you like to use?
  ❯ PostgreSQL (recommended)
    MySQL
    SQLite (no setup required)

? Database connection URL:
  postgresql://user:password@localhost:5432/myproject

? Admin email address:
  admin@example.com

? Admin password:
  ••••••••••••

✔ Project created successfully.
✔ Database schema pushed.
✔ Admin user created.

  Run:
    cd my-project
    pnpm dev

  Admin panel: http://localhost:3000/admin
```

If you prefer SQLite for a quick local start with zero database setup:

```bash
npx create-volqan-app my-project --db sqlite
```

---

## Project Structure

After creation, your project directory will look like this:

```
my-project/
├── apps/
│   └── admin/                 ← Next.js 15 admin panel application
│       ├── app/               ← App Router pages and layouts
│       ├── components/        ← Admin UI components (shadcn/ui)
│       └── public/            ← Static assets
│
├── packages/
│   ├── core/                  ← Core framework engine
│   │   ├── content/           ← Content modeling and CRUD engine
│   │   ├── api/               ← REST and GraphQL API generation
│   │   ├── auth/              ← JWT + OAuth authentication
│   │   └── storage/           ← File storage adapters
│   │
│   ├── extension-engine/      ← Extension loading and lifecycle management
│   ├── theme-engine/          ← Theme token injection and management
│   └── db/                    ← Prisma schema and migrations
│
├── content/
│   └── models/                ← Your content model definitions (TypeScript)
│
├── extensions/                ← Installed extensions live here
│   └── .gitkeep
│
├── themes/                    ← Installed themes live here
│   └── default/
│
├── volqan.config.ts           ← Main configuration file
├── prisma/
│   └── schema.prisma          ← Database schema (auto-managed by Volqan)
├── docker-compose.yml         ← Docker Compose stack definition
├── Dockerfile                 ← Production Docker image
├── pnpm-workspace.yaml        ← pnpm workspace definition
├── package.json
└── tsconfig.json
```

---

## Configuration File Reference

The `volqan.config.ts` file at the root of your project is the single source of truth for all framework configuration.

```typescript
// volqan.config.ts
import { defineConfig } from '@volqan/core';

export default defineConfig({
  // ─── Application ────────────────────────────────────────────────────────────
  app: {
    name: 'My Project',           // Displayed in the admin panel header
    url: 'https://myproject.com', // Public-facing URL of your site
    adminPath: '/admin',          // Path where the admin panel is served
  },

  // ─── Database ───────────────────────────────────────────────────────────────
  database: {
    provider: 'postgresql',       // 'postgresql' | 'mysql' | 'sqlite'
    url: process.env.DATABASE_URL,
  },

  // ─── Authentication ─────────────────────────────────────────────────────────
  auth: {
    secret: process.env.AUTH_SECRET,    // Used to sign JWT tokens — keep this private
    tokenExpiry: '7d',                  // JWT token lifespan
    oauth: {
      google: {
        clientId:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        enabled:      true,
      },
      github: {
        clientId:     process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        enabled:      true,
      },
    },
  },

  // ─── File Storage ───────────────────────────────────────────────────────────
  storage: {
    adapter: 'local',             // 'local' | 's3'
    local: {
      uploadDir: './uploads',
      publicPath: '/uploads',
    },
    // s3: {
    //   bucket:          process.env.S3_BUCKET,
    //   region:          process.env.S3_REGION,
    //   accessKeyId:     process.env.S3_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    //   endpoint:        process.env.S3_ENDPOINT, // For S3-compatible services like Cloudflare R2
    // },
  },

  // ─── Email ──────────────────────────────────────────────────────────────────
  email: {
    from:      'noreply@myproject.com',
    transport: 'smtp',
    smtp: {
      host:     process.env.SMTP_HOST,
      port:     Number(process.env.SMTP_PORT) || 587,
      secure:   false,
      user:     process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },

  // ─── AI Assistant ────────────────────────────────────────────────────────────
  ai: {
    enabled:  true,
    provider: 'openai',           // 'openai' | 'anthropic' | 'gemini' | 'ollama'
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model:  'gpt-4o',
    },
    // ollama: {
    //   baseUrl: 'http://localhost:11434',
    //   model:   'llama3',
    // },
  },

  // ─── Licensing (Support Plan) ────────────────────────────────────────────────
  license: {
    apiUrl: 'https://bazarix.link/api/v1/license',
    key:    process.env.VOLQAN_LICENSE_KEY, // Set this to remove the attribution footer
  },

  // ─── Extensions ─────────────────────────────────────────────────────────────
  extensions: {
    autoload:    true,        // Automatically load all installed extensions on boot
    marketplace: 'https://bazarix.link',
  },
});
```

**Environment Variables**

Create a `.env` file at your project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myproject"

# Auth
AUTH_SECRET="your-random-secret-minimum-32-characters"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# File Storage (S3, optional)
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_ENDPOINT=""

# Email
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""

# AI Assistant (optional)
OPENAI_API_KEY=""

# Volqan Support Plan License (optional)
VOLQAN_LICENSE_KEY=""
```

---

## Running in Development Mode

Start the development server:

```bash
cd my-project
pnpm dev
```

This starts:
- The Next.js development server on `http://localhost:3000`
- Hot module replacement for instant UI updates
- TypeScript compilation with error reporting

**Development URLs:**

| URL | Description |
|---|---|
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:3000/api/rest` | REST API Explorer |
| `http://localhost:3000/api/graphql` | GraphQL Playground |

**Useful development commands:**

```bash
# Push schema changes to the database
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio

# Run TypeScript type-checking without building
pnpm typecheck

# Lint the codebase
pnpm lint
```

---

## Building for Production

Build the application for production deployment:

```bash
pnpm build
```

This runs:
1. TypeScript compilation and type-checking
2. Next.js production build with static optimization
3. Asset bundling and minification

Start the production server:

```bash
pnpm start
```

**Production environment checklist:**

- [ ] `DATABASE_URL` points to a production database with backups enabled
- [ ] `AUTH_SECRET` is a cryptographically random string (minimum 32 characters)
- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is configured (via reverse proxy such as Nginx or Caddy)
- [ ] File storage is configured for a persistent volume or S3-compatible service
- [ ] Email is configured for transactional mail delivery

---

## Docker Deployment

Volqan ships with a `Dockerfile` and `docker-compose.yml` ready for production use.

**One-command start (includes PostgreSQL and the application):**

```bash
docker compose up -d
```

This starts:
- `volqan` — the application container on port 3000
- `postgres` — PostgreSQL 16 database on port 5432 (internal)

**Default `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  volqan:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://volqan:volqan@postgres:5432/volqan
      AUTH_SECRET: ${AUTH_SECRET}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: volqan
      POSTGRES_PASSWORD: volqan
      POSTGRES_DB: volqan
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U volqan"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  uploads:
```

**Environment variables for Docker:**

Create a `.env` file next to your `docker-compose.yml`:

```env
AUTH_SECRET=your-secure-random-secret-here
```

**Useful Docker commands:**

```bash
# View logs
docker compose logs -f volqan

# Run database migrations
docker compose exec volqan pnpm db:push

# Stop all services
docker compose down

# Stop and remove all data (destructive)
docker compose down -v
```

**Deploying behind a reverse proxy:**

For production, place Volqan behind Nginx or Caddy to handle HTTPS and SSL termination. A minimal Caddy configuration:

```
myproject.com {
    reverse_proxy localhost:3000
}
```

---

## First Steps After Installation

Once your admin panel is running, here is what to do first:

### 1. Create Your First Content Model

Navigate to **Content → Schema Builder** in the admin panel.

Click **New Model**. Give it a name (e.g., `Post`). Add fields:

| Field | Type | Notes |
|---|---|---|
| `title` | Text | Required, used as the display title |
| `slug` | Slug | Auto-generated from title |
| `body` | Rich Text | WYSIWYG editor |
| `publishedAt` | DateTime | Optional, use for publish scheduling |
| `author` | Relation | Relates to the built-in User model |

Click **Save**. Volqan immediately:
- Creates the database table (or updates it if the model already exists)
- Generates a full CRUD admin panel for the model
- Exposes `GET /api/rest/posts` and the GraphQL `posts` query

Alternatively, define your model in TypeScript:

```typescript
// content/models/post.ts
import { defineModel } from '@volqan/core';

export const Post = defineModel({
  name: 'Post',
  fields: {
    title:       { type: 'text',      required: true },
    slug:        { type: 'slug',      from: 'title', unique: true },
    body:        { type: 'richtext' },
    publishedAt: { type: 'datetime',  nullable: true },
    author:      { type: 'relation',  model: 'User' },
  },
});
```

Then push the schema:

```bash
pnpm db:push
```

### 2. Build Your First Page

Navigate to **Pages → New Page** in the admin panel.

Use the drag-and-drop block editor to compose a page. Available block types at launch:

- Hero — title, subtitle, call to action button
- Rich Text — formatted content
- Image — media from the Media Manager
- Grid — responsive column layout
- Custom HTML — raw HTML block

Set a path (e.g., `/about`) and publish. The page is live immediately.

### 3. Install Your First Extension

Navigate to **Extensions → Browse Marketplace**.

This opens [bazarix.link](https://bazarix.link) in your browser. Find an extension, purchase or install it for free, and follow the extension's install instructions.

Alternatively, install a community extension directly by package name:

```bash
pnpm add @volqan-ext/blog
```

Then enable it in the Extension Manager, or add it to `volqan.config.ts`:

```typescript
// volqan.config.ts
import { defineConfig } from '@volqan/core';
import { BlogExtension } from '@volqan-ext/blog';

export default defineConfig({
  // ...
  extensions: {
    installed: [BlogExtension],
  },
});
```

### 4. Apply a Theme

Navigate to **Appearance → Themes** in the admin panel.

The **Default** theme ships with every Volqan installation. Install additional themes from the marketplace or build your own using the [Theme SDK](./theme-api.md).

---

## What's Next?

- Read the [Extension API documentation](./extension-api.md) to build your own extensions
- Read the [Theme API documentation](./theme-api.md) to build custom themes
- Check the [Roadmap](./roadmap.md) to see what's coming
- Join [GitHub Discussions](https://github.com/ReadyPixels/volqan/discussions) to ask questions and share what you build
- Consider a [Support Plan](./pricing.md#support-plans) to fund the project and remove the attribution footer

---

*Having trouble? [Open a discussion](https://github.com/ReadyPixels/volqan/discussions/categories/q-a) or [file an issue](https://github.com/ReadyPixels/volqan/issues).*
