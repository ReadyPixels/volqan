import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  db,
  hashPassword,
  validatePasswordStrength,
  createSession,
  setSessionCookie,
} from '@volqan/core';
import { json, badRequest } from '@/lib/api-helpers';
import { checkContentLength } from '@/lib/body-limit';

interface InstallBody {
  name?: string;
  email?: string;
  password?: string;
  siteName?: string;
  locale?: 'en' | 'ar';
}

const DEFAULT_SETTINGS: Array<{ key: string; value: unknown; group: string; isPublic: boolean }> = [
  { key: 'site.description', value: '', group: 'general', isPublic: true },
  { key: 'site.url', value: 'http://localhost:3000', group: 'general', isPublic: true },
  { key: 'site.logo', value: null, group: 'general', isPublic: true },
  { key: 'auth.allowRegistration', value: false, group: 'auth', isPublic: false },
  { key: 'auth.requireEmailVerification', value: false, group: 'auth', isPublic: false },
  { key: 'media.maxFileSizeMb', value: 50, group: 'media', isPublic: false },
  { key: 'media.allowedMimeTypes', value: ['image/*', 'video/*', 'application/pdf'], group: 'media', isPublic: false },
];

/**
 * First-run installer: creates the initial Installation record, the first
 * SUPER_ADMIN user, and default settings, then logs the new admin in.
 *
 * Only runs once — if any user already exists, this route refuses to run
 * again so it can't be used to create a second unauthenticated admin.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

  const existingUserCount = await db.user.count();
  if (existingUserCount > 0) {
    return json({ error: 'This Volqan instance is already set up.' }, 409);
  }

  let body: InstallBody;
  try {
    body = (await request.json()) as InstallBody;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const { name, email, password, siteName, locale } = body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return badRequest('Email and password are required.');
  }

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return json({ error: strength.errors[0] ?? 'Password does not meet requirements.' }, 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedLocale = locale === 'ar' ? 'ar' : 'en';

  try {
    const hashedPassword = await hashPassword(password);

    const user = await db.$transaction(async (tx) => {
      const installationCount = await tx.installation.count();
      if (installationCount === 0) {
        await tx.installation.create({
          data: { installationId: randomUUID(), plan: 'community' },
        });
      }

      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name?.trim() || null,
          role: 'SUPER_ADMIN',
          emailVerified: new Date(),
        },
      });

      for (const setting of DEFAULT_SETTINGS) {
        await tx.setting.upsert({
          where: { key: setting.key },
          update: {},
          create: { ...setting, value: setting.value as never },
        });
      }
      await tx.setting.upsert({
        where: { key: 'site.name' },
        update: { value: siteName?.trim() || 'My Volqan Site' },
        create: { key: 'site.name', value: siteName?.trim() || 'My Volqan Site', group: 'general', isPublic: true },
      });
      await tx.setting.upsert({
        where: { key: 'site.locale' },
        update: { value: normalizedLocale },
        create: { key: 'site.locale', value: normalizedLocale, group: 'general', isPublic: true },
      });

      return createdUser;
    });

    const session = await createSession({
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    const response = json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    setSessionCookie(response, {
      token: session.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return response;
  } catch (err) {
    console.error('[install]', err);
    return json({ error: 'Setup failed. Check that the database is reachable and try again.' }, 500);
  }
}
