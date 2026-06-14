/**
 * @file api/graphql/types.ts
 * @description Type definitions for the Volqan GraphQL API layer.
 *
 * Provides types used by the schema generator, resolver builder, and
 * GraphQL execution context.
 */
/**
 * The GraphQL execution context injected into every resolver.
 * Provides the authenticated user, request object, and Volqan services.
 */
export interface GraphQLContext {
    /** Authenticated user info, or null for unauthenticated requests. */
    user: {
        id: string;
        email: string;
        role: string;
    } | null;
    /** The raw HTTP request (Next.js NextRequest or standard Request). */
    request: Request;
    /** Optional request start time for performance tracking. */
    requestStartedAt?: Date;
}
/**
 * SDL type block produced for a single ContentType.
 */
export interface GeneratedTypeBlock {
    /** The `type Foo { ... }` definition. */
    objectType: string;
    /** The `input CreateFooInput { ... }` definition. */
    createInput: string;
    /** The `input UpdateFooInput { ... }` definition. */
    updateInput: string;
    /** The `input FooFilterInput { ... }` definition. */
    filterInput: string;
    /** The `type FooList { ... }` paginated list type. */
    listType: string;
}
/**
 * Generated query definitions for a content type.
 */
export interface GeneratedQueryBlock {
    /** `listFoo(filter: FooFilterInput, page: Int, perPage: Int, sort: String): FooList!` */
    listQuery: string;
    /** `getFoo(id: ID!): Foo` */
    getQuery: string;
    /** `getFooBySlug(slug: String!): Foo` */
    getBySlugQuery: string;
}
/**
 * Generated mutation definitions for a content type.
 */
export interface GeneratedMutationBlock {
    /** `createFoo(input: CreateFooInput!): Foo!` */
    createMutation: string;
    /** `updateFoo(id: ID!, input: UpdateFooInput!): Foo!` */
    updateMutation: string;
    /** `deleteFoo(id: ID!): Boolean!` */
    deleteMutation: string;
    /** `publishFoo(id: ID!): Foo!` */
    publishMutation: string;
    /** `unpublishFoo(id: ID!): Foo!` */
    unpublishMutation: string;
}
/** Generic resolver function type. */
export type Resolver<TArgs = Record<string, unknown>, TResult = unknown> = (parent: unknown, args: TArgs, context: GraphQLContext) => Promise<TResult> | TResult;
/** Resolver map: { [typeName]: { [fieldName]: Resolver } } */
export type ResolverMap = Record<string, Record<string, Resolver>>;
/** Args shared by all list queries. */
export interface ListQueryArgs {
    filter?: Record<string, unknown>;
    page?: number;
    perPage?: number;
    sort?: string;
    fields?: string;
}
export interface LoginArgs {
    email: string;
    password: string;
}
export interface RegisterArgs {
    name: string;
    email: string;
    password: string;
}
export interface AuthPayload {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}
//# sourceMappingURL=types.d.ts.map