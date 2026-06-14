/**
 * @file content/types.ts
 * @description Core type definitions for the Volqan Content Modeling Engine.
 *
 * Provides the foundational types for defining content types, fields,
 * entries, query options, and pagination used throughout the CMS.
 */
/**
 * Enumeration of all supported field types in the content modeling system.
 */
export declare enum FieldType {
    /** Plain text, single-line string. */
    TEXT = "TEXT",
    /** Rich text / HTML content. */
    RICHTEXT = "RICHTEXT",
    /** Numeric value (integer or float). */
    NUMBER = "NUMBER",
    /** Boolean flag (true/false). */
    BOOLEAN = "BOOLEAN",
    /** Date only (YYYY-MM-DD). */
    DATE = "DATE",
    /** Full date + time (ISO 8601). */
    DATETIME = "DATETIME",
    /** Email address with RFC 5322 validation. */
    EMAIL = "EMAIL",
    /** URL with protocol validation. */
    URL = "URL",
    /** URL-safe slug, auto-generated from a source field if not provided. */
    SLUG = "SLUG",
    /** Reference to a Media record (image). */
    IMAGE = "IMAGE",
    /** Reference to a Media record (any file). */
    FILE = "FILE",
    /** Arbitrary JSON value. */
    JSON = "JSON",
    /** Foreign key relation to another ContentType. */
    RELATION = "RELATION",
    /** Single-choice selection from a fixed list of options. */
    SELECT = "SELECT",
    /** Multi-choice selection from a fixed list of options. */
    MULTISELECT = "MULTISELECT",
    /** Hex color string, e.g. #ff0000. */
    COLOR = "COLOR",
    /** Hashed password field (never returned in API responses). */
    PASSWORD = "PASSWORD"
}
/** Validation constraints applied to a field value at write-time. */
export interface FieldValidation {
    /** Minimum numeric value or minimum string length (context-dependent). */
    min?: number;
    /** Maximum numeric value or maximum string length (context-dependent). */
    max?: number;
    /** Regular expression pattern the string value must match. */
    pattern?: string;
    /** Human-readable message shown when validation fails. */
    message?: string;
}
/** One option inside a SELECT or MULTISELECT field. */
export interface SelectOption {
    /** The stored value. */
    value: string;
    /** Human-readable label displayed in the UI. */
    label: string;
}
/**
 * Full definition of a single field within a ContentType.
 * Serialised into the `fields` JSON column of the `ContentType` table.
 */
export interface FieldDefinition {
    /** Internal field identifier (camelCase, no spaces). */
    name: string;
    /** Data type of the field. */
    type: FieldType;
    /** Human-readable label shown in the admin UI. */
    label: string;
    /** Whether the field must be present on every entry. */
    required?: boolean;
    /** Whether values must be unique across all entries of this type. */
    unique?: boolean;
    /** Default value applied when the field is omitted during creation. */
    default?: unknown;
    /** Optional validation constraints. */
    validation?: FieldValidation;
    /** Allowed options for SELECT and MULTISELECT fields. */
    options?: SelectOption[];
    /** For RELATION fields: the slug of the target ContentType. */
    relationTo?: string;
    /** When true the field is hidden from public API responses. */
    hidden?: boolean;
    /** When true the field can be used as an orderBy key. */
    sortable?: boolean;
    /** When true the field can be used as a filter parameter. */
    filterable?: boolean;
}
/** Per-type behavioural settings. */
export interface ContentTypeSettings {
    /** If true, only one entry may exist for this type. */
    singleton?: boolean;
    /** Automatically maintain createdAt / updatedAt timestamps. */
    timestamps?: boolean;
    /** Use soft-delete (deletedAt) instead of hard database removal. */
    softDelete?: boolean;
    /** Allow entries to exist in DRAFT status before publication. */
    draftable?: boolean;
    /** Expose this type via auto-generated REST and GraphQL APIs. */
    api?: boolean;
}
/**
 * The full definition of a Volqan content type.
 * Persisted as a `ContentType` record with `fields` as JSON.
 */
export interface ContentTypeDefinition {
    /** Display name, e.g. "Blog Post". */
    name: string;
    /** URL-safe unique identifier, e.g. "blog-post". */
    slug: string;
    /** Optional prose description shown in the admin UI. */
    description?: string;
    /** Ordered list of field definitions. */
    fields: FieldDefinition[];
    /** Behavioural flags for this content type. */
    settings: ContentTypeSettings;
}
/** Raw key-value map stored in the `data` JSON column of a ContentEntry. */
export type ContentEntryData = Record<string, unknown>;
/** Lifecycle status of a content entry. */
export declare enum ContentStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
/** Sort direction for a single field. */
export type SortDirection = 'asc' | 'desc';
/** A single sort instruction. */
export interface OrderByOption {
    field: string;
    direction: SortDirection;
}
/**
 * Options passed to list / findMany operations.
 * Mirrors common CMS query conventions (similar to Payload CMS / Strapi).
 */
export interface QueryOptions {
    /**
     * Field-level equality filters.
     * Supports nested operators: { status: { equals: 'PUBLISHED' }, price: { gte: 100 } }
     */
    where?: Record<string, unknown>;
    /** Ordering of results. */
    orderBy?: OrderByOption[];
    /** 1-based page number. */
    page?: number;
    /** Number of entries per page (default 20, max 100). */
    perPage?: number;
    /**
     * Related content types to eagerly load.
     * e.g. ['author', 'category']
     */
    include?: string[];
    /**
     * Projection — only return these fields in the response.
     * e.g. ['title', 'slug', 'status']
     */
    select?: string[];
}
/** Metadata attached to every paginated list response. */
export interface PaginationMeta {
    /** Total number of matching records. */
    total: number;
    /** Current page (1-based). */
    page: number;
    /** Items per page. */
    perPage: number;
    /** Computed: Math.ceil(total / perPage). */
    totalPages: number;
}
/**
 * Generic paginated result wrapper.
 *
 * @template T The type of each item in the result set.
 */
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
/** A single field validation failure. */
export interface ValidationError {
    /** The field that failed validation. */
    field: string;
    /** Human-readable description of the failure. */
    message: string;
}
/** Thrown when entry or field validation fails. */
export declare class ContentValidationError extends Error {
    readonly errors: ValidationError[];
    constructor(errors: ValidationError[], message?: string);
}
/** Thrown when a requested content type does not exist. */
export declare class ContentTypeNotFoundError extends Error {
    constructor(slug: string);
}
/** Thrown when a requested entry does not exist. */
export declare class ContentEntryNotFoundError extends Error {
    constructor(id: string);
}
//# sourceMappingURL=types.d.ts.map