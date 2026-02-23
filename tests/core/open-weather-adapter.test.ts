import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  WeatherProviderConfigurationError,
  WeatherProviderUpstreamError,
} from '@/features/weather/providers/weatherProviderErrors';
import { createOpenWeatherWeatherProvider } from '@/features/weather/providers/openWeather/openWeatherWeatherProvider';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const buildSuccessfulFetchResponse = (body: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);

const buildFailedFetchResponse = (status: number) =>
  Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as Response);

const validCurrentWeatherResponse = {
  coord: { lat: 41.88, lon: -87.63 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  main: { temp: 22.5, temp_min: 18.0, temp_max: 25.0, humidity: 55 },
  wind: { speed: 4.2 },
  timezone: -18000,
  name: 'Chicago',
  sys: { country: 'US', sunrise: 1700000000, sunset: 1700040000 },
  dt: 1700020000,
};

const validForecastResponse = {
  list: [
    {
      dt: 1700020000,
      main: { temp: 22.5, temp_min: 18.0, temp_max: 25.0 },
      weather: [{ description: 'clear sky', icon: '01d' }],
      sys: { pod: 'd' },
    },
    {
      dt: 1700031600,
      main: { temp: 15.0, temp_min: 12.0, temp_max: 16.5 },
      weather: [{ description: 'few clouds', icon: '02n' }],
      sys: { pod: 'n' },
    },
  ],
  city: {
    name: 'Chicago',
    country: 'US',
    coord: { lat: 41.88, lon: -87.63 },
    timezone: -18000,
    sunrise: 1700000000,
    sunset: 1700040000,
  },
};

const validGeocodingResponse = [
  { name: 'London', country: 'GB', lat: 51.5085, lon: -0.1257, state: 'England' },
  { name: 'London', country: 'US', lat: 37.1289, lon: -84.0833, state: 'Kentucky' },
];

beforeEach(() => {
  mockFetch.mockReset();
});

describe('createOpenWeatherWeatherProvider', () => {
  it('throws WeatherProviderConfigurationError when API key is empty', () => {
    expect(() => createOpenWeatherWeatherProvider('')).toThrow(WeatherProviderConfigurationError);
  });

  it('throws WeatherProviderConfigurationError when API key is only whitespace', () => {
    expect(() => createOpenWeatherWeatherProvider('   ')).toThrow(
      WeatherProviderConfigurationError,
    );
  });

  it('creates provider with name "open-weather" when API key is valid', () => {
    const provider = createOpenWeatherWeatherProvider('valid-key');
    expect(provider.name).toBe('open-weather');
  });
});

describe('openWeatherWeatherProvider.searchCities', () => {
  it('returns mapped city candidates from geocoding API', async () => {
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse(validGeocodingResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const cities = await provider.searchCities('London', 5);

    expect(cities).toHaveLength(2);
    expect(cities[0]).toEqual({
      name: 'London',
      country: 'GB',
      lat: 51.5085,
      lon: -0.1257,
      state: 'England',
    });
    expect(cities[1]).toEqual({
      name: 'London',
      country: 'US',
      lat: 37.1289,
      lon: -84.0833,
      state: 'Kentucky',
    });
  });

  it('includes appid in the geocoding request URL', async () => {
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse(validGeocodingResponse));

    const provider = createOpenWeatherWeatherProvider('my-secret-key');
    await provider.searchCities('Paris', 3);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('appid=my-secret-key');
    expect(calledUrl).toContain('q=Paris');
    expect(calledUrl).toContain('limit=3');
  });

  it('clamps limit to maximum of 5', async () => {
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse(validGeocodingResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    await provider.searchCities('Berlin', 10);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=5');
  });

  it('clamps limit to minimum of 1', async () => {
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse(validGeocodingResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    await provider.searchCities('Berlin', 0);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=1');
  });

  it('returns empty array when geocoding API returns empty list', async () => {
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse([]));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const cities = await provider.searchCities('Nowhere', 5);

    expect(cities).toEqual([]);
  });

  it('throws WeatherProviderUpstreamError on non-200 HTTP response', async () => {
    mockFetch.mockResolvedValueOnce(buildFailedFetchResponse(401));

    const provider = createOpenWeatherWeatherProvider('test-key');

    await expect(provider.searchCities('London', 5)).rejects.toThrow(WeatherProviderUpstreamError);
  });

  it('throws WeatherProviderUpstreamError with 502 when geocoding response schema is invalid', async () => {
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse({ invalid: 'shape' }));

    const provider = createOpenWeatherWeatherProvider('test-key');

    await expect(provider.searchCities('London', 5)).rejects.toThrow(WeatherProviderUpstreamError);
  });

  it('returns city without state field when state is absent in response', async () => {
    const responseWithoutState = [{ name: 'Tokyo', country: 'JP', lat: 35.69, lon: 139.69 }];
    mockFetch.mockResolvedValueOnce(buildSuccessfulFetchResponse(responseWithoutState));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const cities = await provider.searchCities('Tokyo', 1);

    expect(cities[0].state).toBeUndefined();
  });
});

describe('openWeatherWeatherProvider.fetchWeatherByCoordinates', () => {
  it('fetches both current weather and forecast in parallel', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    await provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('includes appid in both current and forecast request URLs', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('my-api-key');
    await provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' });

    const [firstUrl, secondUrl] = mockFetch.mock.calls.map((call) => call[0] as string);
    expect(firstUrl).toContain('appid=my-api-key');
    expect(secondUrl).toContain('appid=my-api-key');
  });

  it('returns mapped weather data with location, current, and forecast entries', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const result = await provider.fetchWeatherByCoordinates({
      lat: 41.88,
      lon: -87.63,
      units: 'metric',
    });

    expect(result.location.name).toBe('Chicago');
    expect(result.location.country).toBe('US');
    expect(result.location.lat).toBe(41.88);
    expect(result.location.lon).toBe(-87.63);
    expect(result.current.temperature).toBe(22.5);
    expect(result.current.min).toBe(18.0);
    expect(result.current.max).toBe(25.0);
    expect(result.current.description).toBe('clear sky');
    expect(result.current.icon).toBe('01d');
    expect(result.current.humidity).toBe(55);
    expect(result.current.windSpeed).toBe(4.2);
    expect(result.timezoneOffsetSeconds).toBe(-18000);
    expect(result.forecastEntries).toHaveLength(2);
  });

  it('maps forecast list items to WeatherProviderForecastEntry with isDaylight from pod field', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const result = await provider.fetchWeatherByCoordinates({
      lat: 41.88,
      lon: -87.63,
      units: 'metric',
    });

    expect(result.forecastEntries[0].isDaylight).toBe(true);
    expect(result.forecastEntries[0].icon).toBe('01d');
    expect(result.forecastEntries[1].isDaylight).toBe(false);
    expect(result.forecastEntries[1].icon).toBe('02n');
  });

  it('uses metric units parameter when units is metric', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    await provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' });

    const [firstUrl, secondUrl] = mockFetch.mock.calls.map((call) => call[0] as string);
    expect(firstUrl).toContain('units=metric');
    expect(secondUrl).toContain('units=metric');
  });

  it('uses imperial units parameter when units is imperial', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    await provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'imperial' });

    const [firstUrl, secondUrl] = mockFetch.mock.calls.map((call) => call[0] as string);
    expect(firstUrl).toContain('units=imperial');
    expect(secondUrl).toContain('units=imperial');
  });

  it('overrides location name with locationHint when provided', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const result = await provider.fetchWeatherByCoordinates({
      lat: 41.88,
      lon: -87.63,
      units: 'metric',
      locationHint: { name: 'The Windy City', country: 'United States' },
    });

    expect(result.location.name).toBe('The Windy City');
    expect(result.location.country).toBe('United States');
  });

  it('uses API location name when locationHint is absent', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    const result = await provider.fetchWeatherByCoordinates({
      lat: 41.88,
      lon: -87.63,
      units: 'metric',
    });

    expect(result.location.name).toBe('Chicago');
    expect(result.location.country).toBe('US');
  });

  it('throws WeatherProviderUpstreamError when current weather request fails', async () => {
    mockFetch
      .mockResolvedValueOnce(buildFailedFetchResponse(503))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');

    await expect(
      provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' }),
    ).rejects.toThrow(WeatherProviderUpstreamError);
  });

  it('throws WeatherProviderUpstreamError when forecast request fails', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildFailedFetchResponse(429));

    const provider = createOpenWeatherWeatherProvider('test-key');

    await expect(
      provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' }),
    ).rejects.toThrow(WeatherProviderUpstreamError);
  });

  it('throws WeatherProviderUpstreamError with 502 when current weather response schema is invalid', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse({ unexpected: 'payload' }))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');

    await expect(
      provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' }),
    ).rejects.toThrow(WeatherProviderUpstreamError);
  });

  it('requests cnt=40 forecast timestamps to cover 5 days', async () => {
    mockFetch
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validCurrentWeatherResponse))
      .mockResolvedValueOnce(buildSuccessfulFetchResponse(validForecastResponse));

    const provider = createOpenWeatherWeatherProvider('test-key');
    await provider.fetchWeatherByCoordinates({ lat: 41.88, lon: -87.63, units: 'metric' });

    const forecastUrl = mockFetch.mock.calls[1][0] as string;
    expect(forecastUrl).toContain('cnt=40');
  });
});
