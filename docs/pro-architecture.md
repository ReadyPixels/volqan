---
title: Volqan Pro — Feature Differentiation Plan
description: Architecture and feature plan for the Volqan Pro tier.
---

# Volqan Pro — Feature Differentiation Architecture

## Overview

Volqan Pro is a paid tier on top of the open-core Community edition. It activates via a Support Plan subscription (managed through Stripe + the `Installation` model). Pro features are gated by the `plan` field on the `Installation` record.

## Gating Mechanism

The `Installation` model (`packages/core/prisma/schema.prisma`) stores `plan: String @default("community")`. Pro features check this at runtime:

```ts
// packages/core/src/lib/plan.ts
import { db } from './db';

export async function isPro(): Promise<boolean> {
  const install = await db.installation.findFirst();
  return install?.plan === 'pro' || install?.plan === 'enterprise';
}
```

API routes wrap Pro-only endpoints with a guard:

```ts
if (!(await isPro())) return json({ error: 'This feature requires Volqan Pro.' }, 402);
```

## Pro Feature Set

| Feature | Community | Pro |
|---|---|---|
| Content types | Unlimited | Unlimited |
| Users | Unlimited | Unlimited |
| API requests/month | Unlimited (self-hosted) | Unlimited |
| Extensions | Community only | + Certified extensions |
| SSO (SAML/LDAP) | Config UI only | Full validation |
| Content workflow | Basic (submit/approve) | Custom stages, SLA alerts |
| Audit log retention | 90 days | Unlimited |
| Redis caching | Self-configured | Managed config UI |
| White-label admin | No | Custom logo, colors, domain |
| Priority support | No | Yes (SLA: 24h response) |
| License key issuance | No | Yes (via Bazarix) |

## Activation Flow

1. User visits `/settings/billing` → clicks "Upgrade to Pro"
2. Redirected to Stripe Checkout (existing `/api/billing/checkout`)
3. Stripe webhook `checkout.session.completed` → `db.installation.update({ plan: 'pro' })`
4. Admin UI unlocks Pro sections immediately on next page load

## White-Label Implementation

Pro installations can set:
- `site.logo` setting → replaces Volqan logo in TopBar
- `site.adminTitle` setting → replaces "Volqan Admin" page title
- `site.primaryColor` setting → overrides CSS `--primary` token
- Custom domain for admin panel (DNS CNAME + SSL via Let's Encrypt)

The "Powered by Volqan" attribution footer is suppressed for active Pro subscribers (per Open Core Attribution License v1.0 §3).
