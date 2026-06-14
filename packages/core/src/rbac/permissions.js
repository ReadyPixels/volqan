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
// ---------------------------------------------------------------------------
// Permission matrix
// ---------------------------------------------------------------------------
/**
 * The authoritative permission matrix for the Volqan system.
 *
 * Edit this object to adjust what each role can do.
 */
export const PERMISSION_MATRIX = {
    // ─────────────────────────────────────────────────────────────────────────
    // SUPER_ADMIN — unrestricted access to everything
    // ─────────────────────────────────────────────────────────────────────────
    SUPER_ADMIN: {
        users: { manage: true, create: true, read: true, update: true, delete: true },
        content: { manage: true, create: true, read: true, update: true, delete: true, publish: true },
        media: { manage: true, create: true, read: true, update: true, delete: true },
        extensions: { manage: true, create: true, read: true, update: true, delete: true },
        themes: { manage: true, create: true, read: true, update: true, delete: true },
        settings: { manage: true, create: true, read: true, update: true, delete: true },
        'api-keys': { manage: true, create: true, read: true, update: true, delete: true },
        'audit-logs': { read: true },
        installations: { manage: true, read: true, update: true },
    },
    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — full content/media management; limited user & settings access
    // ─────────────────────────────────────────────────────────────────────────
    ADMIN: {
        users: { read: true, update: true }, // can view/edit users but not promote to SUPER_ADMIN
        content: { manage: true, create: true, read: true, update: true, delete: true, publish: true },
        media: { manage: true, create: true, read: true, update: true, delete: true },
        extensions: { read: true, update: true }, // can configure installed extensions
        themes: { read: true, update: true }, // can switch active theme
        settings: { read: true, update: true }, // can change non-system settings
        'api-keys': { create: true, read: true, delete: true }, // own API keys only (enforced by guard)
        'audit-logs': { read: true },
        installations: { read: true },
    },
    // ─────────────────────────────────────────────────────────────────────────
    // EDITOR — content creation/editing/publishing + own media management
    // ─────────────────────────────────────────────────────────────────────────
    EDITOR: {
        users: { read: true }, // can view user list (e.g. assign authors)
        content: { create: true, read: true, update: 'own', delete: 'own', publish: 'own' },
        media: { create: true, read: true, update: 'own', delete: 'own' },
        extensions: {}, // no access
        themes: {}, // no access
        settings: {}, // no access
        'api-keys': {}, // no access
        'audit-logs': {}, // no access
        installations: {}, // no access
    },
    // ─────────────────────────────────────────────────────────────────────────
    // VIEWER — read-only access to published content only
    // ─────────────────────────────────────────────────────────────────────────
    VIEWER: {
        users: {},
        content: { read: true },
        media: { read: true },
        extensions: {},
        themes: {},
        settings: {},
        'api-keys': {},
        'audit-logs': {},
        installations: {},
    },
};
// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------
/**
 * Checks whether a role has a specific permission.
 *
 * @param role - The user's role
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns `true` if allowed (all), `'own'` if only own resources, `false` if denied
 */
export function getPermission(role, resource, action) {
    const roleMatrix = PERMISSION_MATRIX[role];
    if (!roleMatrix)
        return false;
    const resourcePerms = roleMatrix[resource];
    if (!resourcePerms)
        return false;
    // `manage` implies all other actions
    if (resourcePerms.manage === true)
        return true;
    return resourcePerms[action] ?? false;
}
/**
 * Returns all resource-action pairs explicitly granted to a role.
 *
 * @param role - The role to inspect
 * @returns Array of `ResourceAction` strings granted to the role
 */
export function getRolePermissions(role) {
    const roleMatrix = PERMISSION_MATRIX[role];
    const granted = [];
    for (const [resource, perms] of Object.entries(roleMatrix)) {
        for (const [action, allowed] of Object.entries(perms)) {
            if (allowed) {
                granted.push(`${resource}:${action}`);
            }
        }
    }
    return granted;
}
/**
 * Parses a `ResourceAction` string into a `{ resource, action }` object.
 *
 * @param resourceAction - e.g. `"content:publish"`
 */
export function parseResourceAction(resourceAction) {
    const [resource, action] = resourceAction.split(':');
    return { resource, action };
}
//# sourceMappingURL=permissions.js.map