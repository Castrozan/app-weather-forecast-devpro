import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  fetchCurrentWeather: vi.fn(),
  fetchForecast: vi.fn(),
}));

vi.mock('@/services/server/openweather/openWeatherClient', () => ({
  fetchCurrentWeather: mockApi.fetchCurrentWeather,
  fetchForecast: mockApi.fetchForecast,
}));

import { clearWeatherCache, getWeatherByCoordinates } from '@/services/server/weatherFacade';
import type { OpenWeatherForecastEntry } from '@/services/server/forecast/aggregateForecastByDay';

const baseCurrentWeather = {
  coord: { lat: 41.8755616, lon: -87.6244212 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  main: { temp: 19.4, temp_min: 16.2, temp_max: 21.1, humidity: 40 },
  wind: { speed: 3.8 },
  timezone: 0,
  name: 'Chicago',
  sys: { country: 'US' },
};

const baseForecastEntries: OpenWeatherForecastEntry[] = [
  {
    dt: 1771588800,
    main: { temp_min: 11.2, temp_max: 20.6 },
    weather: [{ description: 'few clouds', icon: '02d' }],
  },
  {
    dt: 1771675200,
    main: { temp_min: 10.1, temp_max: 17.5 },
    weather: [{ description: 'light rain', icon: '10d' }],
  },
];

beforeEach(() => {
  clearWeatherCache();
  mockApi.fetchCurrentWeather.mockReset();
  mockApi.fetchForecast.mockReset();
  mockApi.fetchCurrentWeather.mockResolvedValue(baseCurrentWeather);
  mockApi.fetchForecast.mockResolvedValue({ list: baseForecastEntries });
});

describe('getWeatherByCoordinates caching', () => {
  it('caches responses by lat/lon/units', async () => {
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'metric');
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'metric');

    expect(mockApi.fetchCurrentWeather).toHaveBeenCalledTimes(1);
    expect(mockApi.fetchForecast).toHaveBeenCalledTimes(1);
  });

  it('uses different cache keys for different units', async () => {
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'metric');
    await getWeatherByCoordinates(41.8755616, -87.6244212, 'imperial');

    expect(mockApi.fetchCurrentWeather).toHaveBeenCalledTimes(2);
    expect(mockApi.fetchForecast).toHaveBeenCalledTimes(2);
  });
});
