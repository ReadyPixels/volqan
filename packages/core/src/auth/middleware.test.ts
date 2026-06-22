import test from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore Node test runner resolves TypeScript sources directly.
import {
  clearSessionCookie,
  setSessionCookie,
  SESSION_COOKIE_NAME,
} from './middleware.ts';

test('setSessionCookie emits a Secure attribute in production', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const response = new Response(null);
    setSessionCookie(response, {
      token: 'session-token',
      expiresAt: new Date('2030-01-01T00:00:00Z'),
    });

    const header = response.headers.get('Set-Cookie');
    assert.ok(header?.includes(`${SESSION_COOKIE_NAME}=session-token`));
    assert.ok(header?.includes('HttpOnly'));
    assert.ok(header?.includes('SameSite=Lax'));
    assert.ok(header?.includes('Secure'));
    assert.ok(!header?.includes('Secure='));
  } finally {
    process.env.NODE_ENV = previous;
  }
});

test('clearSessionCookie also preserves the Secure attribute in production', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const response = new Response(null);
    clearSessionCookie(response);

    const header = response.headers.get('Set-Cookie');
    assert.ok(header?.includes(`${SESSION_COOKIE_NAME}=`));
    assert.ok(header?.includes('Max-Age=0') || header?.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'));
    assert.ok(header?.includes('HttpOnly'));
    assert.ok(header?.includes('SameSite=Lax'));
    assert.ok(header?.includes('Secure'));
    assert.ok(!header?.includes('Secure='));
  } finally {
    process.env.NODE_ENV = previous;
  }
});
