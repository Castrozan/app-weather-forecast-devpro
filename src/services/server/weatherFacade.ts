import { appConfig } from '@/lib/config';
import type { TemperatureUnit, WeatherResponse } from '@/types/weather';
import { createInMemoryTtlCache } from '@/services/server/cache/inMemoryCache';
import { aggregateForecastByDay } from '@/services/server/forecast/aggregateForecastByDay';
import type { WeatherLocationHint } from '@/services/server/weather/ports/weatherProvider';
import { getWeatherProvider } from '@/services/server/weather/resolveWeatherProvider';

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  timeZone: 'UTC',
});

const mapDateToLabel = (date: string): string => {
  const weekday = weekdayFormatter.format(new Date(`${date}T00:00:00Z`));
  return weekday;
};

const weatherCache = createInMemoryTtlCache<WeatherResponse>();

const weatherCacheKey = (
  lat: number,
  lon: number,
  units: TemperatureUnit,
  locationHint?: WeatherLocationHint,
): string => {
  const normalizedName = locationHint?.name?.trim().toLowerCase() ?? '';
  const normalizedCountry = locationHint?.country?.trim().toLowerCase() ?? '';

  return `${lat}:${lon}:${units}:${normalizedName}:${normalizedCountry}`;
};

export const clearWeatherCache = (): void => {
  weatherCache.clear();
};

export const getWeatherByCoordinates = async (
  lat: number,
  lon: number,
  units: TemperatureUnit,
  locationHint?: WeatherLocationHint,
): Promise<WeatherResponse> => {
  const cacheTtlSeconds = appConfig.cacheTtlSeconds;
  const key = weatherCacheKey(lat, lon, units, locationHint);

  if (cacheTtlSeconds > 0) {
    const cached = weatherCache.get(key);
    if (cached) {
      return cached;
    }
  }

  const provider = getWeatherProvider();
  const weatherData = await provider.fetchWeatherByCoordinates({
    lat,
    lon,
    units,
    locationHint,
  });

  const daily = aggregateForecastByDay(
    weatherData.forecastEntries,
    weatherData.timezoneOffsetSeconds,
    5,
  ).map((day) => ({
    ...day,
    label: mapDateToLabel(day.date),
  }));

  const response: WeatherResponse = {
    location: weatherData.location,
    units,
    current: {
      temperature: Math.round(weatherData.current.temperature),
      min: Math.round(weatherData.current.min),
      max: Math.round(weatherData.current.max),
      description: weatherData.current.description,
      icon: weatherData.current.icon,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
    },
    forecastDaily: daily.map((day) => ({
      ...day,
      min: Math.round(day.min),
      max: Math.round(day.max),
    })),
  };

  if (cacheTtlSeconds > 0) {
    weatherCache.set(key, response, cacheTtlSeconds);
  }

  return response;
};
