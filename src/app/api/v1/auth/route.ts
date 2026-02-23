import { NextRequest, NextResponse } from 'next/server';

import { appConfig } from '@/config/appConfig';
import { APP_SESSION_COOKIE, isValidAccessToken } from '@/features/security/accessToken';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { token?: string };
  const token = body.token?.trim() ?? '';

  if (!appConfig.appAccessToken) {
    return NextResponse.json({ ok: true, mode: 'disabled' });
  }

  if (!isValidAccessToken(token, appConfig.appAccessToken)) {
    return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(APP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
