---
title: Volqan Cloud — Multi-Tenant Hosted Architecture
description: Design for the Volqan hosted/cloud version with multi-tenant isolation.
---

# Volqan Cloud — Multi-Tenant Architecture Design

## Tenancy Model

Each customer gets an isolated **workspace** with its own:
- Database schema (PostgreSQL schema-per-tenant, shared cluster)
- File storage prefix (`/uploads/{tenantId}/`)
- Session namespace (session tokens prefixed by `tenantId`)
- Subdomain: `{slug}.volqan.app`

## Data Isolation Strategy

**Schema-per-tenant** on PostgreSQL (not row-level multi-tenancy):

```sql
-- Each tenant gets a dedicated schema
CREATE SCHEMA tenant_{tenantId};
SET search_path TO tenant_{tenantId};
-- All Volqan tables exist within the tenant schema
```

Prisma datasource switches schemas via `DATABASE_URL` with `?schema=tenant_{id}`.

## Tenant Provisioning Flow

1. Customer signs up at `volqan.app/signup`
2. Provisioning service creates:
   - `Tenant` record in the control plane DB
   - PostgreSQL schema: `tenant_{id}`
   - Runs `prisma migrate deploy` against new schema
   - Creates initial SUPER_ADMIN user
   - Allocates subdomain `{slug}.volqan.app`
3. Welcome email with admin URL and credentials

## Control Plane

Separate Next.js app (`packages/cloud`) managing:
- Tenant CRUD (create, suspend, delete)
- Billing (Stripe subscriptions per tenant)
- Usage metering (content count, storage bytes, API calls)
- Subdomain routing (wildcard DNS `*.volqan.app` → Nginx/Cloudflare → tenant router)

## Tenant Router

Next.js middleware reads `Host` header, looks up tenant by subdomain, injects `X-Tenant-Id` header, routes to shared admin app with tenant-scoped Prisma client.

## Storage

Cloudflare R2 (or S3-compatible) with prefix isolation:
- `volqan-cloud/{tenantId}/uploads/`
- Pre-signed URLs scoped to tenant prefix

## Infrastructure Stack

| Component | Technology |
|---|---|
| App | Next.js 15, Node.js 22 |
| Database | PostgreSQL 16, schema-per-tenant |
| Cache | Redis (shared, key-prefixed by tenantId) |
| Storage | Cloudflare R2 |
| CDN | Cloudflare |
| DNS | Wildcard `*.volqan.app` |
| Deployment | Docker + Kubernetes or Railway |
| Billing | Stripe Subscriptions + usage metering |

## Security Boundaries

- Tenant ID injected server-side only; never trusted from client
- All DB queries scoped to tenant schema via Prisma middleware
- Cross-tenant data access impossible by construction (separate schemas)
- Admin API keys scoped to tenant at creation time
