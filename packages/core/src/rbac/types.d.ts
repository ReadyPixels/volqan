/**
 * @file rbac/types.ts
 * @description Type definitions for the Volqan role-based access control system.
 */
/**
 * Available user roles in ascending privilege order.
 *
 * - VIEWER: read-only access to published content
 * - EDITOR: create, edit, and publish content; manage own media
 * - ADMIN: full content and media management; limited settings access
 * - SUPER_ADMIN: unrestricted access to everything including system settings
 *
 * Must stay in sync with the UserRole enum in prisma/schema.prisma.
 */
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';
/**
 * All protected resource types in the Volqan system.
 */
export type Resource = 'users' | 'content' | 'media' | 'extensions' | 'themes' | 'settings' | 'api-keys' | 'audit-logs' | 'installations';
/**
 * CRUD-style actions that can be performed on a resource.
 *
 * - `create` — create a new resource instance
 * - `read` — view/list resource instances
 * - `update` — modify an existing resource instance
 * - `delete` — remove a resource instance
 * - `publish` — transition content to PUBLISHED status
 * - `manage` — shorthand for full CRUD + all special actions
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'manage';
/**
 * A permission is a combination of a resource and an allowed action.
 *
 * @example
 * ```ts
 * const permission: Permission = { resource: 'content', action: 'publish' };
 * ```
 */
export interface Permission {
    resource: Resource;
    action: Action;
}
/**
 * Compact string representation of a permission in `"resource:action"` format.
 *
 * @example
 * ```ts
 * const ra: ResourceAction = 'content:publish';
 * ```
 */
export type ResourceAction = `${Resource}:${Action}`;
/**
 * Minimal user shape required by the RBAC guard.
 * Matches the shape of {@link AuthUser} from the auth module.
 */
export interface RbacUser {
    id: string;
    role: Role;
}
/**
 * Defines the permissions granted to a single role.
 *
 * A `true` value for an action means all instances of that resource are allowed.
 * An `'own'` value means only resources owned/created by the user are allowed.
 *
 * Special value `'*'` on the `manage` action implies full access to the resource.
 */
export type ResourcePermissions = {
    [K in Action]?: boolean | 'own';
};
/**
 * Full permission matrix shape: maps each resource to its allowed actions per role.
 */
export type PermissionMatrix = Record<Role, Record<Resource, ResourcePermissions>>;
//# sourceMappingURL=types.d.ts.map