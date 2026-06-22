import type { NextRequest } from 'next/server';
import { db, createSession, setSessionCookie } from '@volqan/core';
import { json } from '@/lib/api-helpers';

/**
 * SAML 2.0 Assertion Consumer Service (ACS).
 * The IdP POSTs a signed SAMLResponse here after authentication.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Expected form-encoded SAML response.' }, 400);
  }

  const samlResponse = formData.get('SAMLResponse');
  const relayState = (formData.get('RelayState') as string | null) ?? '/';

  if (!samlResponse || typeof samlResponse !== 'string') {
    return json({ error: 'Missing SAMLResponse.' }, 400);
  }

  try {
    const samlSetting = await db.setting.findUnique({ where: { key: 'sso.saml' } });
    if (!samlSetting) {
      return Response.redirect(new URL('/login?error=sso_not_configured', appUrl).toString(), 302);
    }

    const config = samlSetting.value as {
      entryPoint?: string;
      issuer?: string;
      cert?: string;
      callbackUrl?: string;
    };

    if (!config.entryPoint || !config.cert || !config.issuer) {
      return Response.redirect(new URL('/login?error=sso_misconfigured', appUrl).toString(), 302);
    }

    const { SAML } = await import('node-saml');
    const saml = new SAML({
      entryPoint: config.entryPoint,
      issuer: config.issuer,
      cert: config.cert,
      callbackUrl: config.callbackUrl ?? `${appUrl}/api/auth/sso/saml/acs`,
      wantAuthnResponseSigned: true,
    });

    const { profile } = await saml.validatePostResponse({ SAMLResponse: samlResponse });

    if (!profile?.nameID) {
      return Response.redirect(new URL('/login?error=sso_no_email', appUrl).toString(), 302);
    }

    const email = (profile.email as string | undefined) ?? profile.nameID;
    const name = (profile.displayName as string | undefined) ??
      ((profile.firstName && profile.lastName) ? `${profile.firstName} ${profile.lastName}` : undefined);

    // Find or create user
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      user = await db.user.create({
        data: { email, name: name ?? null, role: 'EDITOR', emailVerified: new Date() },
      });
    } else if (!user.emailVerified) {
      await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    }

    const session = await createSession({
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    const redirectUrl = relayState.startsWith('/') ? relayState : '/';
    const response = Response.redirect(new URL(redirectUrl, appUrl).toString(), 302);
    setSessionCookie(response, {
      token: session.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return response;
  } catch (err) {
    console.error('[sso/saml/acs]', err);
    return Response.redirect(new URL('/login?error=sso_failed', appUrl).toString(), 302);
  }
}
