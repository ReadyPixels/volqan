---
title: Pricing — Volqan
description: Volqan is free and open source forever. Support Plans fund continued development. No hidden fees.
---

# Pricing

Volqan is free and open source. There is no free trial that expires. There is no feature lock. You can run it in production, for commercial clients, handling millions of requests, with zero payment to anyone.

The Support Plan is an optional subscription that funds continued development and gives you priority access to the maintainer.

---

## The Framework

### Free — Forever

```
$0 / month
No credit card required
No usage limits
No watermarked exports
No "free tier" that expires
```

Everything in Volqan is yours:

- Unlimited content models
- Unlimited admin users
- Auto-generated REST and GraphQL APIs
- Extension engine — install any community extension
- Theme engine — install any community theme
- Embedded AI assistant
- Visual page builder
- Docker self-hosting
- Full source code — modify anything

**The only requirement of the free license:** Your deployment must display the attribution notice `"Powered by Volqan — volqan.link"` in a location reasonably visible to administrators, such as the admin panel footer.

This requirement exists to help Volqan grow. You may remove it with a Support Plan.

See the [Attribution Policy](./legal/attribution-policy.md) for full details.

---

## Support Plans

Support Plans are how this project stays alive. Every subscription goes directly to the maintainer who builds and maintains Volqan.

### What You Get

All Support Plans include:

- **Attribution removal** — Remove the "Powered by Volqan" footer from your installation via the licensing API. The removal is automatic and takes effect within 24 hours.
- **Priority support** — Your GitHub issues and discussions are triaged first. Expect a response within one business day.
- **Direct maintainer access** — Email the maintainer directly at [sharif@readypixels.com](mailto:sharif@readypixels.com) for architecture questions, upgrade guidance, and deployment troubleshooting.
- **Early access** — Access to release candidates and beta features before they ship publicly.
- **Roadmap input** — Vote on and influence which roadmap items get prioritized next.

### Plans

| | Support — Yearly | Support — Monthly |
|---|---|---|
| **Billing** | Billed once per year | Billed monthly |
| **Attribution removal** | ✓ | ✓ |
| **Priority support** | ✓ | ✓ |
| **Direct maintainer access** | ✓ | ✓ |
| **Early access** | ✓ | ✓ |
| **Roadmap input** | ✓ | ✓ |
| **Savings** | Best value | 25% higher than yearly/12 |

> **Note:** Specific pricing is set by the owner at launch and displayed on the checkout page. The monthly plan is always priced at (yearly price ÷ 12) × 1.25. This 25% monthly uplift is non-negotiable — it accounts for higher payment processing overhead per transaction, churn-adjusted cash flow variance, and billing cycle administration costs.

**Purchase a Support Plan → [volqan.link/pricing](https://volqan.link/pricing)**

### How Attribution Removal Works

When your Support Plan is active, the Volqan attribution footer is automatically hidden. The process:

1. You purchase a Support Plan. Stripe confirms the payment.
2. The Bazarix license API records your installation ID and plan status.
3. Your Volqan installation calls `https://bazarix.link/api/v1/license/check` on every admin panel boot, with a 3-second timeout. The result is cached for 24 hours.
4. If your subscription is active, `attributionRemoved: true` is returned and the footer does not render.
5. If your subscription lapses, `attributionRemoved: false` is returned and the footer reappears automatically — no manual action required on either side.

There is a 7-day grace period for failed payment retries before attribution restoration.

### Refunds

- **Yearly plans:** Eligible for a prorated refund within 14 days of the annual payment date. Attribution removal entitlement is revoked immediately upon refund.
- **Monthly plans:** Non-refundable after the billing date.
- **Platform Service Fees:** Non-refundable in all cases.

See the full [Refund Policy](./legal/refund-policy.md).

---

## Marketplace Purchases (Bazarix)

When you purchase extensions or themes from [Bazarix](https://bazarix.link), a Platform Service Fee is applied to every transaction in addition to the listing price.

### Platform Service Fee Formula

```
Fee = $0.50 flat fee
    + 10% of the listing price
    + $0.50 additional surcharge (PayPal only)
```

**Worked Examples:**

| Listing Price | Payment Method | Fee | Total You Pay |
|---|---|---|---|
| $5.00 | Card | $0.50 + $0.50 = **$1.00** | **$6.00** |
| $20.00 | Card | $0.50 + $2.00 = **$2.50** | **$22.50** |
| $49.00 | Card | $0.50 + $4.90 = **$5.40** | **$54.40** |
| $99.00 | Card | $0.50 + $9.90 = **$10.40** | **$109.40** |
| $20.00 | PayPal | $0.50 + $2.00 + $0.50 = **$3.00** | **$23.00** |
| $49.00 | PayPal | $0.50 + $4.90 + $0.50 = **$5.90** | **$54.90** |

The Platform Service Fee is always shown as a separate line item before you confirm payment. You will never be surprised by it.

> "A Platform Service Fee is applied to all transactions to cover secure global payment infrastructure, international disbursement logistics, currency conversion operations, and platform maintenance."

See the complete [Fee Disclosure](./legal/fee-disclosure.md) for the full formula, justification, and regulatory disclosure.

### Seller Revenue Split

Of every listing price paid by a buyer:
- **70%** goes to the seller
- **30%** goes to the platform

The Platform Service Fee is separate and retained entirely by the platform.

**Example:** A seller lists an extension at $49.00. A buyer pays $54.40 (card). The seller receives $34.30 (70% of $49.00). The platform receives $14.70 (30% of $49.00) plus the $5.40 Platform Service Fee.

---

## Pricing FAQ

**Is Volqan truly free for commercial use?**

Yes. You can build commercial products, charge your clients, and earn revenue using Volqan without paying anything. The only requirement is displaying the attribution notice, which can be removed with a Support Plan.

**Can I remove the attribution notice without a Support Plan?**

No. Removing the attribution notice without an active Support Plan is a material breach of the Open Core Attribution License v1.0 and subjects the deployment to legal consequences. See the [Attribution Policy](./legal/attribution-policy.md) for details.

**Does the Support Plan cover multiple installations?**

Pricing and per-installation terms are set at launch. Check the checkout page for current terms.

**What happens when my Support Plan expires?**

Attribution removal is revoked automatically — no action required on your part. The "Powered by Volqan" footer will reappear in your admin panel within 24 hours of the license check following expiry. There is a 7-day grace period for payment retries on failing subscriptions.

**Is the Platform Service Fee charged on Support Plan payments?**

Yes. A Platform Service Fee is applied to all transactions processed through the platform, including Support Plan subscriptions.

**Can I pay with PayPal?**

Yes. A $0.50 additional surcharge applies to PayPal payments. This is disclosed before payment confirmation.

**Are there refunds for marketplace purchases?**

Marketplace purchases from Bazarix are governed by the [Bazarix Buyer Terms](https://bazarix.link/legal/buyer-terms). Generally, no refund is issued after a download, unless the listing is materially misrepresented.

**Is there a Pro version or hosted/managed version?**

Not yet. Both are on the roadmap for Phase 4 (Months 7–12). See the [Roadmap](./roadmap.md#phase-4--pro-and-growth-months-712).

**What currency are prices in?**

All prices are in US Dollars (USD).

---

## Coming Soon

The following are planned for future phases and are not yet available:

| Product | Description | Target |
|---|---|---|
| **Volqan Pro** | Closed-source version with advanced workflow, SSO, and audit tools | Phase 4 (Month 7–12) |
| **Volqan Cloud** | Fully managed hosted version — no servers, no ops | Phase 5 (Year 2+) |
| **Enterprise White-label** | Agency-scale licensing for large forks | Phase 5 (Year 2+) |

These will be separate products with their own pricing. The open-source version remains free forever regardless of what Pro or Cloud offer.

---

## Questions?

- [GitHub Discussions — Q&A](https://github.com/ReadyPixels/volqan/discussions/categories/q-a) — public questions answered by the community and maintainer
- [Email the maintainer](mailto:sharif@readypixels.com) — for Support Plan holders and private inquiries
- [GitHub Sponsors](https://github.com/sponsors/ReadyPixels) — alternative way to support the project without a Support Plan
