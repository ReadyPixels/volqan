type ApiKeyRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

const ALLOWED_PERMISSIONS = new Set([
  'read',
  'write',
  'media:read',
  'media:write',
  'users:read',
  'users:write',
]);

const ADMIN_ROLES = new Set<ApiKeyRole>(['ADMIN', 'SUPER_ADMIN']);
const BASIC_PERMISSIONS = new Set(['read']);

export function canManageApiKeys(role: ApiKeyRole): boolean {
  return ADMIN_ROLES.has(role);
}

export function filterApiKeyPermissionsForRole(
  role: ApiKeyRole,
  requestedPermissions: string[],
): string[] {
  const granted = canManageApiKeys(role)
    ? requestedPermissions.filter((permission) => ALLOWED_PERMISSIONS.has(permission))
    : requestedPermissions.filter((permission) => BASIC_PERMISSIONS.has(permission));

  return Array.from(new Set(granted));
}

export function validateApiKeyPermissions(
  role: ApiKeyRole,
  requestedPermissions: string[],
): {
  invalid: string[];
  unauthorized: string[];
  granted: string[];
} {
  const granted = filterApiKeyPermissionsForRole(role, requestedPermissions);
  const grantedSet = new Set(granted);
  const invalid: string[] = [];
  const unauthorized: string[] = [];

  for (const permission of requestedPermissions) {
    if (!ALLOWED_PERMISSIONS.has(permission)) {
      invalid.push(permission);
      continue;
    }

    if (!grantedSet.has(permission)) {
      unauthorized.push(permission);
    }
  }

  return {
    invalid: Array.from(new Set(invalid)),
    unauthorized: Array.from(new Set(unauthorized)),
    granted,
  };
}
