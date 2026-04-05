/**
 * @file pages/repository.ts
 * @description In-memory page repository with full CRUD and versioning support.
 * In production, replace with a database-backed implementation.
 */

import { randomUUID } from 'crypto';
import type {
  Page,
  PageVersion,
  CreatePageInput,
  UpdatePageInput,
  PageQueryOptions,
  PaginatedPages,
  Block,
} from './types.js';

// ---------------------------------------------------------------------------
// In-memory store (replace with DB in production)
// ---------------------------------------------------------------------------

const pages = new Map<string, Page>();
const versions = new Map<string, PageVersion[]>();
let versionCounter = 0;

// ---------------------------------------------------------------------------
// Helper: slugify
// ---------------------------------------------------------------------------

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ---------------------------------------------------------------------------
// PageRepository
// ---------------------------------------------------------------------------

export class PageRepository {
  /**
   * List all pages with optional filtering and pagination.
   */
  async list(options: PageQueryOptions = {}): Promise<PaginatedPages> {
    const { status, page = 1, perPage = 20, search } = options;

    let items = Array.from(pages.values());

    if (status) {
      items = items.filter((p) => p.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
      );
    }

    items.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    const total = items.length;
    const totalPages = Math.ceil(total / perPage);
    const offset = (page - 1) * perPage;
    const paged = items.slice(offset, offset + perPage);

    return { items: paged, total, page, perPage, totalPages };
  }

  /**
   * Get a single page by ID.
   */
  async getById(id: string): Promise<Page | null> {
    return pages.get(id) ?? null;
  }

  /**
   * Get a single page by slug.
   */
  async getBySlug(slug: string): Promise<Page | null> {
    for (const page of pages.values()) {
      if (page.slug === slug) return page;
    }
    return null;
  }

  /**
   * Create a new page.
   */
  async create(input: CreatePageInput): Promise<Page> {
    const id = randomUUID();
    const now = new Date();

    const slug = input.slug || toSlug(input.title);

    const page: Page = {
      id,
      title: input.title,
      slug,
      status: input.status ?? 'draft',
      blocks: input.blocks ?? [],
      meta: input.meta ?? {},
      settings: input.settings ?? {},
      authorId: input.authorId,
      createdAt: now,
      updatedAt: now,
    };

    pages.set(id, page);
    versions.set(id, []);

    return page;
  }

  /**
   * Update an existing page.
   */
  async update(id: string, input: UpdatePageInput): Promise<Page> {
    const existing = pages.get(id);
    if (!existing) throw new Error(`Page not found: ${id}`);

    const updated: Page = {
      ...existing,
      ...input,
      meta: { ...existing.meta, ...(input.meta ?? {}) },
      settings: { ...existing.settings, ...(input.settings ?? {}) },
      updatedAt: new Date(),
    };

    pages.set(id, updated);
    return updated;
  }

  /**
   * Delete a page and all its versions.
   */
  async delete(id: string): Promise<void> {
    if (!pages.has(id)) throw new Error(`Page not found: ${id}`);
    pages.delete(id);
    versions.delete(id);
  }

  /**
   * Publish a page.
   */
  async publish(id: string): Promise<Page> {
    return this.update(id, { status: 'published', publishedAt: new Date() });
  }

  /**
   * Unpublish a page (revert to draft).
   */
  async unpublish(id: string): Promise<Page> {
    return this.update(id, { status: 'draft', publishedAt: undefined });
  }

  /**
   * Archive a page.
   */
  async archive(id: string): Promise<Page> {
    return this.update(id, { status: 'archived' });
  }

  // ---------------------------------------------------------------------------
  // Versioning
  // ---------------------------------------------------------------------------

  /**
   * Save the current state of a page as a named version.
   */
  async saveVersion(pageId: string, label?: string): Promise<PageVersion> {
    const page = pages.get(pageId);
    if (!page) throw new Error(`Page not found: ${pageId}`);

    versionCounter += 1;
    const pageVersions = versions.get(pageId) ?? [];

    const version: PageVersion = {
      id: randomUUID(),
      pageId,
      version: pageVersions.length + 1,
      blocks: JSON.parse(JSON.stringify(page.blocks)) as Block[],
      meta: { ...page.meta },
      settings: { ...page.settings },
      createdAt: new Date(),
      label: label ?? `Version ${versionCounter}`,
    };

    pageVersions.push(version);
    versions.set(pageId, pageVersions);

    return version;
  }

  /**
   * List versions for a page.
   */
  async listVersions(pageId: string): Promise<PageVersion[]> {
    return (versions.get(pageId) ?? []).slice().reverse();
  }

  /**
   * Restore a page to a specific version.
   */
  async restoreVersion(pageId: string, versionId: string): Promise<Page> {
    const pageVersions = versions.get(pageId) ?? [];
    const version = pageVersions.find((v) => v.id === versionId);
    if (!version) throw new Error(`Version not found: ${versionId}`);

    return this.update(pageId, {
      blocks: JSON.parse(JSON.stringify(version.blocks)) as Block[],
      meta: { ...version.meta },
      settings: { ...version.settings },
    });
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const pageRepository = new PageRepository();
