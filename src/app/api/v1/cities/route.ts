import { NextRequest, NextResponse } from 'next/server';

import { searchCities } from '@/services/server/cities/searchCities';
import {
  isWeatherProviderConfigurationError,
  isWeatherProviderUpstreamError,
} from '@/services/server/weather/errors';
import { verifyRateLimit, verifySession } from '@/services/server/security/requestSecurity';

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

  const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  try {
    const cities = await searchCities(query);
    return NextResponse.json({ query, cities });
  } catch (error) {
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
      { error: 'Unable to resolve city search at this time.' },
      { status: 502 },
    );
  }
}
