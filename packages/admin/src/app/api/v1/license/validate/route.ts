import type { NextRequest } from 'next/server';
import { json, badRequest } from '@/lib/api-helpers';
import { validateLicenseKey } from '@/lib/license';

/** Public endpoint — no auth required. Used by extensions to verify their license. */
export async function POST(request: NextRequest): Promise<Response> {
  let body: { key?: string; installId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.key || typeof body.key !== 'string') {
    return badRequest('key is required.');
  }

  const result = validateLicenseKey(body.key);

  if (!result) {
    return json({ valid: false, reason: 'invalid_key' }, 200);
  }

  if (body.installId && result.installId !== body.installId) {
    return json({ valid: false, reason: 'install_mismatch' }, 200);
  }

  if (result.expired) {
    return json({ valid: false, reason: 'expired', expiresAt: result.expiresAt.toISOString() }, 200);
  }

  return json({
    valid: true,
    productId: result.productId,
    installId: result.installId,
    expiresAt: result.expiresAt.toISOString(),
  });
}

/** Also support GET with ?key= for simple integrations */
export async function GET(request: NextRequest): Promise<Response> {
  const key = request.nextUrl.searchParams.get('key');
  if (!key) return badRequest('key query parameter is required.');

  const result = validateLicenseKey(key);
  if (!result) return json({ valid: false, reason: 'invalid_key' });
  if (result.expired) return json({ valid: false, reason: 'expired', expiresAt: result.expiresAt.toISOString() });

  return json({
    valid: true,
    productId: result.productId,
    installId: result.installId,
    expiresAt: result.expiresAt.toISOString(),
  });
}
