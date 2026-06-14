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
// Schema Generator
export { SchemaGenerator } from './schema-generator.js';
// Resolvers
export { buildResolvers, GraphQLAuthError, GraphQLNotFoundError } from './resolvers.js';
//# sourceMappingURL=index.js.map