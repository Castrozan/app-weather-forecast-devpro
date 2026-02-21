import type { NextRequest } from 'next/server';

import { appConfig } from '@/lib/config';

import { APP_SESSION_COOKIE, isValidAccessToken } from './accessToken';
import { createInMemoryRateLimiter } from './rateLimiter';

const limiter = createInMemoryRateLimiter({
  windowMs: appConfig.rateLimitWindowMs,
  maxRequests: appConfig.rateLimitMaxRequests,
});

const getClientKey = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
};

export const verifyRateLimit = (request: NextRequest) => {
  return limiter.consume(getClientKey(request));
};

export const verifySession = (request: NextRequest): boolean => {
  if (!appConfig.appAccessToken) {
    return true;
  }

  const cookieValue = request.cookies.get(APP_SESSION_COOKIE)?.value ?? '';
  return isValidAccessToken(cookieValue, appConfig.appAccessToken);
};
