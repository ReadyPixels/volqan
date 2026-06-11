import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

/**
 * SSO configuration endpoints.
 * Supports SAML 2.0 and LDAP/Active Directory providers.
 *
 * GET  /api/auth/sso          — return current SSO config (admin only, secrets redacted)
 * POST /api/auth/sso          — save SSO config
 * POST /api/auth/sso/saml/acs — SAML Assertion Consumer Service (public, handles IdP POST)
 * POST /api/auth/sso/ldap/test — test LDAP connection (admin only)
 */

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN') return json({ error: 'Forbidden' }, 403);

  try {
    const [samlSetting, ldapSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: 'sso.saml' } }),
      db.setting.findUnique({ where: { key: 'sso.ldap' } }),
    ]);

    return json({
      data: {
        saml: samlSetting ? redactSecrets(samlSetting.value as Record<string, unknown>) : null,
        ldap: ldapSetting ? redactSecrets(ldapSetting.value as Record<string, unknown>) : null,
      },
    });
  } catch (err) {
    console.error('[sso GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN') return json({ error: 'Forbidden' }, 403);

  let body: { type: 'saml' | 'ldap'; config: Record<string, unknown> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.type || !['saml', 'ldap'].includes(body.type)) {
    return badRequest('type must be "saml" or "ldap".');
  }

  const key = `sso.${body.type}`;

  try {
    await db.setting.upsert({
      where: { key },
      create: { key, value: body.config, group: 'sso', isPublic: false },
      update: { value: body.config },
    });
    return json({ ok: true });
  } catch (err) {
    console.error('[sso POST]', err);
    return internalError();
  }
}

function redactSecrets(config: Record<string, unknown>): Record<string, unknown> {
  const REDACTED = '[REDACTED]';
  const secretFields = ['privateKey', 'clientSecret', 'password', 'bindPassword', 'secret'];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    out[k] = secretFields.some((f) => k.toLowerCase().includes(f.toLowerCase())) ? REDACTED : v;
  }
  return out;
}
