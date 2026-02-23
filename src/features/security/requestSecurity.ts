import type { NextRequest } from 'next/server';

import { appConfig } from '@/config/appConfig';

import { APP_SESSION_COOKIE, isValidAccessToken } from './accessToken';

export const verifySession = (request: NextRequest): boolean => {
  if (!appConfig.appAccessToken) {
    return true;
  }

  const cookieValue = request.cookies.get(APP_SESSION_COOKIE)?.value ?? '';
  return isValidAccessToken(cookieValue, appConfig.appAccessToken);
};
