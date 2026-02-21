import {
  isErrorStatusMessage,
  isSearchStatusMessage,
  isTransientStatusMessage,
} from '@/lib/statusMessage';
import type { StatusMessage } from '@/lib/statusMessage';
import type { WeatherAppState } from '@/hooks/useWeatherApp';
import type { WeatherResponse } from '@/types/weather';

export type WeatherDashboardViewModel = {
  searchStatusText: string | null;
  searchStatusIsError: boolean;
  weatherStatusText: string | null;
  weatherStatusIsError: boolean;
  shouldShowSkeleton: boolean;
  shouldShowSkeletonAsOverlay: boolean;
  weatherContentKey: string;
  weatherData: WeatherResponse | null;
  controlsDisabled: boolean;
};

const resolveWeatherContentKey = (weather: WeatherResponse): string => {
  return `${weather.location.lat},${weather.location.lon},${weather.current.temperature},${weather.units}`;
};

const resolveSearchStatusMessage = (statusMessage: StatusMessage | null): StatusMessage | null => {
  if (statusMessage !== null && isSearchStatusMessage(statusMessage)) {
    return statusMessage;
  }
  return null;
};

const resolveWeatherStatusMessage = (statusMessage: StatusMessage | null): StatusMessage | null => {
  if (statusMessage !== null && !isSearchStatusMessage(statusMessage)) {
    return statusMessage;
  }
  return null;
};

const resolveShouldShowSkeleton = (
  app: Pick<WeatherAppState, 'isLoadingWeather' | 'isSearching' | 'weather' | 'statusMessage'>,
  weatherStatusMessage: StatusMessage | null,
): boolean => {
  if (app.isLoadingWeather) {
    return true;
  }

  if (app.weather !== null) {
    return false;
  }

  const hasTransientStatus =
    app.statusMessage !== null && isTransientStatusMessage(app.statusMessage);

  return app.isSearching || hasTransientStatus || weatherStatusMessage === null;
};

export const buildWeatherDashboardViewModel = (app: WeatherAppState): WeatherDashboardViewModel => {
  const searchStatusMessage = resolveSearchStatusMessage(app.statusMessage);
  const weatherStatusMessage = resolveWeatherStatusMessage(app.statusMessage);
  const shouldShowSkeleton = resolveShouldShowSkeleton(app, weatherStatusMessage);

  return {
    searchStatusText: searchStatusMessage?.text ?? null,
    searchStatusIsError: searchStatusMessage !== null && isErrorStatusMessage(searchStatusMessage),
    weatherStatusText: weatherStatusMessage?.text ?? null,
    weatherStatusIsError:
      weatherStatusMessage !== null && isErrorStatusMessage(weatherStatusMessage),
    shouldShowSkeleton,
    shouldShowSkeletonAsOverlay: shouldShowSkeleton && app.weather !== null,
    weatherContentKey: app.weather
      ? resolveWeatherContentKey(app.weather)
      : 'empty-weather-content',
    weatherData: app.weather,
    controlsDisabled: app.isSearching || app.isLoadingWeather,
  };
};
