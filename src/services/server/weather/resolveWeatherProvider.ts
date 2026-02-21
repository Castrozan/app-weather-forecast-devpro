import { appConfig } from '@/lib/config';
import type { WeatherProviderPort } from '@/services/server/weather/ports/weatherProvider';
import { createOpenMeteoWeatherProvider } from '@/services/server/weather/adapters/openMeteo/openMeteoWeatherProvider';
import { createOpenWeatherWeatherProvider } from '@/services/server/weather/adapters/openWeather/openWeatherWeatherProvider';
import { createProviderWithFallback } from '@/services/server/weather/withFallbackWeatherProvider';

let provider: WeatherProviderPort | null = null;

const buildWeatherProvider = (): WeatherProviderPort => {
  const openMeteoProvider = createOpenMeteoWeatherProvider();

  const openWeatherApiKey = appConfig.openWeatherApiKey;
  if (!openWeatherApiKey) {
    return openMeteoProvider;
  }

  const openWeatherProvider = createOpenWeatherWeatherProvider(openWeatherApiKey);
  return createProviderWithFallback(openMeteoProvider, openWeatherProvider);
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
