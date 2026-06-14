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
import { type ContentTypeDefinition } from '../../content/types.js';
import type { GeneratedTypeBlock, GeneratedQueryBlock, GeneratedMutationBlock } from './types.js';
/**
 * Generates a complete GraphQL SDL schema from a list of ContentTypeDefinitions.
 */
export declare class SchemaGenerator {
    /**
     * Generates a complete GraphQL SDL string from the given content type definitions.
     *
     * @param contentTypes Array of content type definitions to generate schema for.
     * @returns A complete, executable GraphQL SDL string.
     */
    generateSchema(contentTypes: ContentTypeDefinition[]): string;
    /**
     * Generates only the type blocks for a single ContentType.
     * Useful for incremental schema updates when a new type is added.
     */
    generateTypeBlock(contentType: ContentTypeDefinition): GeneratedTypeBlock;
    /**
     * Generates the query declarations for a single ContentType.
     */
    generateQueryBlock(contentType: ContentTypeDefinition): GeneratedQueryBlock;
    /**
     * Generates the mutation declarations for a single ContentType.
     */
    generateMutationBlock(contentType: ContentTypeDefinition): GeneratedMutationBlock;
    private _generateScalars;
    private _generateBuiltInTypes;
    private _generateTypeBlock;
    private _generateQueryBlock;
    private _generateMutationBlock;
    private _buildQueryType;
    private _buildMutationType;
}
//# sourceMappingURL=schema-generator.d.ts.map