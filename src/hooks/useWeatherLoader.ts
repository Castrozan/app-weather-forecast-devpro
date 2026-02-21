'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { withMinimumDuration } from '@/lib/minimumDuration';
import type { StatusMessage } from '@/lib/statusMessage';
import { weatherApiClient } from '@/services/client/weatherApiClient';
import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/types/weather';

const MIN_WEATHER_LOADING_DURATION_MS = 500;

type LoadWeatherOptions = {
  preserveWeatherOnError?: boolean;
  suppressErrorStatus?: boolean;
};

export type WeatherLoaderState = {
  weather: WeatherResponse | null;
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

export const useWeatherLoader = (
  defaultUnit: TemperatureUnit,
  setStatusMessage: (message: StatusMessage | null) => void,
): WeatherLoaderState => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
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
    }) =>
      withMinimumDuration(
        () => weatherApiClient.fetchWeather(lat, lon, nextUnits, { city, country }),
        MIN_WEATHER_LOADING_DURATION_MS,
      ),
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
        setStatusMessage(null);
      } catch (error) {
        if (!options.preserveWeatherOnError) {
          setWeather(null);
        }

        if (!options.suppressErrorStatus) {
          setStatusMessage({
            kind: 'weather-error',
            text: error instanceof Error ? error.message : 'Failed to load weather data.',
          });
        }
      }
    },
    [weatherMutation, setStatusMessage],
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
    units,
    isLoadingWeather: weatherMutation.isPending,
    currentUnitsRef,
    loadWeatherForCity,
    setUnits,
  };
};
