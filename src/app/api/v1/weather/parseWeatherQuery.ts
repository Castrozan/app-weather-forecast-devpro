import { z } from 'zod';

import type { TemperatureUnit } from '@/types/weather';

const querySchema = z.object({
  lat: z.coerce.number().refine((value) => value >= -90 && value <= 90),
  lon: z.coerce.number().refine((value) => value >= -180 && value <= 180),
  units: z.enum(['metric', 'imperial']).default('metric'),
});

export type ParsedWeatherQuery = {
  lat: number;
  lon: number;
  units: TemperatureUnit;
};

export const parseWeatherQuery = (searchParams: URLSearchParams): ParsedWeatherQuery => {
  const raw = {
    lat: searchParams.get('lat') ?? '',
    lon: searchParams.get('lon') ?? '',
    units: (searchParams.get('units') ?? 'metric').toLowerCase(),
  };

  const result = querySchema.safeParse(raw);

  if (!result.success) {
    throw new Error('Invalid weather query parameters');
  }

  return result.data;
};
