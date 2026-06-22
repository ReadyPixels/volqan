import test from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore Node test runner resolves TypeScript sources directly.
import {
  canManageApiKeys,
  filterApiKeyPermissionsForRole,
  validateApiKeyPermissions,
} from './api-key-permissions.ts';

test('only admins can manage API keys', () => {
  assert.equal(canManageApiKeys('SUPER_ADMIN'), true);
  assert.equal(canManageApiKeys('ADMIN'), true);
  assert.equal(canManageApiKeys('EDITOR'), false);
  assert.equal(canManageApiKeys('VIEWER'), false);
});

test('non-admin users are restricted to basic API key permissions', () => {
  assert.deepEqual(
    filterApiKeyPermissionsForRole('EDITOR', ['read', 'users:write', 'media:write']),
    ['read'],
  );
});

test('admins retain allowed API key permissions', () => {
  assert.deepEqual(
    filterApiKeyPermissionsForRole('ADMIN', ['read', 'users:write', 'media:write']),
    ['read', 'users:write', 'media:write'],
  );
});

test('validation reports invalid and unauthorized permissions separately', () => {
  assert.deepEqual(
    validateApiKeyPermissions('EDITOR', ['read', 'users:write', 'root', 'media:write']),
    {
      invalid: ['root'],
      unauthorized: ['users:write', 'media:write'],
      granted: ['read'],
    },
  );
});
