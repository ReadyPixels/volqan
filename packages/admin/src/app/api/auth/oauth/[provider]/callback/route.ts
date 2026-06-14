import type { NextRequest } from 'next/server';
import {
  GoogleProvider,
  GitHubProvider,
  db,
  createSession,
  SESSION_COOKIE_NAME,
} from '@volqan/core';
import { json } from '@/lib/api-helpers';

function getProvider(name: string, redirectUri: string) {
  if (name === 'google') {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return null;
    return new GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    });
  }
  if (name === 'github') {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) return null;
    return new GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectUri,
    });
  }
  return null;
}

// GET /api/auth/oauth/[provider]/callback — OAuth code exchange
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<Response> {
  const { provider } = await params;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (error) {
    return Response.redirect(`${appUrl}/login?error=oauth_denied`);
  }

  if (!code) {
    return Response.redirect(`${appUrl}/login?error=oauth_missing_code`);
  }

  // Verify CSRF state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return Response.redirect(`${appUrl}/login?error=oauth_state_mismatch`);
  }

  const redirectUri = `${appUrl}/api/auth/oauth/${provider}/callback`;
  const p = getProvider(provider, redirectUri);
  if (!p) {
    return Response.redirect(`${appUrl}/login?error=oauth_not_configured`);
  }

  try {
    const profile = await p.exchangeCode(code);

    // Find existing account link
    let account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: provider.toLowerCase() as 'google' | 'github',
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });

    let userId: string;

    if (account) {
      // Update tokens
      await db.account.update({
        where: { id: account.id },
        data: {
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken ?? undefined,
          expiresAt: profile.expiresAt ? new Date(profile.expiresAt * 1000) : null,
        },
      });
      userId = account.userId;
    } else {
      // Find or create user by email
      let user = await db.user.findUnique({ where: { email: profile.email } });
      if (!user) {
        user = await db.user.create({
          data: {
            email: profile.email,
            name: profile.name ?? null,
            avatar: profile.avatar ?? null,
            role: 'VIEWER',
            emailVerified: new Date(),
          },
        });
      }
      // Link account
      await db.account.create({
        data: {
          userId: user.id,
          provider: provider.toLowerCase() as 'google' | 'github',
          providerAccountId: profile.providerAccountId,
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken ?? null,
          expiresAt: profile.expiresAt ? new Date(profile.expiresAt * 1000) : null,
        },
      });
      userId = user.id;
    }

    const session = await createSession({
      userId,
      ipAddress:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    const securePart = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const response = Response.redirect(`${appUrl}/`);
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${securePart}`,
    );
    // Clear the OAuth state cookie
    response.headers.append(
      'Set-Cookie',
      'oauth_state=; Path=/api/auth/oauth; HttpOnly; Max-Age=0',
    );

    return response;
  } catch (err) {
    console.error(`[oauth/${provider}/callback]`, err);
    return Response.redirect(`${appUrl}/login?error=oauth_failed`);
  }
}
