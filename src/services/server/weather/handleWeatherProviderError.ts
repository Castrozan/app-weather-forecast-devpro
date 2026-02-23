import { NextResponse } from 'next/server';

import {
  isWeatherProviderConfigurationError,
  isWeatherProviderUpstreamError,
} from '@/services/server/weather/errors';

export function handleWeatherProviderError(error: unknown, fallbackMessage: string): NextResponse {
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

  return NextResponse.json({ error: fallbackMessage }, { status: 502 });
}
