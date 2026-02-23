import { describe, expect, it, vi } from 'vitest';

import { WeatherProviderUpstreamError } from '@/features/weather/providers/weatherProviderErrors';
import { createProviderWithFallback } from '@/features/weather/providers/withFallbackWeatherProvider';
import type { WeatherProviderPort } from '@/features/weather/providers/weatherProviderPort';

const buildMockProvider = (name: string): WeatherProviderPort => ({
  name,
  searchCities: vi.fn(),
  fetchWeatherByCoordinates: vi.fn(),
});

const sampleCities = [{ name: 'Chicago', country: 'US', lat: 41.88, lon: -87.63 }];

const sampleWeather = {
  location: { name: 'Chicago', country: 'US', lat: 41.88, lon: -87.63 },
  timezoneOffsetSeconds: -18000,
  current: {
    temperature: 20,
    min: 15,
    max: 25,
    description: 'clear sky',
    icon: '01d',
    humidity: 50,
    windSpeed: 5,
  },
  forecastEntries: [],
};

describe('createProviderWithFallback', () => {
  it('creates a provider whose name concatenates primary and fallback provider names', () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    const composite = createProviderWithFallback(primary, fallback);

    expect(composite.name).toBe('open-meteo+open-weather');
  });
});

describe('createProviderWithFallback.searchCities', () => {
  it('returns result from primary provider when primary succeeds', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.searchCities).mockResolvedValueOnce(sampleCities);

    const composite = createProviderWithFallback(primary, fallback);
    const result = await composite.searchCities('Chicago', 5);

    expect(result).toEqual(sampleCities);
    expect(primary.searchCities).toHaveBeenCalledWith('Chicago', 5);
    expect(fallback.searchCities).not.toHaveBeenCalled();
  });

  it('falls back to secondary provider when primary throws', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.searchCities).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-meteo', 503),
    );
    vi.mocked(fallback.searchCities).mockResolvedValueOnce(sampleCities);

    const composite = createProviderWithFallback(primary, fallback);
    const result = await composite.searchCities('Chicago', 5);

    expect(result).toEqual(sampleCities);
    expect(fallback.searchCities).toHaveBeenCalledWith('Chicago', 5);
  });

  it('propagates the fallback error when both primary and fallback throw', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.searchCities).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-meteo', 503),
    );
    vi.mocked(fallback.searchCities).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-weather', 429),
    );

    const composite = createProviderWithFallback(primary, fallback);

    await expect(composite.searchCities('Chicago', 5)).rejects.toThrow(
      WeatherProviderUpstreamError,
    );
  });

  it('does not call fallback when primary returns an empty array', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.searchCities).mockResolvedValueOnce([]);

    const composite = createProviderWithFallback(primary, fallback);
    const result = await composite.searchCities('Nowhere', 5);

    expect(result).toEqual([]);
    expect(fallback.searchCities).not.toHaveBeenCalled();
  });
});

describe('createProviderWithFallback.fetchWeatherByCoordinates', () => {
  const weatherInput = { lat: 41.88, lon: -87.63, units: 'metric' as const };

  it('returns result from primary provider when primary succeeds', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.fetchWeatherByCoordinates).mockResolvedValueOnce(sampleWeather);

    const composite = createProviderWithFallback(primary, fallback);
    const result = await composite.fetchWeatherByCoordinates(weatherInput);

    expect(result).toEqual(sampleWeather);
    expect(primary.fetchWeatherByCoordinates).toHaveBeenCalledWith(weatherInput);
    expect(fallback.fetchWeatherByCoordinates).not.toHaveBeenCalled();
  });

  it('falls back to secondary provider when primary throws', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.fetchWeatherByCoordinates).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-meteo', 503),
    );
    vi.mocked(fallback.fetchWeatherByCoordinates).mockResolvedValueOnce(sampleWeather);

    const composite = createProviderWithFallback(primary, fallback);
    const result = await composite.fetchWeatherByCoordinates(weatherInput);

    expect(result).toEqual(sampleWeather);
    expect(fallback.fetchWeatherByCoordinates).toHaveBeenCalledWith(weatherInput);
  });

  it('passes the same input to the fallback provider', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    const inputWithHint = {
      lat: 51.51,
      lon: -0.13,
      units: 'imperial' as const,
      locationHint: { name: 'London', country: 'GB' },
    };

    vi.mocked(primary.fetchWeatherByCoordinates).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-meteo', 500),
    );
    vi.mocked(fallback.fetchWeatherByCoordinates).mockResolvedValueOnce(sampleWeather);

    const composite = createProviderWithFallback(primary, fallback);
    await composite.fetchWeatherByCoordinates(inputWithHint);

    expect(fallback.fetchWeatherByCoordinates).toHaveBeenCalledWith(inputWithHint);
  });

  it('propagates the fallback error when both primary and fallback throw', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.fetchWeatherByCoordinates).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-meteo', 503),
    );
    vi.mocked(fallback.fetchWeatherByCoordinates).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-weather', 500),
    );

    const composite = createProviderWithFallback(primary, fallback);

    await expect(composite.fetchWeatherByCoordinates(weatherInput)).rejects.toThrow(
      WeatherProviderUpstreamError,
    );
  });

  it('only calls primary once before routing to fallback', async () => {
    const primary = buildMockProvider('open-meteo');
    const fallback = buildMockProvider('open-weather');

    vi.mocked(primary.fetchWeatherByCoordinates).mockRejectedValueOnce(
      new WeatherProviderUpstreamError('open-meteo', 503),
    );
    vi.mocked(fallback.fetchWeatherByCoordinates).mockResolvedValueOnce(sampleWeather);

    const composite = createProviderWithFallback(primary, fallback);
    await composite.fetchWeatherByCoordinates(weatherInput);

    expect(primary.fetchWeatherByCoordinates).toHaveBeenCalledTimes(1);
    expect(fallback.fetchWeatherByCoordinates).toHaveBeenCalledTimes(1);
  });
});
