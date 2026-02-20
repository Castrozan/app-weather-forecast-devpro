'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { weatherApiClient } from '@/services/client/weatherApiClient';
import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/types/weather';

export type WeatherAppState = {
  cityQuery: string;
  selectedCity: CityCandidate | null;
  candidateCities: CityCandidate[];
  units: TemperatureUnit;
  weather: WeatherResponse | null;
  statusMessage: string | null;
  isSearching: boolean;
  isLoadingWeather: boolean;
  setCityQuery: (value: string) => void;
  setUnits: (value: TemperatureUnit) => Promise<void>;
  search: () => Promise<void>;
  selectCity: (city: CityCandidate) => Promise<void>;
};

const EMPTY_STATE_MESSAGE = 'Search for a city to see weather details.';

export const useWeatherApp = (defaultUnit: TemperatureUnit = 'metric'): WeatherAppState => {
  const [cityQuery, setCityQuery] = useState('');
  const [units, setUnitsState] = useState<TemperatureUnit>(defaultUnit);
  const [selectedCity, setSelectedCity] = useState<CityCandidate | null>(null);
  const [candidateCities, setCandidateCities] = useState<CityCandidate[]>([]);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(EMPTY_STATE_MESSAGE);

  const searchMutation = useMutation({
    mutationFn: weatherApiClient.fetchCities,
  });

  const weatherMutation = useMutation({
    mutationFn: ({
      lat,
      lon,
      units: nextUnits,
      city,
      country,
    }: {
      lat: number;
      lon: number;
      units: TemperatureUnit;
      city: string;
      country: string;
    }) => weatherApiClient.fetchWeather(lat, lon, nextUnits, { city, country }),
  });

  const loadWeatherForCity = async (
    city: CityCandidate,
    nextUnits: TemperatureUnit,
  ): Promise<void> => {
    setStatusMessage('Loading weather...');

    try {
      const weatherData = await weatherMutation.mutateAsync({
        lat: city.lat,
        lon: city.lon,
        units: nextUnits,
        city: city.name,
        country: city.country,
      });
      setWeather(weatherData);
      setStatusMessage(null);
    } catch (error) {
      setWeather(null);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to load weather data.');
    }
  };

  const selectCity = async (city: CityCandidate): Promise<void> => {
    setSelectedCity(city);
    setCandidateCities([]);
    await loadWeatherForCity(city, units);
  };

  const search = async (): Promise<void> => {
    const query = cityQuery.trim();

    if (!query) {
      setStatusMessage('Enter a city name to search.');
      return;
    }

    setStatusMessage('Searching cities...');

    try {
      const cities = await searchMutation.mutateAsync(query);

      if (cities.length === 0) {
        setCandidateCities([]);
        setWeather(null);
        setSelectedCity(null);
        setStatusMessage('No city found for this query.');
        return;
      }

      if (cities.length === 1) {
        await selectCity(cities[0]);
        return;
      }

      setCandidateCities(cities);
      setSelectedCity(null);
      setWeather(null);
      setStatusMessage('Multiple matches found. Select the correct city.');
    } catch (error) {
      setCandidateCities([]);
      setWeather(null);
      setSelectedCity(null);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to search cities.');
    }
  };

  const setUnits = async (nextUnit: TemperatureUnit): Promise<void> => {
    setUnitsState(nextUnit);

    if (!selectedCity) {
      return;
    }

    await loadWeatherForCity(selectedCity, nextUnit);
  };

  return {
    cityQuery,
    selectedCity,
    candidateCities,
    units,
    weather,
    statusMessage,
    isSearching: searchMutation.isPending,
    isLoadingWeather: weatherMutation.isPending,
    setCityQuery,
    setUnits,
    search,
    selectCity,
  };
};
