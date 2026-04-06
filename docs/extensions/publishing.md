---
title: Publishing Extensions — Volqan
description: How to prepare and publish your Volqan extension to the Bazarix marketplace.
---

# Publishing Extensions

This guide covers everything you need to publish your Volqan extension on the [Bazarix marketplace](https://bazarix.link).

---

## Preparing Your Extension

Before publishing, ensure your extension meets these requirements:

### 1. Package.json Requirements

Your `package.json` must include:

```json
{
  "name": "@yourvendor/volqan-extension-my-ext",
  "version": "1.0.0",
  "description": "A clear, one-sentence description of what your extension does.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "author": {
    "name": "Your Name",
    "url": "https://yoursite.com"
  },
  "license": "MIT",
  "keywords": [
    "volqan",
    "volqan-extension",
    "your-category"
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
| `name` | Must follow `@vendor/volqan-extension-*` naming convention |
| `version` | Semver string. Start at `1.0.0` for your first public release. |
| `description` | Clear, concise description (shown in marketplace search) |
| `main` | Points to compiled JavaScript entry |
| `types` | Points to TypeScript declaration entry |
| `peerDependencies` | Must declare `@volqan/core` as a peer dependency |
| `license` | Must include a license (MIT, Apache-2.0, or commercial) |

### 2. Extension Identity

Your `VolqanExtension` object must have:

```typescript
{
  id: 'yourvendor/my-extension',  // Must match your Bazarix vendor account
  version: '1.0.0',               // Must match package.json version
  name: 'My Extension',           // Clear, descriptive name
  description: 'What your extension does in one sentence.',
  author: {
    name: 'Your Name',
    url: 'https://yoursite.com',
  },
}
```

### 3. Build Output

Run a clean build and verify:

```bash
pnpm build
npx tsc --noEmit  # Zero TypeScript errors
```

Ensure `dist/` contains:
- `index.js` — compiled JavaScript
- `index.d.ts` — TypeScript declarations

---

## Writing a Good README

Your extension's `README.md` is displayed on the Bazarix marketplace listing. Include:

1. **Title and description** — What the extension does
2. **Screenshots** — At least 2 screenshots showing the extension in action
3. **Features** — Bulleted list of capabilities
4. **Installation** — How to install (usually `pnpm add @vendor/volqan-extension-*`)
5. **Configuration** — Required settings and how to configure them
6. **Usage** — How to use the extension after installation
7. **API** — If your extension exposes API routes, document them
8. **Changelog** — Version history

### Screenshots

- Minimum 2 screenshots, recommended 4–6
- Resolution: 1280×720 or higher
- Format: PNG or WebP
- Show the extension working in the Volqan admin panel
- Include light and dark mode screenshots if applicable

Host screenshots on a reliable CDN (Cloudflare R2, AWS S3, or similar). Reference them in the `marketplace.screenshotUrls` array:

```typescript
marketplace: {
  screenshotUrls: [
    'https://cdn.yoursite.com/screenshots/overview.png',
    'https://cdn.yoursite.com/screenshots/settings.png',
    'https://cdn.yoursite.com/screenshots/dashboard-widget.png',
  ],
},
```

---

## Submitting to the Bazarix Marketplace

### 1. Create a Bazarix developer account

Sign up at [bazarix.link/developers](https://bazarix.link/developers) with your GitHub account.

### 2. Register your vendor namespace

Choose a unique vendor namespace (e.g. `acme`). This namespace is used in your extension ID (`acme/my-extension`).

### 3. Submit your extension

Use the Bazarix Developer Portal to submit:

1. Upload your built extension package (`.tgz` from `npm pack`)
2. Fill in marketplace metadata (category, tags, screenshots)
3. Set pricing (free or paid)
4. Submit for review

### 4. Review process

The Bazarix team reviews every submission for:

- **Security** — No malicious code, no data exfiltration
- **Quality** — Proper error handling, no crashes
- **Compatibility** — Works with current Volqan version
- **Naming** — No trademark conflicts

Review typically takes 2–5 business days.

---

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org):

| Version bump | When to use | Example |
|---|---|---|
| **Patch** (1.0.x) | Bug fixes, no API changes | `1.0.0 → 1.0.1` |
| **Minor** (1.x.0) | New features, backward-compatible | `1.0.1 → 1.1.0` |
| **Major** (x.0.0) | Breaking changes | `1.1.0 → 2.0.0` |

To publish an update:

1. Bump the version in both `package.json` and your `VolqanExtension` object
2. Rebuild: `pnpm build`
3. Submit the new version through the Bazarix Developer Portal

Volqan's Extension Manager automatically detects available updates and notifies admin users.

---

## Extension Certification

Bazarix offers an optional certification program for extensions that meet higher quality standards.

### Certification Requirements

- **Test coverage** — Automated tests covering core functionality
- **Documentation** — Complete README with installation, configuration, and usage sections
- **Error handling** — Graceful error recovery, no unhandled exceptions
- **Performance** — No measurable impact on admin panel load time
- **Accessibility** — Admin pages meet WCAG 2.1 AA standards
- **Security audit** — Passes automated and manual security review

Certified extensions receive a "Certified" badge on the marketplace and higher search ranking.

---

## Revenue Sharing

> ⚠️ **LEGAL REVIEW NEEDED** — The following revenue sharing terms are subject to change. Consult the latest Bazarix Developer Agreement at [bazarix.link/legal](https://bazarix.link/legal) for current terms.

### Standard Split

Paid extensions use a **70/30 revenue split**:

| Party | Share |
|---|---|
| Developer | **70%** |
| Platform Service Fee | **30%** |

### Partner Tier

Developers accepted into the Bazarix Partner Program receive an improved **65/35 split**:

| Party | Share |
|---|---|
| Developer | **65%** |
| Platform Service Fee | **35%** |

> Note: The Partner Tier label "65/35" reflects a different program structure with additional platform services included. See the Bazarix Developer Agreement for full details.

### Pricing Rules

- **Minimum price:** $5
- **Maximum price:** $999
- **Currency:** USD only
- **Billing:** Handled entirely by Bazarix — you receive payouts monthly

The Platform Service Fee covers payment processing, CDN hosting, license validation infrastructure, marketplace listing, and customer support infrastructure.

---

## Checklist

Before submitting, verify:

- [ ] `package.json` has all required fields
- [ ] Extension `id` matches your Bazarix vendor namespace
- [ ] `version` matches in `package.json` and the `VolqanExtension` object
- [ ] `pnpm build` completes with zero errors
- [ ] `npx tsc --noEmit` passes
- [ ] README includes description, screenshots, features, installation, and usage
- [ ] At least 2 screenshots hosted on a reliable CDN
- [ ] Marketplace metadata is set in the `VolqanExtension` object
- [ ] License file is included
- [ ] No hardcoded secrets, API keys, or credentials in source code
