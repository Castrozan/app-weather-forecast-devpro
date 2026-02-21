import { describe, expect, it } from 'vitest';

import type { WeatherAppState } from '@/hooks/useWeatherApp';
import { buildWeatherDashboardViewModel } from '@/lib/weatherDashboardViewModel';
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
    it('is true when isLoadingWeather is true even with existing weather', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ isLoadingWeather: true, weather: buildWeatherResponse() }),
      );

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

  describe('shouldShowSkeletonAsOverlay', () => {
    it('is true when skeleton shows and weather already exists (refresh scenario)', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ isLoadingWeather: true, weather: buildWeatherResponse() }),
      );

      expect(vm.shouldShowSkeletonAsOverlay).toBe(true);
    });

    it('is false when skeleton shows but no weather exists yet (initial load)', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ isLoadingWeather: true }));

      expect(vm.shouldShowSkeletonAsOverlay).toBe(false);
    });
  });

  describe('weatherContentKey', () => {
    it('includes lat, lon, temperature, and units to force remount on city or unit change', () => {
      const weather = buildWeatherResponse();
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ weather }));

      expect(vm.weatherContentKey).toBe('35.68,139.69,22,metric');
    });

    it('returns a stable empty-state key when no weather is present', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState());

      expect(vm.weatherContentKey).toBe('empty-weather-content');
    });
  });

  describe('activeErrorMessage', () => {
    it('is null when no errors are present', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState());

      expect(vm.activeErrorMessage).toBeNull();
    });

    it('returns weatherError when only weather failed', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ weatherError: 'Weather service unavailable.' }),
      );

      expect(vm.activeErrorMessage).toBe('Weather service unavailable.');
    });

    it('returns searchError when only city search failed', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ searchError: 'City search service unavailable.' }),
      );

      expect(vm.activeErrorMessage).toBe('City search service unavailable.');
    });

    it('gives searchError priority over weatherError when both are set', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({
          searchError: 'City search service unavailable.',
          weatherError: 'Weather service unavailable.',
        }),
      );

      expect(vm.activeErrorMessage).toBe('City search service unavailable.');
    });
  });
});
