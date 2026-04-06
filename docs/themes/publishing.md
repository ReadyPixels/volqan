---
title: Publishing Themes — Volqan
description: How to prepare and publish your Volqan theme to the Bazarix marketplace.
---

# Publishing Themes

This guide covers everything you need to publish your Volqan theme on the [Bazarix marketplace](https://bazarix.link).

---

## Preparing Your Theme

### 1. Package.json Requirements

Your `package.json` must include:

```json
{
  "name": "@yourvendor/volqan-theme-my-theme",
  "version": "1.0.0",
  "description": "A clear, one-sentence description of your theme's visual style.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "author": {
    "name": "Your Name",
    "url": "https://yoursite.com"
  },
  "license": "MIT",
  "keywords": [
    "volqan",
    "volqan-theme",
    "dark"
  ],
  "peerDependencies": {
    "@volqan/core": ">=0.1.0"
  },
  "engines": {
    "node": ">=22"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

**Required fields:**

| Field | Description |
|---|---|
| `name` | Must follow `@vendor/volqan-theme-*` naming convention |
| `version` | Semver string. Start at `1.0.0` for first public release. |
| `description` | Describe the visual style (shown in marketplace search) |
| `main` | Points to compiled JavaScript entry |
| `types` | Points to TypeScript declaration entry |
| `peerDependencies` | Must declare `@volqan/core` as a peer dependency |
| `license` | Must include a license (MIT, Apache-2.0, or commercial) |

### 2. Theme Identity

Your `VolqanTheme` object must have:

```typescript
{
  id: 'yourvendor/my-theme',  // Must match your Bazarix vendor account
  name: 'My Theme',           // Clear, descriptive name
  version: '1.0.0',           // Must match package.json version
}
```

### 3. Build and Validate

```bash
pnpm build
npx tsc --noEmit  # Zero TypeScript errors
```

---

## Screenshot and Preview Requirements

Themes are visual products — high-quality screenshots are essential.

### Screenshots

- **Minimum:** 3 screenshots
- **Recommended:** 5–8 screenshots covering different admin views
- **Resolution:** 1440×900 or higher
- **Format:** PNG or WebP

**Required screenshots:**

1. Dashboard overview
2. Content list page
3. Content editor page
4. Settings page
5. (Optional) Mobile/responsive view

### Preview URL

Provide a live preview URL where users can interact with your theme applied to a Volqan demo instance:

```typescript
marketplace: {
  category: 'dark',
  previewUrl: 'https://demo.yoursite.com/themes/my-theme',
},
```

The preview URL should:
- Load quickly (under 3 seconds)
- Show realistic content (not placeholder text)
- Be publicly accessible without login
- Remain available as long as the theme is listed

---

## Submitting to the Bazarix Marketplace

### 1. Create a Bazarix developer account

Sign up at [bazarix.link/developers](https://bazarix.link/developers).

### 2. Register your vendor namespace

Choose a unique vendor namespace (e.g. `acme`). This is used in your theme ID (`acme/my-theme`).

### 3. Submit your theme

Use the Bazarix Developer Portal:

1. Upload your built theme package (`.tgz` from `npm pack`)
2. Upload screenshots
3. Set the marketplace category
4. Set pricing (free or paid)
5. Submit for review

### 4. Review process

The Bazarix team reviews every theme for:

- **Completeness** — All required tokens are defined
- **Accessibility** — Text contrast meets WCAG 2.1 AA (4.5:1 ratio)
- **Consistency** — Component overrides don't break admin functionality
- **Performance** — No excessive CSS or blocking font loads

Review typically takes 2–5 business days.

---

## Revenue Sharing

> ⚠️ **LEGAL REVIEW NEEDED** — The following revenue sharing terms are subject to change. Consult the latest Bazarix Developer Agreement at [bazarix.link/legal](https://bazarix.link/legal) for current terms.

### Standard Split

Paid themes use a **70/30 revenue split**:

| Party | Share |
|---|---|
| Developer | **70%** |
| Platform Service Fee | **30%** |

### Partner Tier

Developers in the Bazarix Partner Program receive a **65/35 split**:

| Party | Share |
|---|---|
| Developer | **65%** |
| Platform Service Fee | **35%** |

### Pricing Rules

- **Minimum price:** $5
- **Maximum price:** $999
- **Currency:** USD only
- **Billing:** Handled entirely by Bazarix — monthly payouts

The Platform Service Fee covers payment processing, CDN hosting, license validation, marketplace listing, and customer support infrastructure.

---

## Checklist

Before submitting, verify:

- [ ] `package.json` has all required fields
- [ ] Theme `id` matches your Bazarix vendor namespace
- [ ] `version` matches in `package.json` and the `VolqanTheme` object
- [ ] All required token categories are defined (colors, typography, spacing, radius, shadows, animation)
- [ ] Color contrast meets WCAG 2.1 AA standards (4.5:1 for text)
- [ ] `pnpm build` completes with zero errors
- [ ] `npx tsc --noEmit` passes
- [ ] At least 3 screenshots uploaded
- [ ] Preview URL is accessible and loads quickly
- [ ] Marketplace metadata is set in the `VolqanTheme` object
- [ ] License file is included
- [ ] README includes description, screenshots, and token overview
