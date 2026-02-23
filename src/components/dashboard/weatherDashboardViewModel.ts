import type { WeatherAppState } from '@/hooks/useWeatherApp';
import type { WeatherResponse } from '@/types/weather';

export type WeatherDashboardViewModel = {
  weatherContentKey: string;
  weatherData: WeatherResponse | null;
  controlsDisabled: boolean;
};

const resolveWeatherContentKey = (weather: WeatherResponse): string => {
  return `${weather.location.lat},${weather.location.lon}`;
};

export const buildWeatherDashboardViewModel = (app: WeatherAppState): WeatherDashboardViewModel => {
  return {
    weatherContentKey: app.weather
      ? resolveWeatherContentKey(app.weather)
      : 'empty-weather-content',
    weatherData: app.weather,
    controlsDisabled: app.isSearching || app.isLoadingWeather,
  };
};
