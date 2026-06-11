---
title: Volqan Documentation Course — Outline
description: Gumroad course outline for the official Volqan developer course.
---

# Volqan Documentation Course

**Platform:** Gumroad  
**Format:** Written guide + video walkthroughs  
**Price:** $29 (launch), $49 (regular)  
**Target audience:** Developers who want to build production applications with Volqan

---

## Module 1 — Getting Started (Free preview)

1. What is Volqan and when to use it
2. Installing Volqan with `npx create-volqan-app`
3. Tour of the admin panel
4. Your first content type in 5 minutes
5. Deploying with Docker Compose

## Module 2 — Content Modeling

1. Understanding field types (17 field types overview)
2. Building a blog: Posts, Authors, Categories
3. Building an e-commerce catalog: Products, Variants, SKUs
4. Relations between content types
5. Content validation rules
6. The content workflow: draft → review → publish

## Module 3 — The API Layer

1. Auto-generated REST API overview
2. Filtering, sorting, and pagination
3. Auto-generated GraphQL API
4. Authentication — API keys vs session tokens
5. Webhooks: reacting to content events
6. Rate limiting and caching

## Module 4 — The Admin Panel

1. User roles and permissions (SUPER_ADMIN → VIEWER)
2. OAuth login (Google, GitHub)
3. Password reset and email verification
4. The media library
5. Customizing the sidebar
6. Dark mode and themes

## Module 5 — Extensions

1. What extensions can do
2. Installing extensions from Bazarix
3. Building your first extension with `@volqan/extension-sdk`
4. Registering admin pages, API routes, and lifecycle hooks
5. Publishing to Bazarix

## Module 6 — Themes

1. The design token system
2. Building a custom theme with `@volqan/theme-sdk`
3. CSS custom properties and live preview
4. Publishing your theme to Bazarix

## Module 7 — The Page Builder

1. Block types overview
2. Building a landing page
3. Creating custom blocks
4. Publishing pages to your frontend

## Module 8 — AI Assistant

1. Connecting your LLM provider (OpenAI, Claude, Gemini, Ollama)
2. Using the AI assistant for content generation
3. Building AI-powered workflows

## Module 9 — Production Deployment

1. Environment variables reference
2. PostgreSQL setup and Prisma migrations
3. File storage: local vs S3/Cloudflare R2
4. Running behind a reverse proxy (Nginx/Caddy)
5. Monitoring and health checks
6. Backup strategies

## Module 10 — Pro and Enterprise Features

1. SSO with SAML 2.0 and LDAP/Active Directory
2. Redis caching configuration
3. Content scheduling
4. Outbound webhooks
5. White-label configuration
6. Upgrading to Pro

---

## Bonus: Real-World Projects

- **Project A:** Build a company blog with SEO and RSS
- **Project B:** Build a product catalog with Stripe checkout
- **Project C:** Build a multi-author editorial workflow
- **Project D:** Build a documentation site with versioning
