import type { NextRequest } from 'next/server';
import { getSessionUser, json, unauthorized } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  return json({ user });
}
