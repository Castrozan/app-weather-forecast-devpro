import { z } from 'zod';

import { FORECAST_DAYS, WEATHER_API_TIMEOUT_MILLISECONDS } from '@/config/appConfig';

const UPSTREAM_FETCH_TIMEOUT_MILLISECONDS = WEATHER_API_TIMEOUT_MILLISECONDS;
import { convertUnixTimestampToLocalDateKey } from '@/features/weather/forecast/timezoneConversion';
import { WeatherProviderUpstreamError } from '@/features/weather/providers/weatherProviderErrors';
import type {
  FetchWeatherByCoordinatesInput,
  WeatherProviderForecastEntry,
  WeatherProviderPort,
} from '@/features/weather/providers/weatherProviderPort';

import { mapWeatherCodeToVisual } from './weatherCodeMapper';

const PROVIDER_NAME = 'open-meteo';
const OPEN_METEO_GEO_BASE_URL = 'https://geocoding-api.open-meteo.com';
const OPEN_METEO_FORECAST_BASE_URL = 'https://api.open-meteo.com';

const geocodeResponseSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string(),
        admin1: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
});

const forecastResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    weather_code: z.number(),
    is_day: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number().nullable()),
    weather_code: z.array(z.number().nullable()),
    is_day: z.array(z.number().nullable()),
  }),
});

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(UPSTREAM_FETCH_TIMEOUT_MILLISECONDS),
  });

  if (!response.ok) {
    throw new WeatherProviderUpstreamError(PROVIDER_NAME, response.status);
  }

  return (await response.json()) as T;
};

const toTemperatureUnit = (
  units: FetchWeatherByCoordinatesInput['units'],
): 'celsius' | 'fahrenheit' => {
  return units === 'imperial' ? 'fahrenheit' : 'celsius';
};

const toWindSpeedUnit = (units: FetchWeatherByCoordinatesInput['units']): 'kmh' | 'mph' => {
  return units === 'imperial' ? 'mph' : 'kmh';
};

const parseLocalIsoToUnixSeconds = (localIso: string, utcOffsetSeconds: number): number => {
  const match = localIso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    throw new WeatherProviderUpstreamError(PROVIDER_NAME, 502);
  }

  const [, year, month, day, hour, minute, second = '0'] = match;
  const naiveUtcSeconds =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ) / 1000;

  return naiveUtcSeconds - utcOffsetSeconds;
};

const normalizeHourlyEntries = (
  hourly: z.infer<typeof forecastResponseSchema>['hourly'],
  timezoneOffsetSeconds: number,
): WeatherProviderForecastEntry[] => {
  const size = Math.min(
    hourly.time.length,
    hourly.temperature_2m.length,
    hourly.weather_code.length,
    hourly.is_day.length,
  );

  const entries: WeatherProviderForecastEntry[] = [];

  for (let index = 0; index < size; index += 1) {
    const time = hourly.time[index];
    const temperature = hourly.temperature_2m[index];
    const weatherCode = hourly.weather_code[index];
    const isDaylightValue = hourly.is_day[index];

    if (
      typeof time !== 'string' ||
      typeof temperature !== 'number' ||
      typeof weatherCode !== 'number' ||
      typeof isDaylightValue !== 'number'
    ) {
      continue;
    }

    const timestampSeconds = parseLocalIsoToUnixSeconds(time, timezoneOffsetSeconds);
    const isDaylight = isDaylightValue === 1;
    const visual = mapWeatherCodeToVisual(weatherCode, isDaylight);

    entries.push({
      timestampSeconds,
      minTemperature: temperature,
      maxTemperature: temperature,
      description: visual.description,
      icon: visual.icon,
      isDaylight,
    });
  }

  return entries;
};

const deriveCurrentMinMax = (
  currentTimestampSeconds: number,
  forecastEntries: WeatherProviderForecastEntry[],
  timezoneOffsetSeconds: number,
  fallbackTemperature: number,
): { min: number; max: number } => {
  const currentDateKey = convertUnixTimestampToLocalDateKey(
    currentTimestampSeconds,
    timezoneOffsetSeconds,
  );

  const sameDayEntries = forecastEntries.filter((entry) => {
    return (
      convertUnixTimestampToLocalDateKey(entry.timestampSeconds, timezoneOffsetSeconds) ===
      currentDateKey
    );
  });

  if (sameDayEntries.length === 0) {
    return {
      min: fallbackTemperature,
      max: fallbackTemperature,
    };
  }

  return sameDayEntries.reduce(
    (accumulator, entry) => ({
      min: Math.min(accumulator.min, entry.minTemperature),
      max: Math.max(accumulator.max, entry.maxTemperature),
    }),
    {
      min: sameDayEntries[0].minTemperature,
      max: sameDayEntries[0].maxTemperature,
    },
  );
};

const toFallbackLocationName = (lat: number, lon: number): string => {
  return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
};

const sanitizeLocationHint = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const createOpenMeteoWeatherProvider = (): WeatherProviderPort => {
  return {
    name: PROVIDER_NAME,

    async searchCities(query: string, limit: number) {
      const count = Math.max(1, Math.min(limit, 10));
      const search = new URLSearchParams({
        name: query,
        count: String(count),
        language: 'en',
        format: 'json',
      });

      const payload = await fetchJson<unknown>(`${OPEN_METEO_GEO_BASE_URL}/v1/search?${search}`);
      const parsed = geocodeResponseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new WeatherProviderUpstreamError(PROVIDER_NAME, 502);
      }

      return (parsed.data.results ?? []).map((result) => ({
        name: result.name,
        state: result.admin1,
        country: result.country,
        lat: result.latitude,
        lon: result.longitude,
      }));
    },

    async fetchWeatherByCoordinates(input: FetchWeatherByCoordinatesInput) {
      const search = new URLSearchParams({
        latitude: String(input.lat),
        longitude: String(input.lon),
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
        hourly: 'temperature_2m,weather_code,is_day',
        forecast_days: String(FORECAST_DAYS),
        temperature_unit: toTemperatureUnit(input.units),
        wind_speed_unit: toWindSpeedUnit(input.units),
        timezone: 'auto',
      });

      const payload = await fetchJson<unknown>(
        `${OPEN_METEO_FORECAST_BASE_URL}/v1/forecast?${search}`,
      );
      const parsed = forecastResponseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new WeatherProviderUpstreamError(PROVIDER_NAME, 502);
      }

      const data = parsed.data;
      const forecastEntries = normalizeHourlyEntries(data.hourly, data.utc_offset_seconds);
      const currentTimestampSeconds = parseLocalIsoToUnixSeconds(
        data.current.time,
        data.utc_offset_seconds,
      );
      const currentVisual = mapWeatherCodeToVisual(
        data.current.weather_code,
        data.current.is_day === 1,
      );
      const currentMinMax = deriveCurrentMinMax(
        currentTimestampSeconds,
        forecastEntries,
        data.utc_offset_seconds,
        data.current.temperature_2m,
      );

      const hintedName = sanitizeLocationHint(input.locationHint?.name);
      const hintedCountry = sanitizeLocationHint(input.locationHint?.country);

      return {
        location: {
          name: hintedName ?? toFallbackLocationName(data.latitude, data.longitude),
          country: hintedCountry ?? '--',
          lat: data.latitude,
          lon: data.longitude,
        },
        timezoneOffsetSeconds: data.utc_offset_seconds,
        current: {
          temperature: data.current.temperature_2m,
          min: currentMinMax.min,
          max: currentMinMax.max,
          description: currentVisual.description,
          icon: currentVisual.icon,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
        },
        forecastEntries,
      };
    },
  };
};
