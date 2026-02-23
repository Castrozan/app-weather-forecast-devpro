import { NextRequest, NextResponse } from 'next/server';

import { getWeatherByCoordinates } from '@/features/weather/weatherFacade';
import { handleWeatherProviderError } from '@/features/weather/providers/handleWeatherProviderError';
import { verifySession } from '@/features/security/requestSecurity';

import { parseWeatherQuery } from '@/features/weather/validation/parseWeatherQuery';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const query = parseWeatherQuery(request.nextUrl.searchParams);
    const locationHint = query.city ? { name: query.city, country: query.country } : undefined;
    const weather = await getWeatherByCoordinates(query.lat, query.lon, query.units, locationHint);

    return NextResponse.json(weather);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid weather query parameters') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleWeatherProviderError(error, 'Unable to load weather data at this time.');
  }
}
