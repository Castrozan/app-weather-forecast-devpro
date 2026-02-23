import type { TemperatureUnit } from '@/features/weather/types';

const toInteger = (input: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(input ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toValidatedTemperatureUnit = (input: string | undefined): TemperatureUnit => {
  if (input === 'metric' || input === 'imperial') {
    return input;
  }
  return 'metric';
};

export const appConfig = {
  appAccessToken: process.env.APP_ACCESS_TOKEN ?? '',
  rateLimitWindowMs: toInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMaxRequests: toInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 60),
  cacheTtlSeconds: toInteger(process.env.CACHE_TTL_SECONDS, 300),
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? '',
};

export const clientConfig = {
  defaultTemperatureUnit: toValidatedTemperatureUnit(
    process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT,
  ),
};
