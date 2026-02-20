import { appConfig } from '@/lib/config';
import type { TemperatureUnit } from '@/types/weather';

import type { OpenWeatherGeocodeEntry } from '@/services/server/cities/mapCityCandidates';
import type { OpenWeatherForecastEntry } from '@/services/server/forecast/aggregateForecastByDay';

type OpenWeatherCurrentResponse = {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  timezone: number;
  name: string;
  sys: {
    country: string;
  };
};

type OpenWeatherForecastResponse = {
  list: OpenWeatherForecastEntry[];
};

const OPEN_WEATHER_BASE_URL = 'https://api.openweathermap.org';

const ensureApiKey = (): string => {
  if (!appConfig.openWeatherApiKey) {
    throw new Error('Missing OPENWEATHER_API_KEY');
  }

  return appConfig.openWeatherApiKey;
};

const fetchJson = async <T>(path: string, params: Record<string, string>): Promise<T> => {
  const apiKey = ensureApiKey();
  const search = new URLSearchParams({ ...params, appid: apiKey });
  const url = `${OPEN_WEATHER_BASE_URL}${path}?${search.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`OpenWeather request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const fetchGeocodedCities = async (
  query: string,
  limit = 5,
): Promise<OpenWeatherGeocodeEntry[]> => {
  return fetchJson<OpenWeatherGeocodeEntry[]>('/geo/1.0/direct', {
    q: query,
    limit: String(limit),
  });
};

export const fetchCurrentWeather = async (
  lat: number,
  lon: number,
  units: TemperatureUnit,
): Promise<OpenWeatherCurrentResponse> => {
  return fetchJson<OpenWeatherCurrentResponse>('/data/2.5/weather', {
    lat: String(lat),
    lon: String(lon),
    units,
  });
};

export const fetchForecast = async (
  lat: number,
  lon: number,
  units: TemperatureUnit,
): Promise<OpenWeatherForecastResponse> => {
  return fetchJson<OpenWeatherForecastResponse>('/data/2.5/forecast', {
    lat: String(lat),
    lon: String(lon),
    units,
  });
};
