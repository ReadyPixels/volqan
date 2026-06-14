/**
 * @file pages/repository.ts
 * @description In-memory page repository with full CRUD and versioning support.
 * In production, replace with a database-backed implementation.
 */
import type { Page, PageVersion, CreatePageInput, UpdatePageInput, PageQueryOptions, PaginatedPages } from './types.js';
export declare class PageRepository {
    /**
     * List all pages with optional filtering and pagination.
     */
    list(options?: PageQueryOptions): Promise<PaginatedPages>;
    /**
     * Get a single page by ID.
     */
    getById(id: string): Promise<Page | null>;
    /**
     * Get a single page by slug.
     */
    getBySlug(slug: string): Promise<Page | null>;
    /**
     * Create a new page.
     */
    create(input: CreatePageInput): Promise<Page>;
    /**
     * Update an existing page.
     */
    update(id: string, input: UpdatePageInput): Promise<Page>;
    /**
     * Delete a page and all its versions.
     */
    delete(id: string): Promise<void>;
    /**
     * Publish a page.
     */
    publish(id: string): Promise<Page>;
    /**
     * Unpublish a page (revert to draft).
     */
    unpublish(id: string): Promise<Page>;
    /**
     * Archive a page.
     */
    archive(id: string): Promise<Page>;
    /**
     * Save the current state of a page as a named version.
     */
    saveVersion(pageId: string, label?: string): Promise<PageVersion>;
    /**
     * List versions for a page.
     */
    listVersions(pageId: string): Promise<PageVersion[]>;
    /**
     * Restore a page to a specific version.
     */
    restoreVersion(pageId: string, versionId: string): Promise<Page>;
}
export declare const pageRepository: PageRepository;
//# sourceMappingURL=repository.d.ts.map