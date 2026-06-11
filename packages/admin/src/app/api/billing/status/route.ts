import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const installation = await db.installation.findFirst();

    if (!installation) {
      return json({
        data: {
          status: 'none',
          plan: 'community',
          licenseKey: null,
          domain: null,
        },
      });
    }

    return json({
      data: {
        status: installation.plan === 'community' ? 'none' : 'active',
        plan: installation.plan,
        licenseKey: installation.licenseKey ? '***' : null,
        domain: installation.domain,
      },
    });
  } catch (err) {
    console.error('[billing/status GET]', err);
    return internalError();
  }
}
