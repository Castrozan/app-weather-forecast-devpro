import { appConfig } from '@/config/appConfig';
import type { TemperatureUnit, WeatherResponse } from '@/features/weather/types';
import { createInMemoryTtlCache } from '@/shared/infrastructure/cache/inMemoryCache';
import { aggregateForecastByDay } from '@/features/weather/forecast/aggregateForecastByDay';
import type { WeatherLocationHint } from '@/features/weather/providers/weatherProviderPort';
import { getWeatherProvider } from '@/features/weather/providers/resolveWeatherProvider';

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  timeZone: 'UTC',
});

const resolveLocalTodayDateKey = (timezoneOffsetSeconds: number): string => {
  const nowUtcMilliseconds = Date.now();
  const localMilliseconds = nowUtcMilliseconds + timezoneOffsetSeconds * 1000;
  return new Date(localMilliseconds).toISOString().slice(0, 10);
};

const mapDateToForecastLabel = (date: string, todayDateKey: string): string => {
  if (date === todayDateKey) {
    return 'Today';
  }
  return weekdayFormatter.format(new Date(`${date}T00:00:00Z`));
};

const weatherCache = createInMemoryTtlCache<WeatherResponse>();

const weatherCacheKey = (lat: number, lon: number, units: TemperatureUnit): string => {
  return `${lat}:${lon}:${units}`;
};

const applyLocationHintToResponse = (
  response: WeatherResponse,
  locationHint: WeatherLocationHint | undefined,
): WeatherResponse => {
  if (!locationHint) {
    return response;
  }

  const hintedName = locationHint.name?.trim() || response.location.name;
  const hintedCountry = locationHint.country?.trim() || response.location.country;

  if (hintedName === response.location.name && hintedCountry === response.location.country) {
    return response;
  }

  return {
    ...response,
    location: {
      ...response.location,
      name: hintedName,
      country: hintedCountry,
    },
  };
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
  const key = weatherCacheKey(lat, lon, units);

  if (cacheTtlSeconds > 0) {
    const cached = weatherCache.get(key);
    if (cached) {
      return applyLocationHintToResponse(cached, locationHint);
    }
  }

  const provider = getWeatherProvider();
  const weatherData = await provider.fetchWeatherByCoordinates({
    lat,
    lon,
    units,
  });

  const todayDateKey = resolveLocalTodayDateKey(weatherData.timezoneOffsetSeconds);
  const daily = aggregateForecastByDay(
    weatherData.forecastEntries,
    weatherData.timezoneOffsetSeconds,
    5,
  ).map((day) => ({
    ...day,
    label: mapDateToForecastLabel(day.date, todayDateKey),
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

  return applyLocationHintToResponse(response, locationHint);
};
