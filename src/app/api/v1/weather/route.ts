import { NextRequest, NextResponse } from 'next/server';

import { getWeatherByCoordinates } from '@/services/server/weatherFacade';
import {
  isWeatherProviderConfigurationError,
  isWeatherProviderUpstreamError,
} from '@/services/server/weather/errors';
import { verifyRateLimit, verifySession } from '@/services/server/security/requestSecurity';

import { parseWeatherQuery } from './parseWeatherQuery';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rateLimit = verifyRateLimit(request);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests, please try again soon.' },
      {
        status: 429,
        headers: {
          'x-ratelimit-remaining': String(rateLimit.remaining),
          'x-ratelimit-reset': String(rateLimit.resetAt),
        },
      },
    );
  }

  if (!verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const query = parseWeatherQuery(request.nextUrl.searchParams);
    const locationHint = query.city ? { name: query.city, country: query.country } : undefined;
    const weather = await getWeatherByCoordinates(query.lat, query.lon, query.units, locationHint);

    return NextResponse.json(weather, {
      headers: {
        'x-ratelimit-remaining': String(rateLimit.remaining),
        'x-ratelimit-reset': String(rateLimit.resetAt),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid weather query parameters') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (isWeatherProviderConfigurationError(error)) {
      return NextResponse.json(
        { error: 'Weather provider is not configured on this server.' },
        { status: 503 },
      );
    }

    if (isWeatherProviderUpstreamError(error)) {
      return NextResponse.json(
        { error: 'Weather provider is temporarily unavailable.' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to load weather data at this time.' },
      { status: 502 },
    );
  }
}
