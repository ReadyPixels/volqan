/**
 * @file content/repository.ts
 * @description ContentRepository — CRUD operations for dynamic content entries.
 *
 * All data is stored in the `ContentEntry` table. The `data` JSON column holds
 * the field values for the entry. The ContentRepository delegates validation to
 * SchemaBuilder and fires lifecycle hooks via HookRegistry.
 */
import type { PrismaClient } from '@prisma/client';
import { ContentStatus, type ContentEntryData, type QueryOptions, type PaginatedResult } from './types.js';
import { SchemaBuilder } from './schema-builder.js';
import type { HookRegistry } from './hooks.js';
/** A fully hydrated content entry as returned by the repository. */
export interface ContentEntry {
    id: string;
    contentTypeId: string;
    contentTypeSlug: string;
    slug: string | null;
    status: ContentStatus;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    authorId: string | null;
    data: ContentEntryData;
}
/**
 * Provides all CRUD and lifecycle operations for content entries.
 *
 * @example
 * ```ts
 * const repo = new ContentRepository(prisma, schemaBuilder, hookRegistry);
 * const post = await repo.create('blog-post', { title: 'Hello World' }, userId);
 * ```
 */
export declare class ContentRepository {
    private readonly prisma;
    private readonly schemaBuilder;
    private readonly hooks?;
    constructor(prisma: PrismaClient, schemaBuilder: SchemaBuilder, hooks?: HookRegistry | undefined);
    /**
     * Creates a new content entry.
     *
     * Steps:
     * 1. Resolve the ContentType by slug.
     * 2. Run `beforeCreate` hooks.
     * 3. Validate the entry data.
     * 4. Auto-generate a slug if the type has a SLUG field with no value supplied.
     * 5. Persist to the database.
     * 6. Run `afterCreate` hooks.
     *
     * @param contentTypeSlug The slug of the target content type.
     * @param data The field values for the new entry.
     * @param authorId Optional ID of the creating user.
     */
    create(contentTypeSlug: string, data: ContentEntryData, authorId?: string): Promise<ContentEntry>;
    /**
     * Retrieves a single entry by its primary key.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    findById(contentTypeSlug: string, id: string): Promise<ContentEntry>;
    /**
     * Retrieves a single entry by its slug field.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    findBySlug(contentTypeSlug: string, slug: string): Promise<ContentEntry>;
    /**
     * Returns a paginated list of entries matching the given query options.
     */
    findMany(contentTypeSlug: string, options?: QueryOptions): Promise<PaginatedResult<ContentEntry>>;
    /**
     * Partially updates an existing entry.
     * Deep-merges the supplied data with existing entry data.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    update(contentTypeSlug: string, id: string, data: ContentEntryData): Promise<ContentEntry>;
    /**
     * Deletes an entry. Uses soft-delete if the content type is configured for it,
     * otherwise performs a hard database deletion.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    delete(contentTypeSlug: string, id: string): Promise<void>;
    /**
     * Transitions an entry to PUBLISHED status and records the publication timestamp.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    publish(contentTypeSlug: string, id: string): Promise<ContentEntry>;
    /**
     * Reverts a published entry back to DRAFT status.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    unpublish(contentTypeSlug: string, id: string): Promise<ContentEntry>;
    /**
     * Archives an entry (read-only, not publicly visible).
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    archive(contentTypeSlug: string, id: string): Promise<ContentEntry>;
    /**
     * Counts entries matching optional filter criteria.
     *
     * @param contentTypeSlug The target content type.
     * @param where Optional filter (same format as QueryOptions.where).
     */
    count(contentTypeSlug: string, where?: QueryOptions['where']): Promise<number>;
    private _requireDbType;
    private _recordToEntry;
}
//# sourceMappingURL=repository.d.ts.map