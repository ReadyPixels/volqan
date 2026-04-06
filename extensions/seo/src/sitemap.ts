/**
 * @file sitemap.ts
 * @description XML sitemap generator for the Volqan SEO extension.
 *
 * Generates a standards-compliant sitemap XML document from all published
 * content entries across every registered content type.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  /** Absolute URL of the page. */
  loc: string;
  /** ISO 8601 date-time of last modification. */
  lastmod?: string;
  /** How frequently the content changes. */
  changefreq?: ChangeFreq;
  /** Priority relative to other URLs on the site (0.0–1.0). */
  priority?: number;
  /** Optional image entries for this URL. */
  images?: SitemapImage[];
}

export interface SitemapImage {
  /** Absolute URL of the image. */
  loc: string;
  /** Image caption. */
  caption?: string;
  /** Geo location of the image. */
  geoLocation?: string;
  /** Image title. */
  title?: string;
  /** License URL. */
  license?: string;
}

export interface SitemapIndex {
  /** Individual sitemap file entries in a sitemap index. */
  sitemaps: Array<{
    loc: string;
    lastmod?: string;
  }>;
}

export interface ContentEntry {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
  status?: string;
  featuredImage?: { url?: string; alt?: string; title?: string } | null;
}

export interface ContentTypeConfig {
  /** Slug of the content type (e.g. "posts", "pages"). */
  slug: string;
  /** URL prefix for entries of this type (e.g. "/blog", "/pages"). */
  urlPrefix: string;
  /** Default change frequency for entries of this type. */
  changefreq?: ChangeFreq;
  /** Default priority for entries of this type (0.0–1.0). */
  priority?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(isoString: string): string {
  // Sitemap spec recommends W3C date-time (subset of ISO 8601)
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]!;
  return d.toISOString().split('T')[0]!;
}

function renderImage(img: SitemapImage): string {
  const lines: string[] = ['    <image:image>'];
  lines.push(`      <image:loc>${escapeXml(img.loc)}</image:loc>`);
  if (img.caption) {
    lines.push(`      <image:caption>${escapeXml(img.caption)}</image:caption>`);
  }
  if (img.title) {
    lines.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
  }
  if (img.geoLocation) {
    lines.push(`      <image:geo_location>${escapeXml(img.geoLocation)}</image:geo_location>`);
  }
  if (img.license) {
    lines.push(`      <image:license>${escapeXml(img.license)}</image:license>`);
  }
  lines.push('    </image:image>');
  return lines.join('\n');
}

function renderUrl(entry: SitemapEntry): string {
  const lines: string[] = ['  <url>'];

  lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);

  if (entry.lastmod) {
    lines.push(`    <lastmod>${escapeXml(formatDate(entry.lastmod))}</lastmod>`);
  }

  if (entry.changefreq) {
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }

  if (entry.priority !== undefined) {
    lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  }

  if (entry.images && entry.images.length > 0) {
    for (const img of entry.images) {
      lines.push(renderImage(img));
    }
  }

  lines.push('  </url>');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a complete XML sitemap document from a list of SitemapEntry objects.
 *
 * @example
 * ```ts
 * const xml = generateSitemap([
 *   { loc: 'https://example.com/', priority: 1.0, changefreq: 'daily' },
 *   { loc: 'https://example.com/blog/hello-world', lastmod: '2024-01-15', changefreq: 'weekly' },
 * ]);
 * ```
 */
export function generateSitemap(entries: SitemapEntry[]): string {
  const urlElements = entries.map(renderUrl).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    urlElements,
    '</urlset>',
  ].join('\n');
}

/**
 * Generates a sitemap index XML document that references multiple sitemap files.
 * Useful for large sites that split content into multiple per-type sitemaps.
 */
export function generateSitemapIndex(index: SitemapIndex): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const sitemap of index.sitemaps) {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${escapeXml(sitemap.loc)}</loc>`);
    if (sitemap.lastmod) {
      lines.push(`    <lastmod>${escapeXml(formatDate(sitemap.lastmod))}</lastmod>`);
    }
    lines.push('  </sitemap>');
  }

  lines.push('</sitemapindex>');
  return lines.join('\n');
}

/**
 * Converts a list of published content entries for a given content type
 * into SitemapEntry objects ready for generateSitemap().
 *
 * @param entries - Published content entries from the Volqan content API.
 * @param config  - URL prefix and frequency/priority defaults for this type.
 * @param siteUrl - Base site URL (e.g. "https://example.com").
 */
export function contentEntriesToSitemapEntries(
  entries: ContentEntry[],
  config: ContentTypeConfig,
  siteUrl: string,
): SitemapEntry[] {
  return entries
    .filter((e) => !e.status || e.status === 'PUBLISHED')
    .map((entry): SitemapEntry => {
      const lastmod = entry.updatedAt ?? entry.publishedAt;
      const images: SitemapImage[] = [];

      if (entry.featuredImage?.url) {
        images.push({
          loc: entry.featuredImage.url,
          title: entry.featuredImage.title,
          caption: entry.featuredImage.alt,
        });
      }

      return {
        loc: `${siteUrl}${config.urlPrefix}/${entry.slug}`,
        lastmod,
        changefreq: config.changefreq ?? 'weekly',
        priority: config.priority ?? 0.7,
        images: images.length > 0 ? images : undefined,
      };
    });
}

/**
 * Generates a robots.txt content string from the given configuration.
 */
export function generateRobotsTxt(options: {
  siteUrl: string;
  sitemapUrl?: string;
  disallowPaths?: string[];
  customRules?: string;
}): string {
  const {
    siteUrl,
    sitemapUrl = `${siteUrl}/api/seo/sitemap.xml`,
    disallowPaths = ['/admin', '/api'],
    customRules = '',
  } = options;

  const lines: string[] = [
    '# robots.txt generated by Volqan SEO Extension',
    '# https://volqan.link',
    '',
    'User-agent: *',
  ];

  for (const path of disallowPaths) {
    lines.push(`Disallow: ${path}`);
  }

  lines.push('Allow: /');
  lines.push('');
  lines.push(`Sitemap: ${sitemapUrl}`);

  if (customRules.trim()) {
    lines.push('');
    lines.push('# Custom rules');
    lines.push(customRules.trim());
  }

  return lines.join('\n');
}
