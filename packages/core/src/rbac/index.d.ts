/**
 * @file rbac/index.ts
 * @description Barrel export for the Volqan RBAC system.
 *
 * @example
 * ```ts
 * import { can, assertCan, withPermission, PERMISSION_MATRIX } from '@volqan/core/rbac';
 * ```
 */
export type { Role, Resource, Action, Permission, ResourceAction, RbacUser, ResourcePermissions, PermissionMatrix, } from './types.js';
export { PERMISSION_MATRIX, getPermission, getRolePermissions, parseResourceAction, } from './permissions.js';
export { can, assertCan, canAny, canAll, withPermission, getUserCapabilities, } from './guard.js';
export type { OwnershipContext } from './guard.js';
//# sourceMappingURL=index.d.ts.map