/**
 * @file api/graphql/schema-generator.ts
 * @description Generates a complete GraphQL SDL schema from Volqan ContentType definitions.
 *
 * The generated schema includes:
 * - Object types for every ContentType field
 * - Input types for create, update, and filter operations
 * - Queries: list (paginated + filtered), get by ID, get by slug
 * - Mutations: create, update, delete, publish, unpublish
 * - Built-in types: User, Media, ContentTypeInfo, PaginationMeta
 * - Auth mutations: login, register, logout
 *
 * The SDL string can be passed directly to any GraphQL server library
 * (graphql-js, pothos, etc.) or used with `buildSchema` from graphql-js.
 *
 * @example
 * ```ts
 * const generator = new SchemaGenerator();
 * const sdl = generator.generateSchema(contentTypes);
 * // Pass sdl to your GraphQL server
 * ```
 */
import { FieldType } from '../../content/types.js';
// ---------------------------------------------------------------------------
// Name helpers
// ---------------------------------------------------------------------------
/** Converts a slug like "blog-post" to PascalCase "BlogPost". */
function toPascalCase(slug) {
    return slug
        .split(/[-_\s]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');
}
/** Lowercases the first character of a string. */
function lowerFirst(s) {
    return s.charAt(0).toLowerCase() + s.slice(1);
}
// ---------------------------------------------------------------------------
// Field type mapping
// ---------------------------------------------------------------------------
/**
 * Maps a Volqan FieldType to its GraphQL scalar equivalent.
 */
function toGraphQLType(field) {
    switch (field.type) {
        case FieldType.TEXT:
        case FieldType.RICHTEXT:
        case FieldType.EMAIL:
        case FieldType.URL:
        case FieldType.SLUG:
        case FieldType.COLOR:
        case FieldType.PASSWORD:
            return 'String';
        case FieldType.NUMBER:
            return 'Float';
        case FieldType.BOOLEAN:
            return 'Boolean';
        case FieldType.DATE:
        case FieldType.DATETIME:
            return 'String'; // ISO 8601 string; use a custom DateTime scalar if needed
        case FieldType.IMAGE:
        case FieldType.FILE:
            return 'Media';
        case FieldType.RELATION:
            return field.relationTo ? toPascalCase(field.relationTo) : 'String';
        case FieldType.SELECT:
            return 'String';
        case FieldType.MULTISELECT:
            return '[String!]';
        case FieldType.JSON:
            return 'JSON';
        default:
            return 'String';
    }
}
/** Maps a FieldType to its GraphQL input scalar (for mutation args). */
function toGraphQLInputType(field) {
    if (field.type === FieldType.IMAGE || field.type === FieldType.FILE) {
        return 'ID'; // Input fields for media reference the media ID
    }
    if (field.type === FieldType.RELATION) {
        return 'ID';
    }
    return toGraphQLType(field);
}
// ---------------------------------------------------------------------------
// SchemaGenerator
// ---------------------------------------------------------------------------
/**
 * Generates a complete GraphQL SDL schema from a list of ContentTypeDefinitions.
 */
export class SchemaGenerator {
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    /**
     * Generates a complete GraphQL SDL string from the given content type definitions.
     *
     * @param contentTypes Array of content type definitions to generate schema for.
     * @returns A complete, executable GraphQL SDL string.
     */
    generateSchema(contentTypes) {
        const blocks = [];
        // Scalars
        blocks.push(this._generateScalars());
        // Built-in types
        blocks.push(this._generateBuiltInTypes());
        // Generated types for each content type
        const typeBlocks = contentTypes.map((ct) => this._generateTypeBlock(ct));
        for (const block of typeBlocks) {
            blocks.push(block.objectType);
            blocks.push(block.createInput);
            blocks.push(block.updateInput);
            blocks.push(block.filterInput);
            blocks.push(block.listType);
        }
        // Query type
        const queryBlocks = contentTypes.map((ct) => this._generateQueryBlock(ct));
        blocks.push(this._buildQueryType(queryBlocks));
        // Mutation type
        const mutationBlocks = contentTypes.map((ct) => this._generateMutationBlock(ct));
        blocks.push(this._buildMutationType(mutationBlocks));
        return blocks.filter(Boolean).join('\n\n');
    }
    /**
     * Generates only the type blocks for a single ContentType.
     * Useful for incremental schema updates when a new type is added.
     */
    generateTypeBlock(contentType) {
        return this._generateTypeBlock(contentType);
    }
    /**
     * Generates the query declarations for a single ContentType.
     */
    generateQueryBlock(contentType) {
        return this._generateQueryBlock(contentType);
    }
    /**
     * Generates the mutation declarations for a single ContentType.
     */
    generateMutationBlock(contentType) {
        return this._generateMutationBlock(contentType);
    }
    // -------------------------------------------------------------------------
    // Scalars
    // -------------------------------------------------------------------------
    _generateScalars() {
        return `"""Arbitrary JSON value"""
scalar JSON

"""ISO 8601 date-time string"""
scalar DateTime`;
    }
    // -------------------------------------------------------------------------
    // Built-in types
    // -------------------------------------------------------------------------
    _generateBuiltInTypes() {
        return `# -------------------------------------------------------------------
# Built-in types
# -------------------------------------------------------------------

"""Pagination metadata for list responses."""
type PaginationMeta {
  total: Int!
  page: Int!
  perPage: Int!
  totalPages: Int!
}

"""Authenticated user."""
type User {
  id: ID!
  name: String
  email: String!
  role: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""Authentication result payload."""
type AuthPayload {
  token: String!
  user: User!
}

"""A media file stored by Volqan."""
type Media {
  id: ID!
  filename: String!
  originalName: String!
  mimeType: String!
  size: Int!
  url: String!
  thumbnailUrl: String
  width: Int
  height: Int
  folder: String
  alt: String
  caption: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A paginated list of Media files."""
type MediaList {
  data: [Media!]!
  meta: PaginationMeta!
}

"""Metadata about a registered content type."""
type ContentTypeInfo {
  id: ID!
  name: String!
  slug: String!
  description: String
  fields: JSON!
  settings: JSON!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A content entry."""
type ContentEntry {
  id: ID!
  contentTypeSlug: String!
  slug: String
  status: ContentStatus!
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  data: JSON!
  author: User
}

"""Paginated content entry list."""
type ContentEntryList {
  data: [ContentEntry!]!
  meta: PaginationMeta!
}

"""Content lifecycle status."""
enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

"""Filter input for generic content entries."""
input ContentEntryFilterInput {
  status: ContentStatus
  authorId: ID
  slug: String
}

"""Input for creating a generic content entry."""
input ContentEntryCreateInput {
  data: JSON!
}

"""Input for updating a generic content entry."""
input ContentEntryUpdateInput {
  data: JSON!
}`;
    }
    // -------------------------------------------------------------------------
    // Per-ContentType type blocks
    // -------------------------------------------------------------------------
    _generateTypeBlock(ct) {
        const typeName = toPascalCase(ct.slug);
        // --- Object type ---
        const fields = ct.fields
            .filter((f) => f.type !== FieldType.PASSWORD) // Never expose password in output
            .map((f) => {
            const gqlType = toGraphQLType(f);
            const nullable = f.required ? '!' : '';
            const isList = f.type === FieldType.MULTISELECT;
            const fieldType = isList ? `[String!]` : `${gqlType}${nullable}`;
            const doc = `  """${f.label}"""`;
            return `${doc}\n  ${f.name}: ${fieldType}`;
        })
            .join('\n\n');
        const objectType = `"""${ct.description ?? ct.name}"""
type ${typeName} {
  id: ID!
  slug: String
  status: ContentStatus!
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  author: User

${fields}
}`;
        // --- Create input ---
        const createFields = ct.fields
            .map((f) => {
            const gqlType = toGraphQLInputType(f);
            const required = f.required && f.default === undefined ? '!' : '';
            const isList = f.type === FieldType.MULTISELECT;
            const fieldType = isList ? `[String!]${required}` : `${gqlType}${required}`;
            const doc = `  """${f.label}"""`;
            return `${doc}\n  ${f.name}: ${fieldType}`;
        })
            .join('\n\n');
        const createInput = `"""Input for creating a new ${ct.name}."""
input Create${typeName}Input {
${createFields}
}`;
        // --- Update input (all fields optional) ---
        const updateFields = ct.fields
            .map((f) => {
            const gqlType = toGraphQLInputType(f);
            const isList = f.type === FieldType.MULTISELECT;
            const fieldType = isList ? `[String!]` : gqlType;
            return `  """${f.label}"""\n  ${f.name}: ${fieldType}`;
        })
            .join('\n\n');
        const updateInput = `"""Input for updating an existing ${ct.name}. All fields are optional."""
input Update${typeName}Input {
${updateFields}
}`;
        // --- Filter input ---
        const filterableFields = ct.fields
            .filter((f) => f.filterable !== false && f.type !== FieldType.RICHTEXT && f.type !== FieldType.JSON && f.type !== FieldType.PASSWORD)
            .map((f) => {
            const gqlType = toGraphQLInputType(f);
            return `  """Filter by ${f.label}"""\n  ${f.name}: ${gqlType}`;
        })
            .join('\n\n');
        const filterInput = `"""Filter input for ${ct.name} list queries."""
input ${typeName}FilterInput {
  status: ContentStatus
  authorId: ID
${filterableFields}
}`;
        // --- List type ---
        const listType = `"""Paginated list of ${ct.name} entries."""
type ${typeName}List {
  data: [${typeName}!]!
  meta: PaginationMeta!
}`;
        return { objectType, createInput, updateInput, filterInput, listType };
    }
    // -------------------------------------------------------------------------
    // Per-ContentType query blocks
    // -------------------------------------------------------------------------
    _generateQueryBlock(ct) {
        const typeName = toPascalCase(ct.slug);
        const queryName = lowerFirst(typeName);
        const hasSlugField = ct.fields.some((f) => f.type === FieldType.SLUG || f.name === 'slug');
        return {
            listQuery: `  """List ${ct.name} entries with optional filtering, sorting, and pagination."""
  list${typeName}(filter: ${typeName}FilterInput, sort: String, page: Int, perPage: Int, fields: String): ${typeName}List!`,
            getQuery: `  """Get a single ${ct.name} by ID."""
  get${typeName}(id: ID!): ${typeName}`,
            getBySlugQuery: hasSlugField
                ? `  """Get a single ${ct.name} by its slug."""
  get${typeName}BySlug(slug: String!): ${typeName}`
                : '',
        };
    }
    // -------------------------------------------------------------------------
    // Per-ContentType mutation blocks
    // -------------------------------------------------------------------------
    _generateMutationBlock(ct) {
        const typeName = toPascalCase(ct.slug);
        const mutName = lowerFirst(typeName);
        return {
            createMutation: `  """Create a new ${ct.name}. Requires authentication."""
  create${typeName}(input: Create${typeName}Input!): ${typeName}!`,
            updateMutation: `  """Update an existing ${ct.name}. Requires authentication."""
  update${typeName}(id: ID!, input: Update${typeName}Input!): ${typeName}!`,
            deleteMutation: `  """Delete a ${ct.name}. Requires authentication."""
  delete${typeName}(id: ID!): Boolean!`,
            publishMutation: ct.settings.draftable
                ? `  """Publish a ${ct.name}. Requires authentication."""
  publish${typeName}(id: ID!): ${typeName}!`
                : '',
            unpublishMutation: ct.settings.draftable
                ? `  """Unpublish a ${ct.name} (revert to DRAFT). Requires authentication."""
  unpublish${typeName}(id: ID!): ${typeName}!`
                : '',
        };
    }
    // -------------------------------------------------------------------------
    // Root types
    // -------------------------------------------------------------------------
    _buildQueryType(queryBlocks) {
        const queryFields = queryBlocks
            .flatMap((b) => [b.listQuery, b.getQuery, b.getBySlugQuery].filter(Boolean))
            .join('\n\n');
        return `type Query {
  # -------------------------------------------------------------------
  # Content Types
  # -------------------------------------------------------------------
  """List all registered content types."""
  listContentTypes: [ContentTypeInfo!]!

  """Get a content type by slug."""
  getContentType(slug: String!): ContentTypeInfo

  # -------------------------------------------------------------------
  # Media
  # -------------------------------------------------------------------
  """List media files."""
  listMedia(folder: String, mimeType: String, page: Int, perPage: Int): MediaList!

  """Get a single media file by ID."""
  getMedia(id: ID!): Media

  # -------------------------------------------------------------------
  # Auth
  # -------------------------------------------------------------------
  """Get the currently authenticated user."""
  me: User

  # -------------------------------------------------------------------
  # Generated content type queries
  # -------------------------------------------------------------------
${queryFields}
}`;
    }
    _buildMutationType(mutationBlocks) {
        const mutationFields = mutationBlocks
            .flatMap((b) => [
            b.createMutation,
            b.updateMutation,
            b.deleteMutation,
            b.publishMutation,
            b.unpublishMutation,
        ].filter(Boolean))
            .join('\n\n');
        return `type Mutation {
  # -------------------------------------------------------------------
  # Auth
  # -------------------------------------------------------------------
  """Authenticate with email and password. Returns a JWT token."""
  login(email: String!, password: String!): AuthPayload!

  """Register a new user account."""
  register(name: String!, email: String!, password: String!): AuthPayload!

  """Invalidate the current session (server-side)."""
  logout: Boolean!

  # -------------------------------------------------------------------
  # Media
  # -------------------------------------------------------------------
  """Delete a media file by ID."""
  deleteMedia(id: ID!): Boolean!

  """Move a media file to a folder."""
  moveMedia(id: ID!, folder: String!): Media!

  # -------------------------------------------------------------------
  # Content Types (admin only)
  # -------------------------------------------------------------------
  """Create a new content type definition. Admin only."""
  createContentType(name: String!, slug: String!, description: String, fields: JSON!, settings: JSON!): ContentTypeInfo!

  """Update a content type definition. Admin only."""
  updateContentType(slug: String!, name: String, description: String, fields: JSON, settings: JSON): ContentTypeInfo!

  """Delete a content type. Admin only."""
  deleteContentType(slug: String!, deleteEntries: Boolean): Boolean!

  # -------------------------------------------------------------------
  # Generated content type mutations
  # -------------------------------------------------------------------
${mutationFields}
}`;
    }
}
//# sourceMappingURL=schema-generator.js.map