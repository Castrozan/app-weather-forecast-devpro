import type { WeatherProviderPort } from '@/services/server/weather/ports/weatherProvider';
import { createOpenMeteoWeatherProvider } from '@/services/server/weather/adapters/openMeteo/openMeteoWeatherProvider';

let provider: WeatherProviderPort | null = null;

export const getWeatherProvider = (): WeatherProviderPort => {
  if (!provider) {
    provider = createOpenMeteoWeatherProvider();
  }

  return provider;
};

export const resetWeatherProviderForTests = (): void => {
  provider = null;
};
