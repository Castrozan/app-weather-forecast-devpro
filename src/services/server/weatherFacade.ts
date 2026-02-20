import { appConfig } from '@/lib/config';
import type { TemperatureUnit, WeatherResponse } from '@/types/weather';
import { createInMemoryTtlCache } from '@/services/server/cache/inMemoryCache';
import { aggregateForecastByDay } from '@/services/server/forecast/aggregateForecastByDay';
import {
  fetchCurrentWeather,
  fetchForecast,
} from '@/services/server/openweather/openWeatherClient';

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  timeZone: 'UTC',
});

const mapDateToLabel = (date: string): string => {
  const weekday = weekdayFormatter.format(new Date(`${date}T00:00:00Z`));
  return weekday;
};

const weatherCache = createInMemoryTtlCache<WeatherResponse>();

const weatherCacheKey = (lat: number, lon: number, units: TemperatureUnit): string => {
  return `${lat}:${lon}:${units}`;
};

export const clearWeatherCache = (): void => {
  weatherCache.clear();
};

export const getWeatherByCoordinates = async (
  lat: number,
  lon: number,
  units: TemperatureUnit,
): Promise<WeatherResponse> => {
  const cacheTtlSeconds = appConfig.cacheTtlSeconds;
  const key = weatherCacheKey(lat, lon, units);

  if (cacheTtlSeconds > 0) {
    const cached = weatherCache.get(key);
    if (cached) {
      return cached;
    }
  }

  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(lat, lon, units),
    fetchForecast(lat, lon, units),
  ]);

  const daily = aggregateForecastByDay(forecast.list, current.timezone, 5).map((day) => ({
    ...day,
    label: mapDateToLabel(day.date),
  }));

  const currentWeather = current.weather[0] ?? {
    description: 'clear sky',
    icon: '01d',
  };

  const response: WeatherResponse = {
    location: {
      name: current.name,
      country: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon,
    },
    units,
    current: {
      temperature: Math.round(current.main.temp),
      min: Math.round(current.main.temp_min),
      max: Math.round(current.main.temp_max),
      description: currentWeather.description,
      icon: currentWeather.icon,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
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
