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
import { getPermission, getRolePermissions } from './permissions.js';
import { AuthError } from '../auth/types.js';
import { requireAuth, authErrorResponse } from '../auth/middleware.js';
// ---------------------------------------------------------------------------
// can()
// ---------------------------------------------------------------------------
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
export function can(user, resource, action, ownership) {
    const permission = getPermission(user.role, resource, action);
    if (permission === true)
        return true;
    if (permission === 'own') {
        // Ownership check — user must be the resource owner
        return ownership?.ownerId != null && ownership.ownerId === user.id;
    }
    return false;
}
// ---------------------------------------------------------------------------
// assertCan()
// ---------------------------------------------------------------------------
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
export function assertCan(user, resource, action, ownership) {
    if (!can(user, resource, action, ownership)) {
        throw new AuthError('INSUFFICIENT_PERMISSIONS', `Role "${user.role}" is not allowed to "${action}" on "${resource}".`, 403);
    }
}
// ---------------------------------------------------------------------------
// canAny() / canAll()
// ---------------------------------------------------------------------------
/**
 * Returns true if the user has ANY of the given permissions.
 *
 * @param user - The user to check
 * @param permissions - Array of `ResourceAction` strings
 * @param ownership - Optional ownership context applied to all checks
 */
export function canAny(user, permissions, ownership) {
    return permissions.some((ra) => {
        const [resource, action] = ra.split(':');
        return can(user, resource, action, ownership);
    });
}
/**
 * Returns true if the user has ALL of the given permissions.
 *
 * @param user - The user to check
 * @param permissions - Array of `ResourceAction` strings
 * @param ownership - Optional ownership context applied to all checks
 */
export function canAll(user, permissions, ownership) {
    return permissions.every((ra) => {
        const [resource, action] = ra.split(':');
        return can(user, resource, action, ownership);
    });
}
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
export function withPermission(resource, action, handler, getOwnership) {
    return async (request) => {
        try {
            const auth = await requireAuth(request);
            // Resolve ownership context if provided
            const ownership = getOwnership
                ? await getOwnership(request, auth.user)
                : undefined;
            assertCan(auth.user, resource, action, ownership);
            return handler(request, auth);
        }
        catch (err) {
            if (err instanceof AuthError) {
                return authErrorResponse(err);
            }
            throw err;
        }
    };
}
// ---------------------------------------------------------------------------
// Permission summary
// ---------------------------------------------------------------------------
/**
 * Returns a summary of what a user can do, as a flat list of `ResourceAction` strings.
 * Useful for client-side capability rendering (e.g. show/hide buttons).
 *
 * @param user - The user to summarise
 * @returns Array of `ResourceAction` strings the user is allowed to perform
 */
export function getUserCapabilities(user) {
    return getRolePermissions(user.role);
}
//# sourceMappingURL=guard.js.map