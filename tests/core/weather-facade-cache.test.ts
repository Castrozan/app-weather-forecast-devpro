import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockProvider = vi.hoisted(() => ({
  searchCities: vi.fn(),
  fetchWeatherByCoordinates: vi.fn(),
}));

vi.mock('@/services/server/weather/resolveWeatherProvider', () => ({
  getWeatherProvider: () => ({
    name: 'test-provider',
    searchCities: mockProvider.searchCities,
    fetchWeatherByCoordinates: mockProvider.fetchWeatherByCoordinates,
  }),
}));

import { clearWeatherCache, getWeatherByCoordinates } from '@/services/server/weatherFacade';

const baseProviderWeather = {
  location: {
    name: 'Chicago',
    country: 'US',
    lat: 41.8755616,
    lon: -87.6244212,
  },
  timezoneOffsetSeconds: 0,
  current: {
    temperature: 19.4,
    min: 16.2,
    max: 21.1,
    description: 'clear sky',
    icon: '01d',
    humidity: 40,
    windSpeed: 3.8,
  },
  forecastEntries: [
    {
      timestampSeconds: 1771588800,
      minTemperature: 11.2,
      maxTemperature: 20.6,
      description: 'few clouds',
      icon: '02d',
      isDaylight: true,
    },
    {
      timestampSeconds: 1771675200,
      minTemperature: 10.1,
      maxTemperature: 17.5,
      description: 'light rain',
      icon: '10d',
      isDaylight: true,
    },
  ],
};

beforeEach(() => {
  clearWeatherCache();
  mockProvider.searchCities.mockReset();
  mockProvider.fetchWeatherByCoordinates.mockReset();
  mockProvider.fetchWeatherByCoordinates.mockResolvedValue(baseProviderWeather);
});

describe('getWeatherByCoordinates caching', () => {
  it('caches responses by lat/lon/units', async () => {
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'metric');
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'metric');

    expect(mockProvider.fetchWeatherByCoordinates).toHaveBeenCalledTimes(1);
  });

  it('uses different cache keys for different units', async () => {
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'metric');
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'imperial');

    expect(mockProvider.fetchWeatherByCoordinates).toHaveBeenCalledTimes(2);
  });
});
