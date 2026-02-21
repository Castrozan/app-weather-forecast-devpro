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
  statusMessage: null,
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

  describe('search status message routing', () => {
    it('exposes search status text when statusMessage is search-scoped', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ statusMessage: { kind: 'search-info', text: 'Multiple matches.' } }),
      );

      expect(vm.searchStatusText).toBe('Multiple matches.');
      expect(vm.weatherStatusText).toBeNull();
    });

    it('marks searchStatusIsError true for search-error kind', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ statusMessage: { kind: 'search-error', text: 'No city found.' } }),
      );

      expect(vm.searchStatusIsError).toBe(true);
    });

    it('marks searchStatusIsError false for search-info kind', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ statusMessage: { kind: 'search-info', text: 'Select a city.' } }),
      );

      expect(vm.searchStatusIsError).toBe(false);
    });
  });

  describe('weather status message routing', () => {
    it('exposes weather status text when statusMessage is weather-scoped', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ statusMessage: { kind: 'weather-error', text: 'API error.' } }),
      );

      expect(vm.weatherStatusText).toBe('API error.');
      expect(vm.searchStatusText).toBeNull();
    });

    it('marks weatherStatusIsError true for weather-error kind', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ statusMessage: { kind: 'weather-error', text: 'Failed.' } }),
      );

      expect(vm.weatherStatusIsError).toBe(true);
    });

    it('marks weatherStatusIsError false for non-error weather status', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState({ statusMessage: null }));

      expect(vm.weatherStatusIsError).toBe(false);
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

    it('is true when no weather and no error status (initial state)', () => {
      const vm = buildWeatherDashboardViewModel(buildBaseAppState());

      expect(vm.shouldShowSkeleton).toBe(true);
    });

    it('is false when no weather but a weather-error status exists', () => {
      const vm = buildWeatherDashboardViewModel(
        buildBaseAppState({ statusMessage: { kind: 'weather-error', text: 'Failed.' } }),
      );

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
});
