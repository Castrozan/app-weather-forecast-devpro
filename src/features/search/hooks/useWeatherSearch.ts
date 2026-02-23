'use client';

import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { weatherApiClient } from '@/features/weather/api/weatherApiClient';
import type { CityCandidate, TemperatureUnit } from '@/features/weather/types';

export type WeatherSearchState = {
  cityQuery: string;
  candidateCities: CityCandidate[];
  selectedCity: CityCandidate | null;
  isSearching: boolean;
  searchError: string | null;
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

  const searchMutation = useMutation({
    mutationFn: weatherApiClient.fetchCities,
  });

  const selectCity = useCallback(
    async (city: CityCandidate): Promise<void> => {
      setSelectedCity(city);
      setCandidateCities([]);
      setCityQueryState(city.name);
      await loadWeatherForCity(city, units);
    },
    [loadWeatherForCity, units],
  );

  const search = useCallback(async (): Promise<void> => {
    const query = cityQueryState.trim();

    if (!query) {
      return;
    }

    try {
      const cities = await searchMutation.mutateAsync(query);
      setSearchError(null);

      if (cities.length === 0) {
        setCandidateCities([]);
        toast.info(`No cities found for "${query}".`);
        return;
      }

      if (cities.length === 1) {
        await selectCity(cities[0]);
        return;
      }

      setCandidateCities(cities);
    } catch (error) {
      const searchErrorMessage = error instanceof Error ? error.message : 'City search failed.';
      setSearchError(searchErrorMessage);
      toast.error(searchErrorMessage);
      setCandidateCities([]);
    }
  }, [cityQueryState, searchMutation, selectCity]);

  return {
    cityQuery: cityQueryState,
    candidateCities,
    selectedCity,
    isSearching: searchMutation.isPending,
    searchError,
    setCityQuery: setCityQueryState,
    setSelectedCity,
    setCandidateCities,
    selectCity,
    search,
  };
};
