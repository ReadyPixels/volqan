/**
 * @file rss.ts
 * @description RSS 2.0 feed generator for the Volqan Blog extension.
 *
 * Produces a standards-compliant XML feed for blog posts, consumable by
 * feed readers, podcast aggregators, and search engine crawlers.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RssItem {
  /** Post title. */
  title: string;
  /** Canonical URL of the post. */
  link: string;
  /** Post excerpt or short description. */
  description: string;
  /** Full HTML body (wrapped in CDATA). Omit if excerpt-only feed. */
  content?: string;
  /** Author display name. */
  author?: string;
  /** Author email (required by some feed readers). */
  authorEmail?: string;
  /** ISO 8601 publication date string. */
  pubDate: string;
  /** Post slug used as the GUID. */
  guid: string;
  /** Optional featured image URL. */
  imageUrl?: string;
  /** Optional categories/tags array. */
  categories?: string[];
}

export interface RssFeedOptions {
  /** Blog title, e.g. "Acme Corp Blog". */
  title: string;
  /** Base URL of the public site, e.g. "https://example.com". */
  siteUrl: string;
  /** URL of this feed itself. */
  feedUrl: string;
  /** Feed subtitle / description. */
  description: string;
  /** Language code, e.g. "en-US". */
  language?: string;
  /** URL of the site logo / feed icon. */
  imageUrl?: string;
  /** Copyright notice. */
  copyright?: string;
  /** Editor email. */
  managingEditor?: string;
  /** Webmaster email. */
  webMaster?: string;
  /** TTL in minutes (how often readers should refresh). */
  ttl?: number;
  /** Posts to include in the feed. */
  items: RssItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escapes characters that are invalid inside XML text nodes.
 * Characters inside CDATA sections are intentionally left untouched.
 */
function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats an ISO 8601 date string into RFC 822 format required by RSS 2.0.
 * e.g. "2024-01-15T08:00:00Z" → "Mon, 15 Jan 2024 08:00:00 +0000"
 */
function toRfc822(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return new Date().toUTCString();
  }
  return date.toUTCString().replace('GMT', '+0000');
}

/**
 * Wraps content in an XML CDATA section to preserve HTML markup.
 */
function cdata(content: string): string {
  // Escape any stray CDATA end sequences inside the content.
  const safe = content.replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${safe}]]>`;
}

/**
 * Renders a single <item> element for an RSS feed.
 */
function renderItem(item: RssItem, siteUrl: string): string {
  const lines: string[] = ['    <item>'];

  lines.push(`      <title>${escapeXml(item.title)}</title>`);
  lines.push(`      <link>${escapeXml(item.link)}</link>`);
  lines.push(`      <guid isPermaLink="false">${escapeXml(`${siteUrl}/blog/${item.guid}`)}</guid>`);
  lines.push(`      <pubDate>${toRfc822(item.pubDate)}</pubDate>`);

  if (item.description) {
    lines.push(`      <description>${cdata(item.description)}</description>`);
  }

  if (item.content) {
    lines.push(`      <content:encoded>${cdata(item.content)}</content:encoded>`);
  }

  if (item.author && item.authorEmail) {
    lines.push(`      <author>${escapeXml(item.authorEmail)} (${escapeXml(item.author)})</author>`);
  } else if (item.authorEmail) {
    lines.push(`      <author>${escapeXml(item.authorEmail)}</author>`);
  }

  if (item.imageUrl) {
    lines.push(`      <enclosure url="${escapeXml(item.imageUrl)}" type="image/jpeg" length="0" />`);
    // Also include as media:thumbnail for broader reader support.
    lines.push(`      <media:thumbnail url="${escapeXml(item.imageUrl)}" />`);
    lines.push(`      <media:content url="${escapeXml(item.imageUrl)}" medium="image" />`);
  }

  if (item.categories && item.categories.length > 0) {
    for (const cat of item.categories) {
      lines.push(`      <category>${escapeXml(cat)}</category>`);
    }
  }

  lines.push('    </item>');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a complete RSS 2.0 XML document string from a set of blog posts.
 *
 * @example
 * ```ts
 * const xml = generateRssFeed({
 *   title: 'My Blog',
 *   siteUrl: 'https://example.com',
 *   feedUrl: 'https://example.com/api/blog/feed',
 *   description: 'Latest posts from My Blog',
 *   items: posts.map(postToRssItem),
 * });
 * res.headers['Content-Type'] = 'application/rss+xml; charset=utf-8';
 * res.body = xml;
 * ```
 */
export function generateRssFeed(options: RssFeedOptions): string {
  const {
    title,
    siteUrl,
    feedUrl,
    description,
    language = 'en-US',
    imageUrl,
    copyright,
    managingEditor,
    webMaster,
    ttl = 60,
    items,
  } = options;

  const lastBuildDate = items.length > 0
    ? toRfc822(items[0]!.pubDate)
    : new Date().toUTCString().replace('GMT', '+0000');

  const channelLines: string[] = [
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(siteUrl)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${escapeXml(language)}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    `    <ttl>${ttl}</ttl>`,
    '    <generator>Volqan Blog Extension 0.1.0</generator>',
  ];

  if (copyright) {
    channelLines.push(`    <copyright>${escapeXml(copyright)}</copyright>`);
  }
  if (managingEditor) {
    channelLines.push(`    <managingEditor>${escapeXml(managingEditor)}</managingEditor>`);
  }
  if (webMaster) {
    channelLines.push(`    <webMaster>${escapeXml(webMaster)}</webMaster>`);
  }

  if (imageUrl) {
    channelLines.push(
      '    <image>',
      `      <url>${escapeXml(imageUrl)}</url>`,
      `      <title>${escapeXml(title)}</title>`,
      `      <link>${escapeXml(siteUrl)}</link>`,
      '    </image>',
    );
  }

  for (const item of items) {
    channelLines.push(renderItem(item, siteUrl));
  }

  channelLines.push('  </channel>');

  const xmlLines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"',
    '  xmlns:atom="http://www.w3.org/2005/Atom"',
    '  xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    '  xmlns:media="http://search.yahoo.com/mrss/"',
    '  xmlns:dc="http://purl.org/dc/elements/1.1/">',
    ...channelLines,
    '</rss>',
  ];

  return xmlLines.join('\n');
}

/**
 * Converts a raw blog post record (as returned by the Volqan content API)
 * into an RssItem suitable for generateRssFeed().
 */
export function postToRssItem(
  post: Record<string, unknown>,
  siteUrl: string,
): RssItem {
  const slug = String(post['slug'] ?? '');
  const title = String(post['title'] ?? 'Untitled');
  const excerpt = String(post['excerpt'] ?? '');
  const body = post['body'] != null ? String(post['body']) : undefined;
  const publishedAt = String(post['publishedAt'] ?? new Date().toISOString());
  const featuredImage = post['featuredImage'] != null
    ? String((post['featuredImage'] as Record<string, unknown>)['url'] ?? '')
    : undefined;

  const authorRecord = post['author'] as Record<string, unknown> | undefined;
  const authorName = authorRecord != null ? String(authorRecord['name'] ?? '') : undefined;
  const authorEmail = authorRecord != null ? String(authorRecord['email'] ?? '') : undefined;

  const categoryRecord = post['category'] as string | undefined;
  const tagsRecord = post['tags'] as string[] | undefined;
  const categories: string[] = [];
  if (categoryRecord) categories.push(categoryRecord);
  if (tagsRecord) categories.push(...tagsRecord);

  return {
    title,
    link: `${siteUrl}/blog/${slug}`,
    description: excerpt,
    content: body,
    author: authorName,
    authorEmail,
    pubDate: publishedAt,
    guid: slug,
    imageUrl: featuredImage,
    categories,
  };
}
