/**
 * @file content/schema-builder.ts
 * @description SchemaBuilder — manages ContentType definitions stored in the database.
 *
 * The SchemaBuilder is the single source of truth for content type definitions.
 * It persists definitions into the `ContentType` table (via Prisma) and provides
 * field + entry validation used by the ContentRepository.
 */

import type { PrismaClient } from '@prisma/client';
import {
  FieldType,
  type ContentTypeDefinition,
  type FieldDefinition,
  type ContentEntryData,
  ContentValidationError,
  ContentTypeNotFoundError,
  type ValidationError,
} from './types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Converts any string to a valid URL slug.
 * e.g. "Hello World!" → "hello-world"
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// SchemaBuilder
// ---------------------------------------------------------------------------

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
export class SchemaBuilder {
  constructor(private readonly prisma: PrismaClient) {}

  // -------------------------------------------------------------------------
  // CRUD
  // -------------------------------------------------------------------------

  /**
   * Persists a new content type definition.
   *
   * @param definition Full content type specification.
   * @throws {Error} If a content type with the same slug already exists.
   */
  async createContentType(definition: ContentTypeDefinition): Promise<ContentTypeDefinition> {
    const existing = await this.prisma.contentType.findUnique({
      where: { slug: definition.slug },
    });

    if (existing) {
      throw new Error(`Content type with slug "${definition.slug}" already exists`);
    }

    const record = await this.prisma.contentType.create({
      data: {
        name: definition.name,
        slug: definition.slug,
        description: definition.description ?? null,
        fields: definition.fields as unknown,
        settings: definition.settings as unknown,
      },
    });

    return this._recordToDefinition(record);
  }

  /**
   * Updates an existing content type.
   * Only the provided keys are changed; omitted keys are preserved.
   *
   * @param slug The slug of the content type to update.
   * @param updates Partial definition containing only the fields to change.
   */
  async updateContentType(
    slug: string,
    updates: Partial<Omit<ContentTypeDefinition, 'slug'>>,
  ): Promise<ContentTypeDefinition> {
    const existing = await this.prisma.contentType.findUnique({ where: { slug } });
    if (!existing) throw new ContentTypeNotFoundError(slug);

    const data: Record<string, unknown> = {};
    if (updates.name !== undefined) data['name'] = updates.name;
    if (updates.description !== undefined) data['description'] = updates.description;
    if (updates.fields !== undefined) data['fields'] = updates.fields;
    if (updates.settings !== undefined) data['settings'] = updates.settings;

    const record = await this.prisma.contentType.update({
      where: { slug },
      data: data as any,
    });

    return this._recordToDefinition(record);
  }

  /**
   * Removes a content type and optionally all its entries.
   *
   * @param slug The slug of the content type to delete.
   * @param deleteEntries When true, all associated ContentEntry records are deleted first.
   */
  async deleteContentType(slug: string, deleteEntries = false): Promise<void> {
    const existing = await this.prisma.contentType.findUnique({ where: { slug } });
    if (!existing) throw new ContentTypeNotFoundError(slug);

    if (deleteEntries) {
      await this.prisma.contentEntry.deleteMany({ where: { contentTypeId: existing.id } });
    }

    await this.prisma.contentType.delete({ where: { slug } });
  }

  /**
   * Retrieves a single content type by slug.
   *
   * @param slug The unique slug identifier.
   * @throws {ContentTypeNotFoundError} If not found.
   */
  async getContentType(slug: string): Promise<ContentTypeDefinition> {
    const record = await this.prisma.contentType.findUnique({ where: { slug } });
    if (!record) throw new ContentTypeNotFoundError(slug);
    return this._recordToDefinition(record);
  }

  /**
   * Returns all registered content type definitions.
   */
  async listContentTypes(): Promise<ContentTypeDefinition[]> {
    const records = await this.prisma.contentType.findMany({ orderBy: { name: 'asc' } });
    return records.map((r: any) => this._recordToDefinition(r));
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  /**
   * Validates a single field value against its definition.
   *
   * @param field The field definition.
   * @param value The raw value to validate.
   * @returns An array of validation errors (empty array means valid).
   */
  validateField(field: FieldDefinition, value: unknown): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: field.name, message: `"${field.label}" is required` });
      // Don't continue — additional checks below would all produce noise
      return errors;
    }

    // Skip further checks if the field is optional and value is absent
    if (value === undefined || value === null) return errors;

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.RICHTEXT:
      case FieldType.PASSWORD: {
        if (typeof value !== 'string') {
          errors.push({ field: field.name, message: `"${field.label}" must be a string` });
          break;
        }
        if (field.validation?.min !== undefined && value.length < field.validation.min) {
          errors.push({
            field: field.name,
            message: field.validation.message ?? `"${field.label}" must be at least ${field.validation.min} characters`,
          });
        }
        if (field.validation?.max !== undefined && value.length > field.validation.max) {
          errors.push({
            field: field.name,
            message: field.validation.message ?? `"${field.label}" must be at most ${field.validation.max} characters`,
          });
        }
        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors.push({
            field: field.name,
            message: field.validation.message ?? `"${field.label}" does not match the required pattern`,
          });
        }
        break;
      }

      case FieldType.NUMBER: {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({ field: field.name, message: `"${field.label}" must be a number` });
          break;
        }
        if (field.validation?.min !== undefined && num < field.validation.min) {
          errors.push({
            field: field.name,
            message: field.validation.message ?? `"${field.label}" must be ≥ ${field.validation.min}`,
          });
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          errors.push({
            field: field.name,
            message: field.validation.message ?? `"${field.label}" must be ≤ ${field.validation.max}`,
          });
        }
        break;
      }

      case FieldType.BOOLEAN: {
        if (typeof value !== 'boolean') {
          errors.push({ field: field.name, message: `"${field.label}" must be a boolean` });
        }
        break;
      }

      case FieldType.DATE: {
        const d = new Date(value as string);
        if (isNaN(d.getTime())) {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid date (YYYY-MM-DD)` });
        }
        break;
      }

      case FieldType.DATETIME: {
        const dt = new Date(value as string);
        if (isNaN(dt.getTime())) {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid ISO 8601 datetime` });
        }
        break;
      }

      case FieldType.EMAIL: {
        if (typeof value !== 'string' || !EMAIL_RE.test(value)) {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid email address` });
        }
        break;
      }

      case FieldType.URL: {
        if (typeof value !== 'string' || !URL_RE.test(value)) {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid URL starting with http:// or https://` });
        }
        break;
      }

      case FieldType.SLUG: {
        if (typeof value !== 'string' || !SLUG_RE.test(value)) {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid slug (lowercase letters, numbers, hyphens)` });
        }
        break;
      }

      case FieldType.COLOR: {
        if (typeof value !== 'string' || !HEX_COLOR_RE.test(value)) {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid hex color (e.g. #ff0000)` });
        }
        break;
      }

      case FieldType.SELECT: {
        const allowed = (field.options ?? []).map((o) => o.value);
        if (!allowed.includes(String(value))) {
          errors.push({
            field: field.name,
            message: `"${field.label}" must be one of: ${allowed.join(', ')}`,
          });
        }
        break;
      }

      case FieldType.MULTISELECT: {
        if (!Array.isArray(value)) {
          errors.push({ field: field.name, message: `"${field.label}" must be an array` });
          break;
        }
        const allowed = (field.options ?? []).map((o) => o.value);
        const invalid = (value as string[]).filter((v) => !allowed.includes(v));
        if (invalid.length > 0) {
          errors.push({
            field: field.name,
            message: `"${field.label}" contains invalid options: ${invalid.join(', ')}`,
          });
        }
        break;
      }

      case FieldType.JSON: {
        // JSON fields accept anything that can be serialised
        try {
          JSON.stringify(value);
        } catch {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid JSON value` });
        }
        break;
      }

      case FieldType.RELATION: {
        // Relation fields store the related entry ID as a string
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid entry ID` });
        }
        break;
      }

      // IMAGE and FILE reference Media IDs — same rule as RELATION
      case FieldType.IMAGE:
      case FieldType.FILE: {
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push({ field: field.name, message: `"${field.label}" must be a valid media ID` });
        }
        break;
      }
    }

    return errors;
  }

  /**
   * Validates an entire entry data payload against the content type definition.
   *
   * @param contentType The full content type definition.
   * @param data The entry data to validate.
   * @throws {ContentValidationError} If any field fails validation.
   */
  validateEntry(contentType: ContentTypeDefinition, data: ContentEntryData): void {
    const errors: ValidationError[] = [];

    for (const field of contentType.fields) {
      const value = data[field.name];
      const fieldErrors = this.validateField(field, value);
      errors.push(...fieldErrors);
    }

    if (errors.length > 0) {
      throw new ContentValidationError(errors);
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _recordToDefinition(record: {
    name: string;
    slug: string;
    description: string | null;
    fields: unknown;
    settings: unknown;
  }): ContentTypeDefinition {
    return {
      name: record.name,
      slug: record.slug,
      description: record.description ?? undefined,
      fields: record.fields as FieldDefinition[],
      settings: record.settings as ContentTypeDefinition['settings'],
    };
  }
}
