'use client';

import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/features/weather/types';

import { useGeolocationBootstrap } from '@/features/geolocation/hooks/useGeolocationBootstrap';
import { useWeatherLoader } from '@/features/weather/hooks/useWeatherLoader';
import { useWeatherSearch } from '@/features/search/hooks/useWeatherSearch';

export type WeatherAppState = {
  cityQuery: string;
  selectedCity: CityCandidate | null;
  candidateCities: CityCandidate[];
  units: TemperatureUnit;
  weather: WeatherResponse | null;
  weatherError: string | null;
  searchError: string | null;
  isSearching: boolean;
  isLoadingWeather: boolean;
  setCityQuery: (value: string) => void;
  setUnits: (value: TemperatureUnit) => Promise<void>;
  search: () => Promise<void>;
  selectCity: (city: CityCandidate) => Promise<void>;
};

export const useWeatherApp = (defaultUnit: TemperatureUnit = 'metric'): WeatherAppState => {
  const loader = useWeatherLoader(defaultUnit);

  const searchState = useWeatherSearch(loader.units, loader.loadWeatherForCity);

  useGeolocationBootstrap({
    currentUnitsRef: loader.currentUnitsRef,
    hasUserInteractionRef: searchState.hasUserInteractionRef,
    setSelectedCity: searchState.setSelectedCity,
    setCandidateCities: searchState.setCandidateCities,
    loadWeatherForCity: loader.loadWeatherForCity,
  });

  return {
    cityQuery: searchState.cityQuery,
    selectedCity: searchState.selectedCity,
    candidateCities: searchState.candidateCities,
    units: loader.units,
    weather: loader.weather,
    weatherError: loader.weatherError,
    searchError: searchState.searchError,
    isSearching: searchState.isSearching,
    isLoadingWeather: loader.isLoadingWeather,
    setCityQuery: searchState.setCityQuery,
    setUnits: (nextUnit) => loader.setUnits(nextUnit, searchState.selectedCity),
    search: searchState.search,
    selectCity: searchState.selectCity,
  };
};
