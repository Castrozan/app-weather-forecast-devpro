import type {
  FetchWeatherByCoordinatesInput,
  WeatherProviderCity,
  WeatherProviderPort,
  WeatherProviderWeather,
} from '@/services/server/weather/ports/weatherProvider';

export const createProviderWithFallback = (
  primaryProvider: WeatherProviderPort,
  fallbackProvider: WeatherProviderPort,
): WeatherProviderPort => {
  return {
    name: `${primaryProvider.name}+${fallbackProvider.name}`,

    async searchCities(query: string, limit: number): Promise<WeatherProviderCity[]> {
      try {
        return await primaryProvider.searchCities(query, limit);
      } catch {
        return fallbackProvider.searchCities(query, limit);
      }
    },

    async fetchWeatherByCoordinates(
      input: FetchWeatherByCoordinatesInput,
    ): Promise<WeatherProviderWeather> {
      try {
        return await primaryProvider.fetchWeatherByCoordinates(input);
      } catch {
        return fallbackProvider.fetchWeatherByCoordinates(input);
      }
    },
  };
};
