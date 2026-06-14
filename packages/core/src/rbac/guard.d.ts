/**
 * @file rbac/guard.ts
 * @description Permission checking guards for the Volqan RBAC system.
 *
 * Provides three complementary APIs:
 * - {@link can} — boolean check (non-throwing)
 * - {@link assertCan} — throws an AuthError if the check fails
 * - {@link withPermission} — HOF/wrapper for Next.js App Router handlers
 *
 * @example
 * ```ts
 * import { can, assertCan, withPermission } from '@volqan/core/rbac';
 *
 * // Boolean check
 * if (can(user, 'content', 'publish')) {
 *   await publishEntry(entryId);
 * }
 *
 * // Throwing check
 * assertCan(user, 'settings', 'update');
 *
 * // Ownership check
 * can(user, 'content', 'delete', { ownerId: entry.authorId });
 *
 * // HOF wrapper
 * export const DELETE = withPermission('content', 'delete', async (req, { user }) => {
 *   // user is guaranteed to have content:delete permission
 * });
 * ```
 */
import type { Action, Resource, RbacUser, ResourceAction } from './types.js';
import type { NextRequest } from 'next/server';
import type { ResolvedAuth } from '../auth/middleware.js';
/**
 * Optional context for ownership-scoped permission checks.
 * If the permission is `'own'`, the check passes only when `ownerId === userId`.
 */
export interface OwnershipContext {
    /** The ID of the user who owns/created the resource */
    ownerId: string | null | undefined;
}
/**
 * Checks whether a user has permission to perform an action on a resource.
 *
 * @param user - The user to check (must have `id` and `role`)
 * @param resource - The resource type (e.g. `'content'`)
 * @param action - The action to check (e.g. `'publish'`)
 * @param ownership - Optional ownership context for `'own'`-scoped permissions
 * @returns `true` if allowed, `false` otherwise
 *
 * @example
 * ```ts
 * // Full access check
 * can(user, 'media', 'delete')
 *
 * // Ownership-scoped check
 * can(user, 'content', 'update', { ownerId: entry.authorId })
 * ```
 */
export declare function can(user: RbacUser, resource: Resource, action: Action, ownership?: OwnershipContext): boolean;
/**
 * Asserts that a user has permission to perform an action.
 * Throws an {@link AuthError} with code `INSUFFICIENT_PERMISSIONS` (HTTP 403)
 * if the check fails.
 *
 * @param user - The user to check
 * @param resource - The resource type
 * @param action - The action to check
 * @param ownership - Optional ownership context
 * @throws {@link AuthError} if permission is denied
 *
 * @example
 * ```ts
 * assertCan(user, 'users', 'delete');
 * await deleteUser(userId);
 * ```
 */
export declare function assertCan(user: RbacUser, resource: Resource, action: Action, ownership?: OwnershipContext): void;
/**
 * Returns true if the user has ANY of the given permissions.
 *
 * @param user - The user to check
 * @param permissions - Array of `ResourceAction` strings
 * @param ownership - Optional ownership context applied to all checks
 */
export declare function canAny(user: RbacUser, permissions: ResourceAction[], ownership?: OwnershipContext): boolean;
/**
 * Returns true if the user has ALL of the given permissions.
 *
 * @param user - The user to check
 * @param permissions - Array of `ResourceAction` strings
 * @param ownership - Optional ownership context applied to all checks
 */
export declare function canAll(user: RbacUser, permissions: ResourceAction[], ownership?: OwnershipContext): boolean;
type AppRouteHandler = (request: NextRequest, auth: ResolvedAuth) => Promise<Response>;
/**
 * Higher-order function that wraps a Next.js App Router handler with a
 * permission check. Returns 401/403 JSON responses on failure.
 *
 * @param resource - The resource to protect
 * @param action - The required action
 * @param handler - The route handler function
 * @param getOwnership - Optional function to resolve ownership context from
 *                       the request (e.g. extract `authorId` from DB)
 *
 * @example
 * ```ts
 * // app/api/content/[id]/route.ts
 * export const DELETE = withPermission(
 *   'content', 'delete',
 *   async (request, { user }) => {
 *     await deleteEntry(params.id);
 *     return Response.json({ ok: true });
 *   },
 *   async (request, user) => {
 *     const entry = await db.contentEntry.findUnique({ where: { id: params.id } });
 *     return { ownerId: entry?.authorId };
 *   },
 * );
 * ```
 */
export declare function withPermission(resource: Resource, action: Action, handler: AppRouteHandler, getOwnership?: (request: NextRequest, user: RbacUser) => Promise<OwnershipContext>): (request: NextRequest) => Promise<Response>;
/**
 * Returns a summary of what a user can do, as a flat list of `ResourceAction` strings.
 * Useful for client-side capability rendering (e.g. show/hide buttons).
 *
 * @param user - The user to summarise
 * @returns Array of `ResourceAction` strings the user is allowed to perform
 */
export declare function getUserCapabilities(user: RbacUser): ResourceAction[];
export {};
//# sourceMappingURL=guard.d.ts.map