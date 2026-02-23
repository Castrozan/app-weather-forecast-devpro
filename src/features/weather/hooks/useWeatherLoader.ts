'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { weatherApiClient } from '@/features/weather/api/weatherApiClient';
import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/features/weather/types';

type LoadWeatherOptions = {
  preserveWeatherOnError?: boolean;
};

export type WeatherLoaderState = {
  weather: WeatherResponse | null;
  weatherError: string | null;
  units: TemperatureUnit;
  isLoadingWeather: boolean;
  currentUnitsRef: React.MutableRefObject<TemperatureUnit>;
  loadWeatherForCity: (
    city: CityCandidate,
    nextUnits: TemperatureUnit,
    options?: LoadWeatherOptions,
  ) => Promise<void>;
  setUnits: (nextUnit: TemperatureUnit, selectedCity: CityCandidate | null) => Promise<void>;
};

export const useWeatherLoader = (defaultUnit: TemperatureUnit): WeatherLoaderState => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [units, setUnitsState] = useState<TemperatureUnit>(defaultUnit);
  const currentUnitsRef = useRef<TemperatureUnit>(defaultUnit);

  const weatherMutation = useMutation({
    mutationFn: async ({
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

  const loadWeatherForCity = useCallback(
    async (
      city: CityCandidate,
      nextUnits: TemperatureUnit,
      options: LoadWeatherOptions = {},
    ): Promise<void> => {
      try {
        const weatherData = await weatherMutation.mutateAsync({
          lat: city.lat,
          lon: city.lon,
          units: nextUnits,
          city: city.name,
          country: city.country,
        });
        setWeather(weatherData);
        setWeatherError(null);
      } catch (error) {
        const weatherErrorMessage =
          error instanceof Error ? error.message : 'Failed to load weather data.';
        setWeatherError(weatherErrorMessage);
        toast.error(weatherErrorMessage);
        if (!options.preserveWeatherOnError) {
          setWeather(null);
        }
      }
    },
    [weatherMutation],
  );

  const setUnits = async (
    nextUnit: TemperatureUnit,
    selectedCity: CityCandidate | null,
  ): Promise<void> => {
    currentUnitsRef.current = nextUnit;
    setUnitsState(nextUnit);

    if (!selectedCity) {
      return;
    }

    await loadWeatherForCity(selectedCity, nextUnit);
  };

  return {
    weather,
    weatherError,
    units,
    isLoadingWeather: weatherMutation.isPending,
    currentUnitsRef,
    loadWeatherForCity,
    setUnits,
  };
};
