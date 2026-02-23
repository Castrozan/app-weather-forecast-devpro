import { z } from 'zod';

import { CITY_SEARCH_RESULTS_LIMIT } from '@/config/appConfig';
import {
  WeatherProviderConfigurationError,
  WeatherProviderUpstreamError,
} from '@/features/weather/providers/weatherProviderErrors';
import type {
  FetchWeatherByCoordinatesInput,
  WeatherProviderCity,
  WeatherProviderForecastEntry,
  WeatherProviderPort,
  WeatherProviderWeather,
} from '@/features/weather/providers/weatherProviderPort';

const PROVIDER_NAME = 'open-weather';
const OPEN_WEATHER_API_BASE_URL = 'https://api.openweathermap.org';
const OPEN_WEATHER_GEO_BASE_URL = 'https://api.openweathermap.org';

const currentWeatherResponseSchema = z.object({
  coord: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  weather: z.array(
    z.object({
      description: z.string(),
      icon: z.string(),
    }),
  ),
  main: z.object({
    temp: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({
    speed: z.number(),
  }),
  timezone: z.number(),
  name: z.string(),
  sys: z.object({
    country: z.string(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
  dt: z.number(),
});

const forecastListItemSchema = z.object({
  dt: z.number(),
  main: z.object({
    temp: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
  }),
  weather: z.array(
    z.object({
      description: z.string(),
      icon: z.string(),
    }),
  ),
  sys: z.object({
    pod: z.enum(['d', 'n']),
  }),
});

const forecastResponseSchema = z.object({
  list: z.array(forecastListItemSchema),
  city: z.object({
    name: z.string(),
    country: z.string(),
    coord: z.object({
      lat: z.number(),
      lon: z.number(),
    }),
    timezone: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
});

const geocodingResponseSchema = z.array(
  z.object({
    name: z.string(),
    state: z.string().optional(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
  }),
);

const fetchJsonWithApiKey = async <T>(url: string, apiKey: string): Promise<T> => {
  const urlWithKey = new URL(url);
  urlWithKey.searchParams.set('appid', apiKey);

  const response = await fetch(urlWithKey.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new WeatherProviderUpstreamError(PROVIDER_NAME, response.status);
  }

  return (await response.json()) as T;
};

const toOpenWeatherUnitsParam = (units: FetchWeatherByCoordinatesInput['units']): string => {
  return units === 'imperial' ? 'imperial' : 'metric';
};

const normalizeForecastListToForecastEntries = (
  forecastList: z.infer<typeof forecastListItemSchema>[],
): WeatherProviderForecastEntry[] => {
  return forecastList.map((item) => {
    const primaryWeather = item.weather[0];
    const isDaylight = item.sys.pod === 'd';

    return {
      timestampSeconds: item.dt,
      minTemperature: item.main.temp_min,
      maxTemperature: item.main.temp_max,
      description: primaryWeather?.description ?? 'clear sky',
      icon: primaryWeather?.icon ?? (isDaylight ? '01d' : '01n'),
      isDaylight,
    };
  });
};

export const createOpenWeatherWeatherProvider = (apiKey: string): WeatherProviderPort => {
  if (!apiKey || !apiKey.trim()) {
    throw new WeatherProviderConfigurationError(PROVIDER_NAME, 'OpenWeather API key is required');
  }

  return {
    name: PROVIDER_NAME,

    async searchCities(query: string, limit: number): Promise<WeatherProviderCity[]> {
      const clampedLimit = Math.max(1, Math.min(limit, CITY_SEARCH_RESULTS_LIMIT));
      const search = new URLSearchParams({
        q: query,
        limit: String(clampedLimit),
      });

      const payload = await fetchJsonWithApiKey<unknown>(
        `${OPEN_WEATHER_GEO_BASE_URL}/geo/1.0/direct?${search}`,
        apiKey,
      );

      const parsed = geocodingResponseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new WeatherProviderUpstreamError(PROVIDER_NAME, 502);
      }

      return parsed.data.map((result) => ({
        name: result.name,
        state: result.state,
        country: result.country,
        lat: result.lat,
        lon: result.lon,
      }));
    },

    async fetchWeatherByCoordinates(
      input: FetchWeatherByCoordinatesInput,
    ): Promise<WeatherProviderWeather> {
      const unitsParam = toOpenWeatherUnitsParam(input.units);

      const currentSearch = new URLSearchParams({
        lat: String(input.lat),
        lon: String(input.lon),
        units: unitsParam,
      });

      const forecastSearch = new URLSearchParams({
        lat: String(input.lat),
        lon: String(input.lon),
        units: unitsParam,
        cnt: '40',
      });

      const [currentPayload, forecastPayload] = await Promise.all([
        fetchJsonWithApiKey<unknown>(
          `${OPEN_WEATHER_API_BASE_URL}/data/2.5/weather?${currentSearch}`,
          apiKey,
        ),
        fetchJsonWithApiKey<unknown>(
          `${OPEN_WEATHER_API_BASE_URL}/data/2.5/forecast?${forecastSearch}`,
          apiKey,
        ),
      ]);

      const parsedCurrent = currentWeatherResponseSchema.safeParse(currentPayload);
      const parsedForecast = forecastResponseSchema.safeParse(forecastPayload);

      if (!parsedCurrent.success) {
        throw new WeatherProviderUpstreamError(PROVIDER_NAME, 502);
      }

      if (!parsedForecast.success) {
        throw new WeatherProviderUpstreamError(PROVIDER_NAME, 502);
      }

      const current = parsedCurrent.data;
      const forecast = parsedForecast.data;

      const primaryWeather = current.weather[0];
      const forecastEntries = normalizeForecastListToForecastEntries(forecast.list);

      const hintedName = input.locationHint?.name?.trim() || current.name;
      const hintedCountry = input.locationHint?.country?.trim() || current.sys.country;

      return {
        location: {
          name: hintedName,
          country: hintedCountry,
          lat: current.coord.lat,
          lon: current.coord.lon,
        },
        timezoneOffsetSeconds: current.timezone,
        current: {
          temperature: current.main.temp,
          min: current.main.temp_min,
          max: current.main.temp_max,
          description: primaryWeather?.description ?? 'clear sky',
          icon: primaryWeather?.icon ?? '01d',
          humidity: current.main.humidity,
          windSpeed: current.wind.speed,
        },
        forecastEntries,
      };
    },
  };
};
