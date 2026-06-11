import type { NextRequest } from 'next/server';
import { GoogleProvider, GitHubProvider, db, createSession, SESSION_COOKIE_NAME } from '@volqan/core';
import { json, badRequest } from '@/lib/api-helpers';

type Provider = 'google' | 'github';

function getProvider(name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/oauth/${name}/callback`;

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

// GET /api/auth/oauth/[provider] — redirect to provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<Response> {
  const { provider } = await params;
  const p = getProvider(provider);
  if (!p) {
    return json({ error: `OAuth provider "${provider}" is not configured.` }, 503);
  }

  const { url, state } = p.getAuthorizationUrl();

  const response = Response.redirect(url);
  // Store state in a short-lived cookie for CSRF verification on callback
  response.headers.set(
    'Set-Cookie',
    `oauth_state=${state}; Path=/api/auth/oauth; HttpOnly; SameSite=Lax; Max-Age=600`,
  );
  return response;
}
