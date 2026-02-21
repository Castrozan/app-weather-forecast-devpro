'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import type { StatusMessage } from '@/lib/statusMessage';
import { weatherApiClient } from '@/services/client/weatherApiClient';
import type { CityCandidate, TemperatureUnit } from '@/types/weather';

export type WeatherSearchState = {
  cityQuery: string;
  candidateCities: CityCandidate[];
  selectedCity: CityCandidate | null;
  isSearching: boolean;
  hasUserInteractionRef: React.MutableRefObject<boolean>;
  setCityQuery: (value: string) => void;
  setSelectedCity: (city: CityCandidate) => void;
  setCandidateCities: (cities: CityCandidate[]) => void;
  selectCity: (city: CityCandidate) => Promise<void>;
  search: () => Promise<void>;
};

export const useWeatherSearch = (
  units: TemperatureUnit,
  setStatusMessage: (message: StatusMessage | null) => void,
  loadWeatherForCity: (city: CityCandidate, nextUnits: TemperatureUnit) => Promise<void>,
): WeatherSearchState => {
  const [cityQueryState, setCityQueryState] = useState('');
  const [candidateCities, setCandidateCities] = useState<CityCandidate[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityCandidate | null>(null);
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
      setStatusMessage({ kind: 'search-info', text: 'Enter a city name to search.' });
      return;
    }

    setStatusMessage({ kind: 'search-loading', text: 'Searching cities...' });

    try {
      const cities = await searchMutation.mutateAsync(query);

      if (cities.length === 0) {
        setCandidateCities([]);
        setStatusMessage({ kind: 'search-error', text: 'No city found for this query.' });
        return;
      }

      if (cities.length === 1) {
        await selectCity(cities[0]);
        return;
      }

      setCandidateCities(cities);
      setStatusMessage(null);
    } catch (error) {
      setCandidateCities([]);
      setStatusMessage({
        kind: 'search-error',
        text: error instanceof Error ? error.message : 'Failed to search cities.',
      });
    }
  }, [cityQueryState, searchMutation, selectCity, setStatusMessage]);

  return {
    cityQuery: cityQueryState,
    candidateCities,
    selectedCity,
    isSearching: searchMutation.isPending,
    hasUserInteractionRef,
    setCityQuery,
    setSelectedCity,
    setCandidateCities,
    selectCity,
    search,
  };
};
