---
title: Volqan Enterprise License Tier
description: Enterprise tier feature set, pricing model, and SLA commitments.
---

# Volqan Enterprise License Tier

## Overview

The Enterprise tier is for organizations requiring white-label deployment, custom SLAs, dedicated support, and compliance features. It is sold as an annual contract and activated via a `licenseKey` on the `Installation` model.

## Feature Set

| Feature | Community | Pro | Enterprise |
|---|---|---|---|
| Users | Unlimited | Unlimited | Unlimited |
| SSO (SAML/LDAP) | Skeleton | Full | Full + AD Groups sync |
| White-label | No | Logo/color | Full (domain + UI) |
| Audit log retention | 90 days | Unlimited | Unlimited + export |
| Support SLA | Community forum | 24h email | 4h response, named CSM |
| Custom branding | No | Partial | Full (remove all Volqan marks) |
| Uptime SLA | N/A | N/A | 99.9% (hosted) |
| Data residency | Self-hosted | Cloud (US) | Cloud (US/EU/custom) |
| GDPR tooling | Basic | Basic | Data export + deletion API |
| Custom extensions | Community | Certified | Private registry |
| License key issuance | No | Via Bazarix | Private Bazarix seller |
| Contract | None | Monthly/Annual | Annual (custom terms) |

## Activation

Enterprise license keys are issued manually by ReadyPixels and stored in `Installation.licenseKey`. The `isPro()` helper checks for `plan === 'enterprise'` as a superset of Pro.

## Pricing

- Base: $999/month (annual contract, billed annually = $11,988/year)
- Cloud hosting add-on: +$299/month per 10 tenants
- Custom data residency (EU/custom region): +$200/month
- SLA upgrade (99.99%): contact sales

## White-Label Scope

Enterprise customers may:
- Remove all "Powered by Volqan" attribution (per license)
- Replace admin panel logo, favicon, and color palette
- Host admin panel on a custom domain (e.g. `admin.acme.com`)
- Use their own OAuth app credentials (Google/GitHub)
- Rebrand email templates

## Support SLA

| Priority | Response Time | Resolution Target |
|---|---|---|
| P1 (site down) | 1 hour | 4 hours |
| P2 (major feature broken) | 4 hours | 24 hours |
| P3 (non-critical bug) | 1 business day | 1 week |
| P4 (question/enhancement) | 2 business days | Roadmap consideration |

Support delivered via dedicated Slack channel or email. Named Customer Success Manager assigned at contract signing.

## Contact

Enterprise inquiries: enterprise@volqan.link
