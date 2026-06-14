/**
 * @file rbac/index.ts
 * @description Barrel export for the Volqan RBAC system.
 *
 * @example
 * ```ts
 * import { can, assertCan, withPermission, PERMISSION_MATRIX } from '@volqan/core/rbac';
 * ```
 */
// Permission matrix and helpers
export { PERMISSION_MATRIX, getPermission, getRolePermissions, parseResourceAction, } from './permissions.js';
// Guard functions
export { can, assertCan, canAny, canAll, withPermission, getUserCapabilities, } from './guard.js';
//# sourceMappingURL=index.js.map