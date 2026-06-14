/**
 * @file content/schema-builder.ts
 * @description SchemaBuilder — manages ContentType definitions stored in the database.
 *
 * The SchemaBuilder is the single source of truth for content type definitions.
 * It persists definitions into the `ContentType` table (via Prisma) and provides
 * field + entry validation used by the ContentRepository.
 */
import type { PrismaClient } from '@prisma/client';
import { type ContentTypeDefinition, type FieldDefinition, type ContentEntryData, type ValidationError } from './types.js';
/**
 * Converts any string to a valid URL slug.
 * e.g. "Hello World!" → "hello-world"
 */
export declare function toSlug(value: string): string;
/**
 * Manages content type definitions in the Volqan database.
 *
 * @example
 * ```ts
 * const builder = new SchemaBuilder(prisma);
 * await builder.createContentType({
 *   name: 'Blog Post',
 *   slug: 'blog-post',
 *   fields: [{ name: 'title', type: FieldType.TEXT, label: 'Title', required: true }],
 *   settings: { draftable: true, api: true, timestamps: true },
 * });
 * ```
 */
export declare class SchemaBuilder {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    /**
     * Persists a new content type definition.
     *
     * @param definition Full content type specification.
     * @throws {Error} If a content type with the same slug already exists.
     */
    createContentType(definition: ContentTypeDefinition): Promise<ContentTypeDefinition>;
    /**
     * Updates an existing content type.
     * Only the provided keys are changed; omitted keys are preserved.
     *
     * @param slug The slug of the content type to update.
     * @param updates Partial definition containing only the fields to change.
     */
    updateContentType(slug: string, updates: Partial<Omit<ContentTypeDefinition, 'slug'>>): Promise<ContentTypeDefinition>;
    /**
     * Removes a content type and optionally all its entries.
     *
     * @param slug The slug of the content type to delete.
     * @param deleteEntries When true, all associated ContentEntry records are deleted first.
     */
    deleteContentType(slug: string, deleteEntries?: boolean): Promise<void>;
    /**
     * Retrieves a single content type by slug.
     *
     * @param slug The unique slug identifier.
     * @throws {ContentTypeNotFoundError} If not found.
     */
    getContentType(slug: string): Promise<ContentTypeDefinition>;
    /**
     * Returns all registered content type definitions.
     */
    listContentTypes(): Promise<ContentTypeDefinition[]>;
    /**
     * Validates a single field value against its definition.
     *
     * @param field The field definition.
     * @param value The raw value to validate.
     * @returns An array of validation errors (empty array means valid).
     */
    validateField(field: FieldDefinition, value: unknown): ValidationError[];
    /**
     * Validates an entire entry data payload against the content type definition.
     *
     * @param contentType The full content type definition.
     * @param data The entry data to validate.
     * @throws {ContentValidationError} If any field fails validation.
     */
    validateEntry(contentType: ContentTypeDefinition, data: ContentEntryData): void;
    private _recordToDefinition;
}
//# sourceMappingURL=schema-builder.d.ts.map