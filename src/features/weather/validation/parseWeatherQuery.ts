import { z } from 'zod';

import type { TemperatureUnit } from '@/features/weather/types';

const querySchema = z.object({
  lat: z.coerce.number().refine((value) => value >= -90 && value <= 90),
  lon: z.coerce.number().refine((value) => value >= -180 && value <= 180),
  units: z.enum(['metric', 'imperial']).default('metric'),
  city: z.string().trim().min(1).max(120).optional(),
  country: z.string().trim().min(1).max(120).optional(),
});

export type ParsedWeatherQuery = {
  lat: number;
  lon: number;
  units: TemperatureUnit;
  city?: string;
  country?: string;
};

const toOptionalString = (value: string | null): string | undefined => {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const parseWeatherQuery = (searchParams: URLSearchParams): ParsedWeatherQuery => {
  const raw = {
    lat: searchParams.get('lat') ?? '',
    lon: searchParams.get('lon') ?? '',
    units: (searchParams.get('units') ?? 'metric').toLowerCase(),
    city: toOptionalString(searchParams.get('city')),
    country: toOptionalString(searchParams.get('country')),
  };

  const result = querySchema.safeParse(raw);

  if (!result.success) {
    throw new Error('Invalid weather query parameters');
  }

  return result.data;
};
