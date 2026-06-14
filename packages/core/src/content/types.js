/**
 * @file content/types.ts
 * @description Core type definitions for the Volqan Content Modeling Engine.
 *
 * Provides the foundational types for defining content types, fields,
 * entries, query options, and pagination used throughout the CMS.
 */
// ---------------------------------------------------------------------------
// Field Types
// ---------------------------------------------------------------------------
/**
 * Enumeration of all supported field types in the content modeling system.
 */
export var FieldType;
(function (FieldType) {
    /** Plain text, single-line string. */
    FieldType["TEXT"] = "TEXT";
    /** Rich text / HTML content. */
    FieldType["RICHTEXT"] = "RICHTEXT";
    /** Numeric value (integer or float). */
    FieldType["NUMBER"] = "NUMBER";
    /** Boolean flag (true/false). */
    FieldType["BOOLEAN"] = "BOOLEAN";
    /** Date only (YYYY-MM-DD). */
    FieldType["DATE"] = "DATE";
    /** Full date + time (ISO 8601). */
    FieldType["DATETIME"] = "DATETIME";
    /** Email address with RFC 5322 validation. */
    FieldType["EMAIL"] = "EMAIL";
    /** URL with protocol validation. */
    FieldType["URL"] = "URL";
    /** URL-safe slug, auto-generated from a source field if not provided. */
    FieldType["SLUG"] = "SLUG";
    /** Reference to a Media record (image). */
    FieldType["IMAGE"] = "IMAGE";
    /** Reference to a Media record (any file). */
    FieldType["FILE"] = "FILE";
    /** Arbitrary JSON value. */
    FieldType["JSON"] = "JSON";
    /** Foreign key relation to another ContentType. */
    FieldType["RELATION"] = "RELATION";
    /** Single-choice selection from a fixed list of options. */
    FieldType["SELECT"] = "SELECT";
    /** Multi-choice selection from a fixed list of options. */
    FieldType["MULTISELECT"] = "MULTISELECT";
    /** Hex color string, e.g. #ff0000. */
    FieldType["COLOR"] = "COLOR";
    /** Hashed password field (never returned in API responses). */
    FieldType["PASSWORD"] = "PASSWORD";
})(FieldType || (FieldType = {}));
/** Lifecycle status of a content entry. */
export var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "DRAFT";
    ContentStatus["PUBLISHED"] = "PUBLISHED";
    ContentStatus["ARCHIVED"] = "ARCHIVED";
})(ContentStatus || (ContentStatus = {}));
/** Thrown when entry or field validation fails. */
export class ContentValidationError extends Error {
    errors;
    constructor(errors, message = 'Content validation failed') {
        super(message);
        this.errors = errors;
        this.name = 'ContentValidationError';
    }
}
/** Thrown when a requested content type does not exist. */
export class ContentTypeNotFoundError extends Error {
    constructor(slug) {
        super(`Content type "${slug}" not found`);
        this.name = 'ContentTypeNotFoundError';
    }
}
/** Thrown when a requested entry does not exist. */
export class ContentEntryNotFoundError extends Error {
    constructor(id) {
        super(`Content entry "${id}" not found`);
        this.name = 'ContentEntryNotFoundError';
    }
}
//# sourceMappingURL=types.js.map