/**
 * @file api/graphql/index.ts
 * @description Barrel export for the Volqan GraphQL API generator.
 *
 * @example
 * ```ts
 * import {
 *   SchemaGenerator,
 *   buildResolvers,
 *   GraphQLAuthError,
 * } from '@volqan/core/api/graphql';
 * ```
 */
export type { GraphQLContext, GeneratedTypeBlock, GeneratedQueryBlock, GeneratedMutationBlock, Resolver, ResolverMap, ListQueryArgs, LoginArgs, RegisterArgs, AuthPayload, } from './types.js';
export { SchemaGenerator } from './schema-generator.js';
export { buildResolvers, GraphQLAuthError, GraphQLNotFoundError } from './resolvers.js';
export type { ResolverBuilderOptions } from './resolvers.js';
//# sourceMappingURL=index.d.ts.map