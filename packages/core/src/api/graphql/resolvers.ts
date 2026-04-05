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

import { ContentStatus } from '../../content/types.js';
import type { ContentRepository } from '../../content/repository.js';
import type { SchemaBuilder } from '../../content/schema-builder.js';
import type { ContentTypeDefinition } from '../../content/types.js';
import type { GraphQLContext, ResolverMap, ListQueryArgs, AuthPayload } from './types.js';

// ---------------------------------------------------------------------------
// Builder options
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Name helpers (duplicated to avoid circular imports)
// ---------------------------------------------------------------------------

function toPascalCase(slug: string): string {
  return slug
    .split(/[-_\s]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Sort string parser (shared with REST)
// ---------------------------------------------------------------------------

function parseSortString(sort?: string) {
  if (!sort) return undefined;
  return sort.split(',').map((s) => {
    s = s.trim();
    if (s.startsWith('-')) return { field: s.slice(1), direction: 'desc' as const };
    return { field: s, direction: 'asc' as const };
  });
}

// ---------------------------------------------------------------------------
// Resolver builder
// ---------------------------------------------------------------------------

/**
 * Builds a complete GraphQL resolver map from the provided services.
 * The returned map can be passed to any graphql-js compatible server.
 *
 * @param options Configuration including repository, schema builder, and callbacks.
 * @returns A resolver map keyed by type name then field name.
 */
export function buildResolvers(options: ResolverBuilderOptions): ResolverMap {
  const { repository, schemaBuilder, mediaManager, contentTypes, authenticate, register, invalidateSession } = options;

  const resolvers: ResolverMap = {
    // -----------------------------------------------------------------------
    // Query
    // -----------------------------------------------------------------------
    Query: {
      // Content types
      listContentTypes: async (_parent, _args, _ctx: GraphQLContext) => {
        return schemaBuilder.listContentTypes();
      },

      getContentType: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { slug } = args as { slug: string };
        try {
          return await schemaBuilder.getContentType(slug);
        } catch {
          return null;
        }
      },

      // Auth
      me: async (_parent, _args, ctx: GraphQLContext) => {
        return ctx.user ?? null;
      },

      // Media
      listMedia: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { folder, mimeType, page, perPage } = args as { folder?: string; mimeType?: string; page?: number; perPage?: number };
        if (!mediaManager) return { data: [], meta: { total: 0, page: 1, perPage: 20, totalPages: 0 } };
        const mm = mediaManager as { findMany: (opts: unknown) => Promise<{ data: unknown[]; meta: unknown }> };
        return mm.findMany({ folder, mimeType, page: page ?? 1, perPage: perPage ?? 20 });
      },

      getMedia: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { id } = args as { id: string };
        if (!mediaManager) return null;
        const mm = mediaManager as { findById: (id: string) => Promise<unknown> };
        try {
          return await mm.findById(id);
        } catch {
          return null;
        }
      },
    },

    // -----------------------------------------------------------------------
    // Mutation
    // -----------------------------------------------------------------------
    Mutation: {
      // Auth
      login: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { email, password } = args as { email: string; password: string };
        if (!authenticate) throw new Error('Authentication is not configured');
        return authenticate(email, password);
      },

      register: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { name, email, password } = args as { name: string; email: string; password: string };
        if (!register) throw new Error('Registration is not configured');
        return register(name, email, password);
      },

      logout: async (_parent, _args, ctx: GraphQLContext) => {
        if (ctx.user && invalidateSession) {
          await invalidateSession(ctx.user.id);
        }
        return true;
      },

      // Media
      deleteMedia: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { id } = args as { id: string };
        if (!mediaManager) return false;
        const mm = mediaManager as { delete: (id: string) => Promise<void> };
        await mm.delete(id);
        return true;
      },

      moveMedia: async (_parent, args: Record<string, unknown>, _ctx: GraphQLContext) => {
        const { id, folder } = args as { id: string; folder: string };
        if (!mediaManager) throw new Error('Media manager is not configured');
        const mm = mediaManager as { moveToFolder: (id: string, folder: string) => Promise<unknown> };
        return mm.moveToFolder(id, folder);
      },

      // Content Types (admin)
      createContentType: async (_parent, args: Record<string, unknown>, ctx: GraphQLContext) => {
        requireAuth(ctx);
        requireRole(ctx, 'admin');
        return schemaBuilder.createContentType({
          name: args['name'] as string,
          slug: args['slug'] as string,
          description: args['description'] as string | undefined,
          fields: args['fields'] as ContentTypeDefinition['fields'],
          settings: (args['settings'] as ContentTypeDefinition['settings']) ?? {},
        });
      },

      updateContentType: async (_parent, args: Record<string, unknown>, ctx: GraphQLContext) => {
        requireAuth(ctx);
        requireRole(ctx, 'admin');
        return schemaBuilder.updateContentType(args['slug'] as string, {
          name: args['name'] as string | undefined,
          description: args['description'] as string | undefined,
          fields: args['fields'] as ContentTypeDefinition['fields'] | undefined,
          settings: args['settings'] as ContentTypeDefinition['settings'] | undefined,
        });
      },

      deleteContentType: async (_parent, args: Record<string, unknown>, ctx: GraphQLContext) => {
        const { slug, deleteEntries } = args as { slug: string; deleteEntries?: boolean };
        requireAuth(ctx);
        requireRole(ctx, 'admin');
        await schemaBuilder.deleteContentType(slug, deleteEntries ?? false);
        return true;
      },
    },
  };

  // -----------------------------------------------------------------------
  // Generated resolvers for each content type
  // -----------------------------------------------------------------------

  for (const ct of contentTypes) {
    const typeName = toPascalCase(ct.slug);
    const queryName = lowerFirst(typeName);

    // ---------------------------
    // Queries
    // ---------------------------
    resolvers['Query'][`list${typeName}`] = async (
      _parent: unknown,
      args: Record<string, unknown>,
      _ctx: GraphQLContext,
    ) => {
      const { filter, sort, page, perPage, fields } = args as ListQueryArgs;
      return repository.findMany(ct.slug, {
        where: filter as Record<string, unknown> | undefined,
        orderBy: parseSortString(sort),
        page: page ?? 1,
        perPage: perPage ?? 20,
        select: fields?.split(',').map((f) => f.trim()),
      });
    };

    resolvers['Query'][`get${typeName}`] = async (
      _parent: unknown,
      args: Record<string, unknown>,
      _ctx: GraphQLContext,
    ) => {
      const { id } = args as { id: string };
      try {
        return await repository.findById(ct.slug, id);
      } catch {
        return null;
      }
    };

    const hasSlugField = ct.fields.some((f) => f.type === 'SLUG' || f.name === 'slug');
    if (hasSlugField) {
      resolvers['Query'][`get${typeName}BySlug`] = async (
        _parent: unknown,
        args: Record<string, unknown>,
        _ctx: GraphQLContext,
      ) => {
        const { slug } = args as { slug: string };
        try {
          return await repository.findBySlug(ct.slug, slug);
        } catch {
          return null;
        }
      };
    }

    // ---------------------------
    // Mutations
    // ---------------------------
    resolvers['Mutation'][`create${typeName}`] = async (
      _parent: unknown,
      args: Record<string, unknown>,
      ctx: GraphQLContext,
    ) => {
      const { input } = args as { input: Record<string, unknown> };
      requireAuth(ctx);
      return repository.create(ct.slug, input, ctx.user?.id);
    };

    resolvers['Mutation'][`update${typeName}`] = async (
      _parent: unknown,
      args: Record<string, unknown>,
      ctx: GraphQLContext,
    ) => {
      const { id, input } = args as { id: string; input: Record<string, unknown> };
      requireAuth(ctx);
      return repository.update(ct.slug, id, input);
    };

    resolvers['Mutation'][`delete${typeName}`] = async (
      _parent: unknown,
      args: Record<string, unknown>,
      ctx: GraphQLContext,
    ) => {
      const { id } = args as { id: string };
      requireAuth(ctx);
      await repository.delete(ct.slug, id);
      return true;
    };

    if (ct.settings.draftable) {
      resolvers['Mutation'][`publish${typeName}`] = async (
        _parent: unknown,
        args: Record<string, unknown>,
        ctx: GraphQLContext,
      ) => {
        const { id } = args as { id: string };
        requireAuth(ctx);
        return repository.publish(ct.slug, id);
      };

      resolvers['Mutation'][`unpublish${typeName}`] = async (
        _parent: unknown,
        args: Record<string, unknown>,
        ctx: GraphQLContext,
      ) => {
        const { id } = args as { id: string };
        requireAuth(ctx);
        return repository.unpublish(ct.slug, id);
      };
    }

    // ---------------------------
    // Field-level resolver for `data` flattening
    // ---------------------------
    // If consumers want to access typed fields directly on the object type
    // (e.g. `post.title` instead of `post.data.title`), add a resolver
    // for each field that reads from `entry.data`.
    resolvers[typeName] = resolvers[typeName] ?? {};
    for (const field of ct.fields) {
      if (field.type === 'PASSWORD') continue; // Never expose passwords
      resolvers[typeName][field.name] = (parent: unknown) => {
        const p = parent as Record<string, unknown>;
        const data = p['data'] as Record<string, unknown> | undefined;
        return data?.[field.name] ?? null;
      };
    }
  }

  return resolvers;
}

// ---------------------------------------------------------------------------
// Auth guard helpers
// ---------------------------------------------------------------------------

/**
 * Throws a GraphQL-compatible error if the user is not authenticated.
 */
function requireAuth(ctx: GraphQLContext): asserts ctx is GraphQLContext & { user: NonNullable<GraphQLContext['user']> } {
  if (!ctx.user) {
    throw new GraphQLAuthError('Authentication required');
  }
}

/**
 * Throws a GraphQL-compatible error if the user does not have the required role.
 */
function requireRole(ctx: GraphQLContext, role: string): void {
  if (ctx.user?.role !== role) {
    throw new GraphQLAuthError(`This operation requires the "${role}" role`);
  }
}

// ---------------------------------------------------------------------------
// GraphQL-compatible error classes
// ---------------------------------------------------------------------------

/**
 * A GraphQL error that sets the `extensions.code` field to a machine-readable code.
 * Compatible with Apollo Server, GraphQL Yoga, and raw graphql-js.
 */
export class GraphQLAuthError extends Error {
  extensions: { code: string };

  constructor(message: string) {
    super(message);
    this.name = 'GraphQLAuthError';
    this.extensions = { code: 'UNAUTHORIZED' };
  }
}

/**
 * A GraphQL error representing a "not found" condition.
 */
export class GraphQLNotFoundError extends Error {
  extensions: { code: string };

  constructor(message: string) {
    super(message);
    this.name = 'GraphQLNotFoundError';
    this.extensions = { code: 'NOT_FOUND' };
  }
}
