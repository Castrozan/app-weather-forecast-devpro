'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { weatherApiClient } from '@/services/client/weatherApiClient';
import type { CityCandidate, TemperatureUnit } from '@/types/weather';

export type WeatherSearchState = {
  cityQuery: string;
  candidateCities: CityCandidate[];
  selectedCity: CityCandidate | null;
  isSearching: boolean;
  searchError: string | null;
  hasUserInteractionRef: React.MutableRefObject<boolean>;
  setCityQuery: (value: string) => void;
  setSelectedCity: (city: CityCandidate) => void;
  setCandidateCities: (cities: CityCandidate[]) => void;
  selectCity: (city: CityCandidate) => Promise<void>;
  search: () => Promise<void>;
};

export const useWeatherSearch = (
  units: TemperatureUnit,
  loadWeatherForCity: (city: CityCandidate, nextUnits: TemperatureUnit) => Promise<void>,
): WeatherSearchState => {
  const [cityQueryState, setCityQueryState] = useState('');
  const [candidateCities, setCandidateCities] = useState<CityCandidate[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityCandidate | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const hasUserInteractionRef = useRef(false);

  const searchMutation = useMutation({
    mutationFn: weatherApiClient.fetchCities,
  });

  const setCityQuery = useCallback((value: string): void => {
    hasUserInteractionRef.current = true;
    setCityQueryState(value);
  }, []);

  const selectCity = useCallback(
    async (city: CityCandidate): Promise<void> => {
      hasUserInteractionRef.current = true;
      setSelectedCity(city);
      setCandidateCities([]);
      setCityQueryState(city.name);
      await loadWeatherForCity(city, units);
    },
    [loadWeatherForCity, units],
  );

  const search = useCallback(async (): Promise<void> => {
    hasUserInteractionRef.current = true;
    const query = cityQueryState.trim();

    if (!query) {
      return;
    }

    try {
      const cities = await searchMutation.mutateAsync(query);
      setSearchError(null);

      if (cities.length === 0) {
        setCandidateCities([]);
        return;
      }

      if (cities.length === 1) {
        await selectCity(cities[0]);
        return;
      }

      setCandidateCities(cities);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'City search failed.');
      setCandidateCities([]);
    }
  }, [cityQueryState, searchMutation, selectCity]);

  return {
    cityQuery: cityQueryState,
    candidateCities,
    selectedCity,
    isSearching: searchMutation.isPending,
    searchError,
    hasUserInteractionRef,
    setCityQuery,
    setSelectedCity,
    setCandidateCities,
    selectCity,
    search,
  };
};
