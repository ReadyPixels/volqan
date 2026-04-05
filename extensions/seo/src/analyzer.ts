/**
 * @file analyzer.ts
 * @description SEO analysis engine for the Volqan SEO extension.
 *
 * Scores a content entry against a standard set of SEO best-practice checks
 * and returns a 0–100 score plus a list of actionable issues.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SeverityLevel = 'error' | 'warning' | 'info';

export interface SeoIssue {
  /** Machine-readable issue code. */
  code: string;
  /** Human-readable description of the problem. */
  message: string;
  /** How important this issue is. */
  severity: SeverityLevel;
  /** Optional numerical detail (e.g. current character count). */
  actual?: number;
  /** The recommended value or range. */
  recommended?: string;
}

export interface SeoMeta {
  /** <title> tag or metaTitle field. */
  metaTitle?: string;
  /** <meta name="description"> content or metaDescription field. */
  metaDescription?: string;
  /** Open Graph image URL. */
  ogImage?: string;
  /** Canonical URL. */
  canonicalUrl?: string;
  /** noIndex flag. */
  noIndex?: boolean;
  /** JSON-LD structured data blob. */
  structuredData?: unknown;
}

export interface SeoContent {
  /** Plain-text or HTML body content. */
  body?: string;
  /** Post/page title (H1 level). */
  title?: string;
  /** Focus keyword to check density for. */
  focusKeyword?: string;
  /** All image records in the content (for alt-text checks). */
  images?: Array<{ src: string; alt?: string }>;
  /** Internal link hrefs found in the content. */
  internalLinks?: string[];
}

export interface SeoAnalysis {
  /** Composite score from 0 (worst) to 100 (best). */
  score: number;
  /** Colour grade: green ≥ 75, orange ≥ 50, red < 50. */
  grade: 'green' | 'orange' | 'red';
  /** All detected issues, ordered by severity. */
  issues: SeoIssue[];
  /** Counts per severity level. */
  counts: { errors: number; warnings: number; infos: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function countWords(text: string): number {
  const clean = text.trim();
  if (!clean) return 0;
  return clean.split(/\s+/).length;
}

function extractHeadings(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]!, 10),
      text: stripHtml(match[2] ?? ''),
    });
  }
  return headings;
}

function extractImageAlts(html: string): Array<{ src: string; alt?: string }> {
  const images: Array<{ src: string; alt?: string }> = [];
  const regex = /<img([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1] ?? '';
    const srcMatch = /src=["']([^"']+)["']/i.exec(attrs);
    const altMatch = /alt=["']([^"']*)["']/i.exec(attrs);
    images.push({
      src: srcMatch ? srcMatch[1]! : '',
      alt: altMatch ? altMatch[1] : undefined,
    });
  }
  return images;
}

function countInternalLinks(html: string, siteUrl = ''): number {
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1] ?? '';
    if (href.startsWith('/') || (siteUrl && href.startsWith(siteUrl))) {
      count++;
    }
  }
  return count;
}

function keywordDensity(text: string, keyword: string): number {
  if (!keyword || !text) return 0;
  const words = text.toLowerCase().split(/\s+/);
  const kwWords = keyword.toLowerCase().split(/\s+/);
  let occurrences = 0;
  for (let i = 0; i <= words.length - kwWords.length; i++) {
    let match = true;
    for (let j = 0; j < kwWords.length; j++) {
      if (words[i + j] !== kwWords[j]) {
        match = false;
        break;
      }
    }
    if (match) occurrences++;
  }
  return words.length > 0 ? (occurrences / words.length) * 100 : 0;
}

// ---------------------------------------------------------------------------
// Individual check functions
// ---------------------------------------------------------------------------

function checkMetaTitle(meta: SeoMeta, issues: SeoIssue[]): number {
  const title = meta.metaTitle ?? '';
  const len = title.length;

  if (!title) {
    issues.push({
      code: 'missing-meta-title',
      message: 'Meta title is missing. Add a descriptive title (50–60 characters).',
      severity: 'error',
      recommended: '50–60 chars',
    });
    return 0;
  }

  if (len < 30) {
    issues.push({
      code: 'short-meta-title',
      message: `Meta title is too short (${len} chars). Aim for 50–60 characters.`,
      severity: 'warning',
      actual: len,
      recommended: '50–60 chars',
    });
    return 5;
  }

  if (len > 60) {
    issues.push({
      code: 'long-meta-title',
      message: `Meta title is too long (${len} chars). Keep it under 60 characters to avoid truncation in search results.`,
      severity: 'warning',
      actual: len,
      recommended: '50–60 chars',
    });
    return 8;
  }

  // Ideal range 50–60
  return 15;
}

function checkMetaDescription(meta: SeoMeta, issues: SeoIssue[]): number {
  const desc = meta.metaDescription ?? '';
  const len = desc.length;

  if (!desc) {
    issues.push({
      code: 'missing-meta-description',
      message: 'Meta description is missing. Add a compelling summary (120–160 characters).',
      severity: 'error',
      recommended: '120–160 chars',
    });
    return 0;
  }

  if (len < 80) {
    issues.push({
      code: 'short-meta-description',
      message: `Meta description is too short (${len} chars). Aim for 120–160 characters.`,
      severity: 'warning',
      actual: len,
      recommended: '120–160 chars',
    });
    return 5;
  }

  if (len > 160) {
    issues.push({
      code: 'long-meta-description',
      message: `Meta description is too long (${len} chars). Keep it under 160 characters to avoid truncation.`,
      severity: 'warning',
      actual: len,
      recommended: '120–160 chars',
    });
    return 8;
  }

  return 15;
}

function checkHeadingStructure(
  body: string,
  title: string,
  issues: SeoIssue[],
): number {
  const headings = extractHeadings(body);
  let score = 10;

  const h1s = headings.filter((h) => h.level === 1);

  if (h1s.length === 0) {
    // If the content type has a top-level title it may serve as H1,
    // but we still warn if the body itself has no H1.
    if (!title) {
      issues.push({
        code: 'missing-h1',
        message: 'No H1 heading found in content. Include a primary heading.',
        severity: 'error',
      });
      score -= 10;
    } else {
      issues.push({
        code: 'missing-h1-in-body',
        message:
          'No H1 found inside the body. The page title will serve as H1, which is acceptable.',
        severity: 'info',
      });
    }
  } else if (h1s.length > 1) {
    issues.push({
      code: 'multiple-h1',
      message: `Multiple H1 tags found (${h1s.length}). Use only one H1 per page.`,
      severity: 'warning',
      actual: h1s.length,
      recommended: '1',
    });
    score -= 5;
  }

  // Check for skipped heading levels (e.g. H1 → H3 with no H2).
  const levels = headings.map((h) => h.level);
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1]!;
    const curr = levels[i]!;
    if (curr > prev + 1) {
      issues.push({
        code: 'skipped-heading-level',
        message: `Heading level jumped from H${prev} to H${curr}. Avoid skipping heading levels for better accessibility and SEO.`,
        severity: 'warning',
      });
      score -= 3;
      break; // Report once
    }
  }

  return Math.max(0, score);
}

function checkImageAlts(
  body: string,
  extraImages: Array<{ src: string; alt?: string }>,
  issues: SeoIssue[],
): number {
  const bodyImages = extractImageAlts(body);
  const allImages = [...bodyImages, ...extraImages];

  if (allImages.length === 0) {
    issues.push({
      code: 'no-images',
      message: 'No images found. Adding relevant images with alt text improves engagement and SEO.',
      severity: 'info',
    });
    return 8; // No deduction — just informational
  }

  const missing = allImages.filter(
    (img) => img.alt === undefined || img.alt.trim() === '',
  );

  if (missing.length > 0) {
    issues.push({
      code: 'missing-image-alt',
      message: `${missing.length} image(s) are missing alt text. Alt text improves accessibility and image search visibility.`,
      severity: 'warning',
      actual: missing.length,
      recommended: '0 images without alt text',
    });
    return missing.length === allImages.length ? 0 : 5;
  }

  return 10;
}

function checkContentLength(plainText: string, issues: SeoIssue[]): number {
  const wordCount = countWords(plainText);

  if (wordCount < 100) {
    issues.push({
      code: 'very-thin-content',
      message: `Content is very thin (${wordCount} words). Search engines prefer at least 300 words for informational pages.`,
      severity: 'error',
      actual: wordCount,
      recommended: '≥ 300 words',
    });
    return 0;
  }

  if (wordCount < 300) {
    issues.push({
      code: 'thin-content',
      message: `Content length is low (${wordCount} words). Aim for at least 300 words.`,
      severity: 'warning',
      actual: wordCount,
      recommended: '≥ 300 words',
    });
    return 8;
  }

  if (wordCount >= 1000) {
    return 20; // Long-form bonus
  }

  return 15;
}

function checkKeywordDensity(
  plainText: string,
  keyword: string | undefined,
  issues: SeoIssue[],
): number {
  if (!keyword) {
    issues.push({
      code: 'no-focus-keyword',
      message: 'No focus keyword set. Define a focus keyword to get keyword density feedback.',
      severity: 'info',
    });
    return 5;
  }

  const density = keywordDensity(plainText, keyword);

  if (density === 0) {
    issues.push({
      code: 'keyword-not-found',
      message: `Focus keyword "${keyword}" was not found in the content.`,
      severity: 'warning',
      actual: 0,
      recommended: '1–3%',
    });
    return 0;
  }

  if (density > 4) {
    issues.push({
      code: 'keyword-stuffing',
      message: `Keyword density for "${keyword}" is ${density.toFixed(1)}%, which may be considered keyword stuffing. Aim for 1–3%.`,
      severity: 'warning',
      actual: Math.round(density * 10) / 10,
      recommended: '1–3%',
    });
    return 3;
  }

  return 10;
}

function checkInternalLinks(body: string, issues: SeoIssue[]): number {
  const linkCount = countInternalLinks(body);

  if (linkCount === 0) {
    issues.push({
      code: 'no-internal-links',
      message: 'No internal links found. Add internal links to help search engines crawl your site.',
      severity: 'warning',
      actual: 0,
      recommended: '≥ 1 internal link',
    });
    return 0;
  }

  return 5;
}

function checkOgImage(meta: SeoMeta, issues: SeoIssue[]): number {
  if (!meta.ogImage) {
    issues.push({
      code: 'missing-og-image',
      message:
        'No Open Graph image set. OG images improve appearance when shared on social media.',
      severity: 'warning',
    });
    return 0;
  }
  return 5;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyses a content entry's body and SEO metadata against best-practice
 * heuristics and returns a 0–100 score with a list of issues.
 *
 * @example
 * ```ts
 * const analysis = analyzeSEO(
 *   { body: post.body, title: post.title, focusKeyword: 'volqan cms' },
 *   { metaTitle: post.metaTitle, metaDescription: post.metaDescription },
 * );
 * console.log(`SEO score: ${analysis.score}/100 (${analysis.grade})`);
 * ```
 */
export function analyzeSEO(content: SeoContent, meta: SeoMeta): SeoAnalysis {
  const issues: SeoIssue[] = [];
  let totalScore = 0;

  const bodyHtml = content.body ?? '';
  const plainText = stripHtml(bodyHtml);
  const title = content.title ?? '';

  // Run all checks and accumulate score.
  totalScore += checkMetaTitle(meta, issues);
  totalScore += checkMetaDescription(meta, issues);
  totalScore += checkHeadingStructure(bodyHtml, title, issues);
  totalScore += checkImageAlts(bodyHtml, content.images ?? [], issues);
  totalScore += checkContentLength(plainText, issues);
  totalScore += checkKeywordDensity(plainText, content.focusKeyword, issues);
  totalScore += checkInternalLinks(bodyHtml, issues);
  totalScore += checkOgImage(meta, issues);

  // Cap at 100
  const score = Math.min(100, Math.max(0, totalScore));

  const grade: SeoAnalysis['grade'] =
    score >= 75 ? 'green' : score >= 50 ? 'orange' : 'red';

  const counts = {
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    infos: issues.filter((i) => i.severity === 'info').length,
  };

  // Sort: errors first, then warnings, then infos.
  issues.sort((a, b) => {
    const order: Record<SeverityLevel, number> = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return { score, grade, issues, counts };
}

/**
 * Auto-generates a meta description from HTML body content.
 * Strips HTML, takes the first ~155 characters ending on a word boundary.
 */
export function autoMetaDescription(bodyHtml: string, maxLength = 155): string {
  const plain = stripHtml(bodyHtml).replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;

  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 80
    ? truncated.slice(0, lastSpace) + '…'
    : truncated + '…';
}
