/**
 * @file content/repository.ts
 * @description ContentRepository — CRUD operations for dynamic content entries.
 *
 * All data is stored in the `ContentEntry` table. The `data` JSON column holds
 * the field values for the entry. The ContentRepository delegates validation to
 * SchemaBuilder and fires lifecycle hooks via HookRegistry.
 */
import { ContentStatus, ContentEntryNotFoundError, ContentTypeNotFoundError, } from './types.js';
import { SchemaBuilder, toSlug } from './schema-builder.js';
// ---------------------------------------------------------------------------
// Prisma where-clause builder
// ---------------------------------------------------------------------------
/**
 * Converts a Volqan `where` object into a Prisma `where` clause for ContentEntry.
 * Top-level keys map to `data` JSON path expressions in PostgreSQL.
 * Reserved keys (status, slug, authorId) are extracted as first-class Prisma fields.
 */
function buildPrismaWhere(contentTypeId, where, includeSoftDeleted = false) {
    const clause = {
        contentTypeId,
        ...(!includeSoftDeleted && { deletedAt: null }),
    };
    if (!where)
        return clause;
    for (const [key, rawValue] of Object.entries(where)) {
        if (key === 'status') {
            clause.status = rawValue;
            continue;
        }
        if (key === 'authorId') {
            clause.authorId = rawValue;
            continue;
        }
        if (key === 'slug') {
            clause.slug = rawValue;
            continue;
        }
        // JSON field path filter — requires Prisma jsonPath filtering (PostgreSQL ≥ 12)
        // We cast into `any` to use the Prisma `path` syntax
        const existing = clause['data'] ?? {};
        clause['data'] = {
            ...existing,
            path: [key],
            equals: rawValue,
        };
    }
    return clause;
}
// ---------------------------------------------------------------------------
// ContentRepository
// ---------------------------------------------------------------------------
/**
 * Provides all CRUD and lifecycle operations for content entries.
 *
 * @example
 * ```ts
 * const repo = new ContentRepository(prisma, schemaBuilder, hookRegistry);
 * const post = await repo.create('blog-post', { title: 'Hello World' }, userId);
 * ```
 */
export class ContentRepository {
    prisma;
    schemaBuilder;
    hooks;
    constructor(prisma, schemaBuilder, hooks) {
        this.prisma = prisma;
        this.schemaBuilder = schemaBuilder;
        this.hooks = hooks;
    }
    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------
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
    async create(contentTypeSlug, data, authorId) {
        const contentType = await this.schemaBuilder.getContentType(contentTypeSlug);
        const dbType = await this.prisma.contentType.findUnique({ where: { slug: contentTypeSlug } });
        if (!dbType)
            throw new ContentTypeNotFoundError(contentTypeSlug);
        // Fire beforeCreate hooks
        const mutatedData = await this.hooks?.fire('beforeCreate', {
            contentTypeSlug,
            data,
            authorId,
        }) ?? data;
        // Validate
        this.schemaBuilder.validateEntry(contentType, mutatedData);
        // Auto-generate slug from the first TEXT field named "title" if a SLUG field exists and has no value
        const slugField = contentType.fields.find((f) => f.type === 'SLUG');
        let entrySlug = null;
        if (slugField) {
            const provided = mutatedData[slugField.name];
            if (provided) {
                entrySlug = toSlug(String(provided));
            }
            else {
                const titleField = contentType.fields.find((f) => f.name === 'title');
                if (titleField && mutatedData['title']) {
                    entrySlug = toSlug(String(mutatedData['title']));
                }
            }
        }
        const initialStatus = contentType.settings.draftable
            ? ContentStatus.DRAFT
            : ContentStatus.PUBLISHED;
        const record = await this.prisma.contentEntry.create({
            data: {
                contentTypeId: dbType.id,
                slug: entrySlug,
                status: initialStatus,
                authorId: authorId ?? null,
                data: mutatedData,
                publishedAt: initialStatus === ContentStatus.PUBLISHED ? new Date() : null,
            },
        });
        const entry = this._recordToEntry(record, contentTypeSlug);
        await this.hooks?.fire('afterCreate', { contentTypeSlug, entry: entry });
        return entry;
    }
    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------
    /**
     * Retrieves a single entry by its primary key.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async findById(contentTypeSlug, id) {
        const dbType = await this._requireDbType(contentTypeSlug);
        const record = await this.prisma.contentEntry.findFirst({
            where: { id, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!record)
            throw new ContentEntryNotFoundError(id);
        return this._recordToEntry(record, contentTypeSlug);
    }
    /**
     * Retrieves a single entry by its slug field.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async findBySlug(contentTypeSlug, slug) {
        const dbType = await this._requireDbType(contentTypeSlug);
        const record = await this.prisma.contentEntry.findFirst({
            where: { slug, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!record)
            throw new ContentEntryNotFoundError(`slug:${slug}`);
        return this._recordToEntry(record, contentTypeSlug);
    }
    /**
     * Returns a paginated list of entries matching the given query options.
     */
    async findMany(contentTypeSlug, options = {}) {
        const dbType = await this._requireDbType(contentTypeSlug);
        const page = Math.max(1, options.page ?? 1);
        const perPage = Math.min(100, Math.max(1, options.perPage ?? 20));
        const skip = (page - 1) * perPage;
        const where = buildPrismaWhere(dbType.id, options.where);
        const orderBy = options.orderBy?.map((o) => {
            if (o.field === 'createdAt' || o.field === 'updatedAt' || o.field === 'publishedAt') {
                return { [o.field]: o.direction };
            }
            // JSON field ordering is not natively supported in all Prisma versions; fall back to createdAt
            return { createdAt: o.direction };
        }) ?? [{ createdAt: 'desc' }];
        const [records, total] = await Promise.all([
            this.prisma.contentEntry.findMany({ where, orderBy, skip, take: perPage }),
            this.prisma.contentEntry.count({ where }),
        ]);
        let entries = records.map((r) => this._recordToEntry(r, contentTypeSlug));
        // Apply select projection
        if (options.select && options.select.length > 0) {
            const selectedFields = new Set(options.select);
            entries = entries.map((entry) => ({
                ...entry,
                data: Object.fromEntries(Object.entries(entry.data).filter(([k]) => selectedFields.has(k))),
            }));
        }
        return {
            data: entries,
            meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
        };
    }
    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------
    /**
     * Partially updates an existing entry.
     * Deep-merges the supplied data with existing entry data.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async update(contentTypeSlug, id, data) {
        const contentType = await this.schemaBuilder.getContentType(contentTypeSlug);
        const dbType = await this._requireDbType(contentTypeSlug);
        const existing = await this.prisma.contentEntry.findFirst({
            where: { id, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!existing)
            throw new ContentEntryNotFoundError(id);
        const mutatedData = await this.hooks?.fire('beforeUpdate', {
            contentTypeSlug,
            id,
            data,
            existing: this._recordToEntry(existing, contentTypeSlug),
        }) ?? data;
        const merged = { ...existing.data, ...mutatedData };
        this.schemaBuilder.validateEntry(contentType, merged);
        const record = await this.prisma.contentEntry.update({
            where: { id },
            data: { data: merged },
        });
        const entry = this._recordToEntry(record, contentTypeSlug);
        await this.hooks?.fire('afterUpdate', { contentTypeSlug, entry: entry });
        return entry;
    }
    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------
    /**
     * Deletes an entry. Uses soft-delete if the content type is configured for it,
     * otherwise performs a hard database deletion.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async delete(contentTypeSlug, id) {
        const contentType = await this.schemaBuilder.getContentType(contentTypeSlug);
        const dbType = await this._requireDbType(contentTypeSlug);
        const existing = await this.prisma.contentEntry.findFirst({
            where: { id, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!existing)
            throw new ContentEntryNotFoundError(id);
        const entry = this._recordToEntry(existing, contentTypeSlug);
        await this.hooks?.fire('beforeDelete', { contentTypeSlug, entry: entry });
        if (contentType.settings.softDelete) {
            await this.prisma.contentEntry.update({
                where: { id },
                data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
            });
        }
        else {
            await this.prisma.contentEntry.delete({ where: { id } });
        }
        await this.hooks?.fire('afterDelete', { contentTypeSlug, id });
    }
    // -------------------------------------------------------------------------
    // Status transitions
    // -------------------------------------------------------------------------
    /**
     * Transitions an entry to PUBLISHED status and records the publication timestamp.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async publish(contentTypeSlug, id) {
        const dbType = await this._requireDbType(contentTypeSlug);
        const existing = await this.prisma.contentEntry.findFirst({
            where: { id, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!existing)
            throw new ContentEntryNotFoundError(id);
        const currentEntry = this._recordToEntry(existing, contentTypeSlug);
        await this.hooks?.fire('beforePublish', { contentTypeSlug, entry: currentEntry });
        const record = await this.prisma.contentEntry.update({
            where: { id },
            data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
        });
        const entry = this._recordToEntry(record, contentTypeSlug);
        await this.hooks?.fire('afterPublish', { contentTypeSlug, entry: entry });
        return entry;
    }
    /**
     * Reverts a published entry back to DRAFT status.
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async unpublish(contentTypeSlug, id) {
        const dbType = await this._requireDbType(contentTypeSlug);
        const existing = await this.prisma.contentEntry.findFirst({
            where: { id, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!existing)
            throw new ContentEntryNotFoundError(id);
        const record = await this.prisma.contentEntry.update({
            where: { id },
            data: { status: ContentStatus.DRAFT },
        });
        return this._recordToEntry(record, contentTypeSlug);
    }
    /**
     * Archives an entry (read-only, not publicly visible).
     *
     * @throws {ContentEntryNotFoundError} If the entry does not exist.
     */
    async archive(contentTypeSlug, id) {
        const dbType = await this._requireDbType(contentTypeSlug);
        const existing = await this.prisma.contentEntry.findFirst({
            where: { id, contentTypeId: dbType.id, deletedAt: null },
        });
        if (!existing)
            throw new ContentEntryNotFoundError(id);
        const record = await this.prisma.contentEntry.update({
            where: { id },
            data: { status: ContentStatus.ARCHIVED },
        });
        return this._recordToEntry(record, contentTypeSlug);
    }
    // -------------------------------------------------------------------------
    // Aggregates
    // -------------------------------------------------------------------------
    /**
     * Counts entries matching optional filter criteria.
     *
     * @param contentTypeSlug The target content type.
     * @param where Optional filter (same format as QueryOptions.where).
     */
    async count(contentTypeSlug, where) {
        const dbType = await this._requireDbType(contentTypeSlug);
        return this.prisma.contentEntry.count({
            where: buildPrismaWhere(dbType.id, where),
        });
    }
    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------
    async _requireDbType(slug) {
        const dbType = await this.prisma.contentType.findUnique({ where: { slug } });
        if (!dbType)
            throw new ContentTypeNotFoundError(slug);
        return dbType;
    }
    _recordToEntry(record, contentTypeSlug) {
        return {
            id: record.id,
            contentTypeId: record.contentTypeId,
            contentTypeSlug,
            slug: record.slug,
            status: record.status,
            publishedAt: record.publishedAt,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            deletedAt: record.deletedAt,
            authorId: record.authorId,
            data: record.data,
        };
    }
}
//# sourceMappingURL=repository.js.map