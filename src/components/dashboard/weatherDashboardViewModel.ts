import type { WeatherAppState } from '@/hooks/useWeatherApp';
import type { WeatherResponse } from '@/types/weather';

export type WeatherDashboardViewModel = {
  shouldShowSkeleton: boolean;
  shouldShowSkeletonAsOverlay: boolean;
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
  if (app.isLoadingWeather) {
    return true;
  }

  if (app.weather !== null) {
    return false;
  }

  return app.isSearching;
};

export const buildWeatherDashboardViewModel = (app: WeatherAppState): WeatherDashboardViewModel => {
  const shouldShowSkeleton = resolveShouldShowSkeleton(app);

  return {
    shouldShowSkeleton,
    shouldShowSkeletonAsOverlay: shouldShowSkeleton && app.weather !== null,
    weatherContentKey: app.weather
      ? resolveWeatherContentKey(app.weather)
      : 'empty-weather-content',
    weatherData: app.weather,
    controlsDisabled: app.isSearching || app.isLoadingWeather,
  };
};
