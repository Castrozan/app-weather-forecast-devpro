import { appConfig } from '@/config/appConfig';
import type { WeatherProviderPort } from '@/features/weather/providers/weatherProviderPort';
import { createOpenMeteoWeatherProvider } from '@/features/weather/providers/openMeteo/openMeteoWeatherProvider';
import { createOpenWeatherWeatherProvider } from '@/features/weather/providers/openWeather/openWeatherWeatherProvider';
import { createProviderWithFallback } from '@/features/weather/providers/withFallbackWeatherProvider';

let provider: WeatherProviderPort | null = null;

const buildWeatherProvider = (): WeatherProviderPort => {
  const openMeteoProvider = createOpenMeteoWeatherProvider();

  const openWeatherApiKey = appConfig.openWeatherApiKey;
  if (!openWeatherApiKey) {
    return openMeteoProvider;
  }

  const openWeatherProvider = createOpenWeatherWeatherProvider(openWeatherApiKey);
  return createProviderWithFallback(openWeatherProvider, openMeteoProvider);
};

export const getWeatherProvider = (): WeatherProviderPort => {
  if (!provider) {
    provider = buildWeatherProvider();
  }

  return provider;
};

export const resetWeatherProviderForTests = (): void => {
  provider = null;
};
