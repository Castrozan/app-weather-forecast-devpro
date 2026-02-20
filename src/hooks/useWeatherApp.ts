'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { DEFAULT_CITY } from '@/lib/defaultCity';
import { withMinimumDuration } from '@/lib/minimumDuration';
import { requestUserCoordinates } from '@/services/client/location/requestUserCoordinates';
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

const LOCAL_CITY_NAME = 'Near You';
const LOCAL_COUNTRY_NAME = 'Local';
const LAZY_GEOLOCATION_DELAY_MS = 1_600;
const MIN_WEATHER_LOADING_DURATION_MS = 500;

type LoadWeatherOptions = {
  loadingMessage?: string;
  preserveWeatherOnError?: boolean;
  suppressErrorStatus?: boolean;
};

const toLocalCityCandidate = (lat: number, lon: number): CityCandidate => {
  return {
    id: `${lat.toFixed(4)},${lon.toFixed(4)}`,
    name: LOCAL_CITY_NAME,
    country: LOCAL_COUNTRY_NAME,
    lat,
    lon,
    displayName: LOCAL_CITY_NAME,
  };
};

export const useWeatherApp = (defaultUnit: TemperatureUnit = 'metric'): WeatherAppState => {
  const [cityQueryState, setCityQueryState] = useState('');
  const [units, setUnitsState] = useState<TemperatureUnit>(defaultUnit);
  const [selectedCity, setSelectedCity] = useState<CityCandidate | null>(null);
  const [candidateCities, setCandidateCities] = useState<CityCandidate[]>([]);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
  const hasLoadedDefaultWeatherRef = useRef(false);
  const hasAttemptedGeolocationRef = useRef(false);
  const hasUserInteractionRef = useRef(false);

  const setCityQuery = useCallback((value: string): void => {
    hasUserInteractionRef.current = true;
    setCityQueryState(value);
  }, []);

  const searchMutation = useMutation({
    mutationFn: weatherApiClient.fetchCities,
  });

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
      setStatusMessage(options.loadingMessage ?? 'Loading weather...');

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
          setStatusMessage(error instanceof Error ? error.message : 'Failed to load weather data.');
        }
      }
    },
    [weatherMutation],
  );

  const selectCity = async (city: CityCandidate): Promise<void> => {
    hasUserInteractionRef.current = true;
    setSelectedCity(city);
    setCandidateCities([]);
    setCityQueryState(city.name);
    await loadWeatherForCity(city, units);
  };

  const search = async (): Promise<void> => {
    hasUserInteractionRef.current = true;
    const query = cityQueryState.trim();

    if (!query) {
      setStatusMessage('Enter a city name to search.');
      return;
    }

    setStatusMessage('Searching cities...');

    try {
      const cities = await searchMutation.mutateAsync(query);

      if (cities.length === 0) {
        setCandidateCities([]);
        setStatusMessage('No city found for this query.');
        return;
      }

      if (cities.length === 1) {
        await selectCity(cities[0]);
        return;
      }

      setCandidateCities(cities);
      setStatusMessage('Multiple matches found. Select the correct city.');
    } catch (error) {
      setCandidateCities([]);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to search cities.');
    }
  };

  const setUnits = async (nextUnit: TemperatureUnit): Promise<void> => {
    hasUserInteractionRef.current = true;
    setUnitsState(nextUnit);

    if (!selectedCity) {
      return;
    }

    await loadWeatherForCity(selectedCity, nextUnit);
  };

  useEffect(() => {
    let isMounted = true;
    let geolocationTimerId: number | null = null;

    const initialize = async () => {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        setSelectedCity(DEFAULT_CITY);
        setCandidateCities([]);
        setCityQueryState(DEFAULT_CITY.name);

        try {
          await loadWeatherForCity(DEFAULT_CITY, units);
        } finally {
          hasLoadedDefaultWeatherRef.current = true;
        }
      }

      if (!isMounted || !hasLoadedDefaultWeatherRef.current || typeof window === 'undefined') {
        return;
      }

      geolocationTimerId = window.setTimeout(() => {
        if (hasAttemptedGeolocationRef.current || hasUserInteractionRef.current) {
          return;
        }

        hasAttemptedGeolocationRef.current = true;

        void (async () => {
          const coordinates = await requestUserCoordinates();

          if (!coordinates || hasUserInteractionRef.current) {
            return;
          }

          const localCity = toLocalCityCandidate(coordinates.lat, coordinates.lon);
          setSelectedCity(localCity);
          setCandidateCities([]);
          setCityQueryState(localCity.name);
          await loadWeatherForCity(localCity, units, {
            loadingMessage: 'Loading local weather...',
            preserveWeatherOnError: true,
            suppressErrorStatus: true,
          });
        })();
      }, LAZY_GEOLOCATION_DELAY_MS);
    };

    void initialize();

    return () => {
      isMounted = false;

      if (geolocationTimerId !== null) {
        window.clearTimeout(geolocationTimerId);
      }
    };
  }, [loadWeatherForCity, units]);

  return {
    cityQuery: cityQueryState,
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
