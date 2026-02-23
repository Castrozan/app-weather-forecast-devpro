import { describe, expect, it } from 'vitest';

import type { WeatherAppState } from '@/hooks/useWeatherApp';
import { buildWeatherDashboardViewModel } from '@/components/dashboard/weatherDashboardViewModel';
import type { WeatherResponse } from '@/types/weather';

const buildWeatherResponse = (): WeatherResponse => ({
  location: { name: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.69 },
  units: 'metric',
  current: {
    temperature: 22,
    min: 18,
    max: 27,
    description: 'Clear sky',
    icon: '01d',
    humidity: 60,
    windSpeed: 12,
  },
  forecastDaily: [],
});

const buildBaseAppState = (overrides: Partial<WeatherAppState> = {}): WeatherAppState => ({
  cityQuery: '',
  selectedCity: null,
  candidateCities: [],
  units: 'metric',
  weather: null,
  weatherError: null,
  searchError: null,
  isSearching: false,
  isLoadingWeather: false,
  setCityQuery: () => undefined,
  setUnits: async () => undefined,
  search: async () => undefined,
  selectCity: async () => undefined,
  ...overrides,
});

describe('buildWeatherDashboardViewModel', () => {
  describe('controlsDisabled', () => {
    it('is false when not searching and not loading', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState());

      expect(vm.controlsDisabled).toBe(false);
    });

    it('is true when isSearching is true', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ isSearching: true }));

      expect(vm.controlsDisabled).toBe(true);
    });

    it('is true when isLoadingWeather is true', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ isLoadingWeather: true }));

      expect(vm.controlsDisabled).toBe(true);
    });
  });

  describe('shouldShowSkeleton', () => {
    it('is false when weather exists even while loading (keeps stale content visible)', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ isLoadingWeather: true, weather: buildWeatherResponse() }),
      );

      expect(vm.shouldShowSkeleton).toBe(false);
    });

    it('is true when no weather and isLoadingWeather is true', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ isLoadingWeather: true }));

      expect(vm.shouldShowSkeleton).toBe(true);
    });

    it('is false when weather exists and not loading', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ weather: buildWeatherResponse() }),
      );

      expect(vm.shouldShowSkeleton).toBe(false);
    });

    it('is false when no weather and not loading or searching (error state)', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState());

      expect(vm.shouldShowSkeleton).toBe(false);
    });

    it('is true when no weather and isSearching is true', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ isSearching: true }));

      expect(vm.shouldShowSkeleton).toBe(true);
    });
  });

  describe('weatherContentKey', () => {
    it('includes lat and lon to force remount on city change', () => {
      const weather = buildWeatherResponse();
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ weather }));

      expect(vm.weatherContentKey).toBe('35.68,139.69');
    });

    it('returns a stable empty-state key when no weather is present', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState());

      expect(vm.weatherContentKey).toBe('empty-weather-content');
    });
  });
});
