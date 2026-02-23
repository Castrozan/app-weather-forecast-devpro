'use client';

import { useEffect, useRef } from 'react';

import { DEFAULT_CITY } from '@/config/defaultCity';
import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/features/weather/types';

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
  const hasLoadedDefaultCityRef = useRef(false);

  useEffect(() => {
    if (hasLoadedDefaultCityRef.current) {
      return;
    }

    hasLoadedDefaultCityRef.current = true;
    searchState.setSelectedCity(DEFAULT_CITY);
    void loader.loadWeatherForCity(DEFAULT_CITY, loader.currentUnitsRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
