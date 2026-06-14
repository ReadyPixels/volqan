/**
 * @file api/graphql/resolvers.ts
 * @description Auto-generated GraphQL resolvers for the Volqan CMS.
 *
 * All resolvers delegate to ContentRepository and SchemaBuilder, keeping
 * the resolver layer thin and the business logic in the core modules.
 *
 * ## Usage
 *
 * ```ts
 * import { buildResolvers } from '@volqan/core/api/graphql';
 *
 * const resolvers = buildResolvers({
 *   repository,
 *   schemaBuilder,
 *   mediaManager,
 *   contentTypes,
 *   authenticate,
 *   register,
 * });
 *
 * // Pass resolvers to your GraphQL server
 * ```
 *
 * The resolver map is compatible with graphql-js, Apollo Server, Yoga, and Pothos.
 */
import type { ContentRepository } from '../../content/repository.js';
import type { SchemaBuilder } from '../../content/schema-builder.js';
import type { ContentTypeDefinition } from '../../content/types.js';
import type { ResolverMap, AuthPayload } from './types.js';
/** Services required to build the resolver map. */
export interface ResolverBuilderOptions {
    /** Content CRUD repository. */
    repository: ContentRepository;
    /** Schema builder for content type management. */
    schemaBuilder: SchemaBuilder;
    /**
     * Optional media manager. If omitted, media resolvers return null.
     * Type is `unknown` to avoid a hard import cycle; cast inside resolvers.
     */
    mediaManager?: unknown;
    /**
     * List of content types to generate resolvers for.
     * Should match the content types passed to SchemaGenerator.generateSchema.
     */
    contentTypes: ContentTypeDefinition[];
    /**
     * Authentication callback used by the `login` mutation.
     * Should return a JWT token and user object or throw on failure.
     */
    authenticate?: (email: string, password: string) => Promise<AuthPayload>;
    /**
     * Registration callback used by the `register` mutation.
     * Should create the user and return a JWT token and user object.
     */
    register?: (name: string, email: string, password: string) => Promise<AuthPayload>;
    /**
     * Logout callback used by the `logout` mutation.
     * May invalidate a refresh token or server-side session.
     */
    invalidateSession?: (userId: string) => Promise<void>;
}
/**
 * Builds a complete GraphQL resolver map from the provided services.
 * The returned map can be passed to any graphql-js compatible server.
 *
 * @param options Configuration including repository, schema builder, and callbacks.
 * @returns A resolver map keyed by type name then field name.
 */
export declare function buildResolvers(options: ResolverBuilderOptions): ResolverMap;
/**
 * A GraphQL error that sets the `extensions.code` field to a machine-readable code.
 * Compatible with Apollo Server, GraphQL Yoga, and raw graphql-js.
 */
export declare class GraphQLAuthError extends Error {
    extensions: {
        code: string;
    };
    constructor(message: string);
}
/**
 * A GraphQL error representing a "not found" condition.
 */
export declare class GraphQLNotFoundError extends Error {
    extensions: {
        code: string;
    };
    constructor(message: string);
}
//# sourceMappingURL=resolvers.d.ts.map