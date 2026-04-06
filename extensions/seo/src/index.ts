/**
 * @file index.ts
 * @description Volqan SEO Extension — official first-party search engine optimization.
 *
 * Adds SEO fields to all content types, provides a scoring widget, auto-generates
 * sitemaps and robots.txt, and exposes global SEO settings.
 */

import type {
  VolqanExtension,
  ExtensionContext,
  RouteDefinition,
  ContentHook,
  ContentHookPayload,
  SettingField,
  Widget,
} from '@volqan/core';
import { FieldType } from '@volqan/core';
import type { FieldDefinition } from '@volqan/core';
import { generateSitemap, generateRobotsTxt, contentEntriesToSitemapEntries } from './sitemap.js';
import { autoMetaDescription, analyzeSEO } from './analyzer.js';

// ---------------------------------------------------------------------------
// SEO field definitions
// ---------------------------------------------------------------------------

/**
 * SEO fields injected into every content type on install.
 * These are added as optional fields — they never break existing entries.
 */
export const seoFields: FieldDefinition[] = [
  {
    name: 'metaTitle',
    type: FieldType.TEXT,
    label: 'Meta Title',
    required: false,
    validation: { max: 60, message: 'Meta title should be 60 characters or less.' },
    hidden: false,
  },
  {
    name: 'metaDescription',
    type: FieldType.TEXT,
    label: 'Meta Description',
    required: false,
    validation: { max: 160, message: 'Meta description should be 160 characters or less.' },
    hidden: false,
  },
  {
    name: 'ogImage',
    type: FieldType.IMAGE,
    label: 'Open Graph Image',
    required: false,
    hidden: false,
  },
  {
    name: 'canonicalUrl',
    type: FieldType.URL,
    label: 'Canonical URL',
    required: false,
    hidden: false,
  },
  {
    name: 'noIndex',
    type: FieldType.BOOLEAN,
    label: 'No Index',
    required: false,
    default: false,
    hidden: false,
  },
  {
    name: 'structuredData',
    type: FieldType.JSON,
    label: 'Structured Data (JSON-LD)',
    required: false,
    hidden: false,
  },
];

// ---------------------------------------------------------------------------
// Admin settings
// ---------------------------------------------------------------------------

const adminSettings: SettingField[] = [
  {
    key: 'seo.siteTitleTemplate',
    label: 'Site Title Template',
    description: 'Use %s as a placeholder for the page title. E.g. "%s | Acme Corp".',
    type: 'text',
    defaultValue: '%s | My Site',
    required: false,
  },
  {
    key: 'seo.defaultOgImage',
    label: 'Default OG Image URL',
    description: 'Fallback Open Graph image when no per-page image is set.',
    type: 'url',
    defaultValue: '',
    required: false,
  },
  {
    key: 'seo.robotsTxtContent',
    label: 'Custom robots.txt Rules',
    description: 'Additional directives appended to the auto-generated robots.txt.',
    type: 'textarea',
    defaultValue: '',
    required: false,
  },
  {
    key: 'seo.sitemapEnabled',
    label: 'Enable Sitemap',
    description: 'Expose /api/seo/sitemap.xml with all published content.',
    type: 'boolean',
    defaultValue: true,
    required: false,
  },
  {
    key: 'seo.sitemapChangefreq',
    label: 'Default Change Frequency',
    description: 'How often content typically changes (used in sitemap).',
    type: 'select',
    options: [
      { label: 'Always', value: 'always' },
      { label: 'Hourly', value: 'hourly' },
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' },
      { label: 'Never', value: 'never' },
    ],
    defaultValue: 'weekly',
    required: false,
  },
  {
    key: 'seo.googleAnalyticsId',
    label: 'Google Analytics ID',
    description: 'GA4 Measurement ID (e.g. G-XXXXXXXXXX). Leave empty to disable.',
    type: 'text',
    defaultValue: '',
    pattern: '^G-[A-Z0-9]{8,}$',
    required: false,
  },
  {
    key: 'seo.googleSearchConsoleVerification',
    label: 'Google Search Console Verification',
    description: 'Verification meta tag content value from Google Search Console.',
    type: 'text',
    defaultValue: '',
    required: false,
  },
];

// ---------------------------------------------------------------------------
// Admin widgets
// ---------------------------------------------------------------------------

const adminWidgets: Widget[] = [
  {
    id: 'volqan-seo-score',
    name: 'SEO Score',
    defaultColSpan: 4,
    defaultRowSpan: 2,
    component: '@volqan/extension-seo/components/SEOPanel',
  },
];

// ---------------------------------------------------------------------------
// Content hooks
// ---------------------------------------------------------------------------

const contentHooks: ContentHook[] = [
  // Auto-generate metaDescription from body if empty on publish.
  {
    model: '*',
    event: 'beforeUpdate',
    async handler(payload: ContentHookPayload): Promise<ContentHookPayload | void> {
      if (!payload.data) return;

      const data = payload.data;

      // Only act when the entry is transitioning to PUBLISHED status.
      if (data['status'] !== 'PUBLISHED') return;

      // Auto-generate metaDescription from body if not provided.
      if (!data['metaDescription'] && data['body']) {
        data['metaDescription'] = autoMetaDescription(String(data['body']));
      }

      // Warn (via abort) if the entry is being published with a very poor SEO score.
      // We use a threshold of 25 — anything below that is severely under-optimised.
      const analysis = analyzeSEO(
        {
          body: data['body'] != null ? String(data['body']) : undefined,
          title: data['title'] != null ? String(data['title']) : undefined,
        },
        {
          metaTitle: data['metaTitle'] != null ? String(data['metaTitle']) : undefined,
          metaDescription: data['metaDescription'] != null ? String(data['metaDescription']) : undefined,
          ogImage: data['ogImage'] != null ? String(data['ogImage']) : undefined,
        },
      );

      if (analysis.score < 25 && payload.abort) {
        payload.abort(
          `SEO score is critically low (${analysis.score}/100). ` +
          `Please fix the following issues before publishing: ` +
          analysis.issues
            .filter((i) => i.severity === 'error')
            .map((i) => i.message)
            .join('; '),
        );
        return;
      }

      return payload;
    },
  },

  // On create: auto-generate metaDescription if body is present.
  {
    model: '*',
    event: 'beforeCreate',
    async handler(payload: ContentHookPayload): Promise<ContentHookPayload | void> {
      if (!payload.data) return;

      const data = payload.data;

      if (!data['metaDescription'] && data['body']) {
        data['metaDescription'] = autoMetaDescription(String(data['body']));
      }

      return payload;
    },
  },
];

// ---------------------------------------------------------------------------
// API route builder
// ---------------------------------------------------------------------------

function buildApiRoutes(ctx: ExtensionContext): RouteDefinition[] {
  return [
    // GET /api/seo/sitemap.xml
    {
      method: 'GET',
      path: '/api/seo/sitemap.xml',
      public: true,
      rateLimit: { maxRequests: 20, windowSeconds: 60 },
      async handler(_req) {
        try {
          const sitemapEnabled = ctx.config.get<boolean>('seo.sitemapEnabled') ?? true;
          if (!sitemapEnabled) {
            return { status: 404, body: 'Sitemap disabled' };
          }

          const siteUrl = String(ctx.config.get<string>('seo.siteUrl') ?? 'https://example.com');
          const changefreq = String(ctx.config.get<string>('seo.sitemapChangefreq') ?? 'weekly') as
            | 'always'
            | 'hourly'
            | 'daily'
            | 'weekly'
            | 'monthly'
            | 'yearly'
            | 'never';

          ctx.logger.debug('SEO: generating sitemap.xml');

          // In production: fetch all published content entries from the content service.
          // Here we return a minimal sitemap with just the homepage.
          const entries = contentEntriesToSitemapEntries(
            [],
            { slug: 'pages', urlPrefix: '', changefreq, priority: 0.8 },
            siteUrl,
          );

          // Always include the homepage.
          entries.unshift({
            loc: siteUrl,
            changefreq: 'daily',
            priority: 1.0,
          });

          const xml = generateSitemap(entries);

          return {
            status: 200,
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
            body: xml,
          };
        } catch (err) {
          ctx.logger.error('SEO: failed to generate sitemap', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // GET /api/seo/robots.txt
    {
      method: 'GET',
      path: '/api/seo/robots.txt',
      public: true,
      rateLimit: { maxRequests: 30, windowSeconds: 60 },
      async handler(_req) {
        try {
          const siteUrl = String(ctx.config.get<string>('seo.siteUrl') ?? 'https://example.com');
          const customRules = String(ctx.config.get<string>('seo.robotsTxtContent') ?? '');

          const content = generateRobotsTxt({
            siteUrl,
            sitemapUrl: `${siteUrl}/api/seo/sitemap.xml`,
            disallowPaths: ['/admin', '/api'],
            customRules,
          });

          return {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'public, max-age=86400',
            },
            body: content,
          };
        } catch (err) {
          ctx.logger.error('SEO: failed to generate robots.txt', err as Error);
          return { status: 500, body: 'Internal server error' };
        }
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Extension object
// ---------------------------------------------------------------------------

let _registeredRoutes: RouteDefinition[] = [];

const seoExtension: VolqanExtension = {
  id: 'volqan/seo',
  version: '0.1.0',
  name: 'SEO',
  description:
    'Official Volqan SEO extension. Adds meta fields, SEO scoring, XML sitemap generation, and robots.txt management to your CMS.',
  author: {
    name: 'Volqan',
    url: 'https://volqan.link',
  },

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  async onInstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('SEO: installing — injecting SEO fields into all content types');

    // Emit event so the Volqan core can add SEO fields to every registered content type.
    ctx.events.emit('content:injectFields', {
      model: '*',
      fields: seoFields,
    });

    // Store default settings.
    await ctx.config.set('seo.siteTitleTemplate', '%s | My Site');
    await ctx.config.set('seo.siteUrl', 'https://example.com');
    await ctx.config.set('seo.sitemapEnabled', true);
    await ctx.config.set('seo.sitemapChangefreq', 'weekly');

    ctx.logger.info('SEO: installation complete');
  },

  async onUninstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.warn('SEO: uninstalling — removing injected SEO fields');
    ctx.events.emit('content:removeFields', {
      model: '*',
      fieldNames: seoFields.map((f) => f.name),
    });
  },

  async onEnable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('SEO: enabling — registering API routes');
    _registeredRoutes = buildApiRoutes(ctx);
    ctx.events.emit('api:registerRoutes', _registeredRoutes);
  },

  async onDisable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('SEO: disabling — removing API routes');
    ctx.events.emit('api:unregisterRoutes', _registeredRoutes);
    _registeredRoutes = [];
  },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('SEO: booting');
    _registeredRoutes = buildApiRoutes(ctx);
    ctx.events.emit('api:registerRoutes', _registeredRoutes);
  },

  // -------------------------------------------------------------------------
  // Admin UI
  // -------------------------------------------------------------------------

  adminWidgets,
  adminSettings,

  adminPages: [
    {
      path: 'seo/settings',
      title: 'SEO Settings',
      component: '@volqan/extension-seo/pages/SEOSettings',
      layout: 'default',
    },
  ],

  // -------------------------------------------------------------------------
  // Content hooks
  // -------------------------------------------------------------------------

  contentHooks,

  // -------------------------------------------------------------------------
  // Routes (populated at boot)
  // -------------------------------------------------------------------------

  apiRoutes: [],

  // -------------------------------------------------------------------------
  // Marketplace metadata
  // -------------------------------------------------------------------------

  marketplace: {
    category: 'seo',
    tags: ['seo', 'sitemap', 'meta', 'robots', 'google', 'analytics', 'score'],
    screenshotUrls: [],
    demoUrl: 'https://demo.volqan.link/admin/seo',
  },
};

export default seoExtension;

// Named re-exports
export { analyzeSEO, autoMetaDescription } from './analyzer.js';
export type {
  SeoAnalysis,
  SeoIssue,
  SeoMeta,
  SeoContent,
  SeverityLevel,
} from './analyzer.js';
export { generateSitemap, generateSitemapIndex, generateRobotsTxt, contentEntriesToSitemapEntries } from './sitemap.js';
export type { SitemapEntry, SitemapImage, SitemapIndex, ContentEntry, ContentTypeConfig } from './sitemap.js';
export { SEOPanel } from './components/SEOPanel.js';
export type { SEOPanelProps } from './components/SEOPanel.js';
