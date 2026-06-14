import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '../../../../../../lib/api-helpers';

/**
 * Test LDAP/Active Directory connectivity.
 * Requires `ldapts` package: `pnpm add ldapts --filter @volqan/admin`
 */
export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN') return json({ error: 'Forbidden' }, 403);

  try {
    const ldapSetting = await db.setting.findUnique({ where: { key: 'sso.ldap' } });
    if (!ldapSetting) return json({ error: 'LDAP not configured.' }, 404);

    const config = ldapSetting.value as {
      url?: string;
      bindDN?: string;
      bindPassword?: string;
      baseDN?: string;
    };

    if (!config.url || !config.bindDN || !config.bindPassword) {
      return json({ error: 'LDAP config is incomplete (url, bindDN, bindPassword required).' }, 400);
    }

    const { Client } = await import('ldapts');
    const client = new Client({ url: config.url, connectTimeout: 5000 });
    await client.bind(config.bindDN, config.bindPassword);
    await client.unbind();

    return json({ ok: true, message: 'LDAP bind succeeded.' });
  } catch (err) {
    console.error('[sso/ldap/test]', err);
    return internalError();
  }
}
