import type { WeatherAppState } from '@/hooks/useWeatherApp';
import type { WeatherResponse } from '@/types/weather';

export type WeatherDashboardViewModel = {
  shouldShowSkeleton: boolean;
  weatherContentKey: string;
  weatherData: WeatherResponse | null;
  controlsDisabled: boolean;
};

const resolveWeatherContentKey = (weather: WeatherResponse): string => {
  return `${weather.location.lat},${weather.location.lon}`;
};

const resolveShouldShowSkeleton = (
  app: Pick<WeatherAppState, 'isLoadingWeather' | 'isSearching' | 'weather'>,
): boolean => {
  if (app.weather !== null) {
    return false;
  }

  return app.isLoadingWeather || app.isSearching;
};

export const buildWeatherDashboardViewModel = (app: WeatherAppState): WeatherDashboardViewModel => {
  const shouldShowSkeleton = resolveShouldShowSkeleton(app);

  return {
    shouldShowSkeleton,
    weatherContentKey: app.weather
      ? resolveWeatherContentKey(app.weather)
      : 'empty-weather-content',
    weatherData: app.weather,
    controlsDisabled: app.isSearching || app.isLoadingWeather,
  };
};
