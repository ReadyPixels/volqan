/**
 * @file rbac/permissions.ts
 * @description Permission matrix for the Volqan RBAC system.
 *
 * Defines what each role can do across all protected resources.
 *
 * Legend:
 * - `true`  — allowed for all instances of this resource
 * - `'own'` — allowed only for resources owned/authored by the requesting user
 * - `false` / omitted — not allowed
 *
 * The `manage` action is a superset that implies all other actions.
 *
 * Role hierarchy (ascending privilege):
 * VIEWER → EDITOR → ADMIN → SUPER_ADMIN
 */
import type { PermissionMatrix, Resource, Action, ResourceAction } from './types.js';
/**
 * The authoritative permission matrix for the Volqan system.
 *
 * Edit this object to adjust what each role can do.
 */
export declare const PERMISSION_MATRIX: PermissionMatrix;
/**
 * Checks whether a role has a specific permission.
 *
 * @param role - The user's role
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns `true` if allowed (all), `'own'` if only own resources, `false` if denied
 */
export declare function getPermission(role: keyof PermissionMatrix, resource: Resource, action: Action): boolean | 'own';
/**
 * Returns all resource-action pairs explicitly granted to a role.
 *
 * @param role - The role to inspect
 * @returns Array of `ResourceAction` strings granted to the role
 */
export declare function getRolePermissions(role: keyof PermissionMatrix): ResourceAction[];
/**
 * Parses a `ResourceAction` string into a `{ resource, action }` object.
 *
 * @param resourceAction - e.g. `"content:publish"`
 */
export declare function parseResourceAction(resourceAction: ResourceAction): {
    resource: Resource;
    action: Action;
};
//# sourceMappingURL=permissions.d.ts.map