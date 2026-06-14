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
// ---------------------------------------------------------------------------
// Name helpers (duplicated to avoid circular imports)
// ---------------------------------------------------------------------------
function toPascalCase(slug) {
    return slug
        .split(/[-_\s]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join('');
}
function lowerFirst(s) {
    return s.charAt(0).toLowerCase() + s.slice(1);
}
// ---------------------------------------------------------------------------
// Sort string parser (shared with REST)
// ---------------------------------------------------------------------------
function parseSortString(sort) {
    if (!sort)
        return undefined;
    return sort.split(',').map((s) => {
        s = s.trim();
        if (s.startsWith('-'))
            return { field: s.slice(1), direction: 'desc' };
        return { field: s, direction: 'asc' };
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
export function buildResolvers(options) {
    const { repository, schemaBuilder, mediaManager, contentTypes, authenticate, register, invalidateSession } = options;
    const resolvers = {
        // -----------------------------------------------------------------------
        // Query
        // -----------------------------------------------------------------------
        Query: {
            // Content types
            listContentTypes: async (_parent, _args, _ctx) => {
                return schemaBuilder.listContentTypes();
            },
            getContentType: async (_parent, args, _ctx) => {
                const { slug } = args;
                try {
                    return await schemaBuilder.getContentType(slug);
                }
                catch {
                    return null;
                }
            },
            // Auth
            me: async (_parent, _args, ctx) => {
                return ctx.user ?? null;
            },
            // Media
            listMedia: async (_parent, args, _ctx) => {
                const { folder, mimeType, page, perPage } = args;
                if (!mediaManager)
                    return { data: [], meta: { total: 0, page: 1, perPage: 20, totalPages: 0 } };
                const mm = mediaManager;
                return mm.findMany({ folder, mimeType, page: page ?? 1, perPage: perPage ?? 20 });
            },
            getMedia: async (_parent, args, _ctx) => {
                const { id } = args;
                if (!mediaManager)
                    return null;
                const mm = mediaManager;
                try {
                    return await mm.findById(id);
                }
                catch {
                    return null;
                }
            },
        },
        // -----------------------------------------------------------------------
        // Mutation
        // -----------------------------------------------------------------------
        Mutation: {
            // Auth
            login: async (_parent, args, _ctx) => {
                const { email, password } = args;
                if (!authenticate)
                    throw new Error('Authentication is not configured');
                return authenticate(email, password);
            },
            register: async (_parent, args, _ctx) => {
                const { name, email, password } = args;
                if (!register)
                    throw new Error('Registration is not configured');
                return register(name, email, password);
            },
            logout: async (_parent, _args, ctx) => {
                if (ctx.user && invalidateSession) {
                    await invalidateSession(ctx.user.id);
                }
                return true;
            },
            // Media
            deleteMedia: async (_parent, args, _ctx) => {
                const { id } = args;
                if (!mediaManager)
                    return false;
                const mm = mediaManager;
                await mm.delete(id);
                return true;
            },
            moveMedia: async (_parent, args, _ctx) => {
                const { id, folder } = args;
                if (!mediaManager)
                    throw new Error('Media manager is not configured');
                const mm = mediaManager;
                return mm.moveToFolder(id, folder);
            },
            // Content Types (admin)
            createContentType: async (_parent, args, ctx) => {
                requireAuth(ctx);
                requireRole(ctx, 'admin');
                return schemaBuilder.createContentType({
                    name: args['name'],
                    slug: args['slug'],
                    description: args['description'],
                    fields: args['fields'],
                    settings: args['settings'] ?? {},
                });
            },
            updateContentType: async (_parent, args, ctx) => {
                requireAuth(ctx);
                requireRole(ctx, 'admin');
                return schemaBuilder.updateContentType(args['slug'], {
                    name: args['name'],
                    description: args['description'],
                    fields: args['fields'],
                    settings: args['settings'],
                });
            },
            deleteContentType: async (_parent, args, ctx) => {
                const { slug, deleteEntries } = args;
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
        resolvers['Query'][`list${typeName}`] = async (_parent, args, _ctx) => {
            const { filter, sort, page, perPage, fields } = args;
            return repository.findMany(ct.slug, {
                where: filter,
                orderBy: parseSortString(sort),
                page: page ?? 1,
                perPage: perPage ?? 20,
                select: fields?.split(',').map((f) => f.trim()),
            });
        };
        resolvers['Query'][`get${typeName}`] = async (_parent, args, _ctx) => {
            const { id } = args;
            try {
                return await repository.findById(ct.slug, id);
            }
            catch {
                return null;
            }
        };
        const hasSlugField = ct.fields.some((f) => f.type === 'SLUG' || f.name === 'slug');
        if (hasSlugField) {
            resolvers['Query'][`get${typeName}BySlug`] = async (_parent, args, _ctx) => {
                const { slug } = args;
                try {
                    return await repository.findBySlug(ct.slug, slug);
                }
                catch {
                    return null;
                }
            };
        }
        // ---------------------------
        // Mutations
        // ---------------------------
        resolvers['Mutation'][`create${typeName}`] = async (_parent, args, ctx) => {
            const { input } = args;
            requireAuth(ctx);
            return repository.create(ct.slug, input, ctx.user?.id);
        };
        resolvers['Mutation'][`update${typeName}`] = async (_parent, args, ctx) => {
            const { id, input } = args;
            requireAuth(ctx);
            return repository.update(ct.slug, id, input);
        };
        resolvers['Mutation'][`delete${typeName}`] = async (_parent, args, ctx) => {
            const { id } = args;
            requireAuth(ctx);
            await repository.delete(ct.slug, id);
            return true;
        };
        if (ct.settings.draftable) {
            resolvers['Mutation'][`publish${typeName}`] = async (_parent, args, ctx) => {
                const { id } = args;
                requireAuth(ctx);
                return repository.publish(ct.slug, id);
            };
            resolvers['Mutation'][`unpublish${typeName}`] = async (_parent, args, ctx) => {
                const { id } = args;
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
            if (field.type === 'PASSWORD')
                continue; // Never expose passwords
            resolvers[typeName][field.name] = (parent) => {
                const p = parent;
                const data = p['data'];
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
function requireAuth(ctx) {
    if (!ctx.user) {
        throw new GraphQLAuthError('Authentication required');
    }
}
/**
 * Throws a GraphQL-compatible error if the user does not have the required role.
 */
function requireRole(ctx, role) {
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
    extensions;
    constructor(message) {
        super(message);
        this.name = 'GraphQLAuthError';
        this.extensions = { code: 'UNAUTHORIZED' };
    }
}
/**
 * A GraphQL error representing a "not found" condition.
 */
export class GraphQLNotFoundError extends Error {
    extensions;
    constructor(message) {
        super(message);
        this.name = 'GraphQLNotFoundError';
        this.extensions = { code: 'NOT_FOUND' };
    }
}
//# sourceMappingURL=resolvers.js.map