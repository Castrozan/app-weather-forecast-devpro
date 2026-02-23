'use client';

import { useEffect, useRef } from 'react';

import { DEFAULT_CITY } from '@/config/defaultCity';
import {
  queryGeolocationPermission,
  requestUserCoordinates,
} from '@/features/geolocation/requestUserCoordinates';
import type { CityCandidate, TemperatureUnit } from '@/features/weather/types';

const LOCAL_CITY_NAME = 'Near You';
const LOCAL_COUNTRY_NAME = 'Local';
const LAZY_GEOLOCATION_DELAY_MS = 1_600;

const toLocalCityCandidate = (lat: number, lon: number): CityCandidate => ({
  id: `${lat.toFixed(4)},${lon.toFixed(4)}`,
  name: LOCAL_CITY_NAME,
  country: LOCAL_COUNTRY_NAME,
  lat,
  lon,
  displayName: LOCAL_CITY_NAME,
});

type GeolocationBootstrapDependencies = {
  currentUnitsRef: React.MutableRefObject<TemperatureUnit>;
  hasUserInteractionRef: React.MutableRefObject<boolean>;
  setSelectedCity: (city: CityCandidate) => void;
  setCandidateCities: (cities: CityCandidate[]) => void;
  loadWeatherForCity: (
    city: CityCandidate,
    nextUnits: TemperatureUnit,
    options?: {
      preserveWeatherOnError?: boolean;
    },
  ) => Promise<void>;
};

const loadLocalWeather = async (
  loadWeatherForCity: GeolocationBootstrapDependencies['loadWeatherForCity'],
  setSelectedCity: GeolocationBootstrapDependencies['setSelectedCity'],
  setCandidateCities: GeolocationBootstrapDependencies['setCandidateCities'],
  currentUnitsRef: GeolocationBootstrapDependencies['currentUnitsRef'],
  options?: { preserveWeatherOnError?: boolean },
): Promise<boolean> => {
  const coordinates = await requestUserCoordinates();

  if (!coordinates) {
    return false;
  }

  const localCity = toLocalCityCandidate(coordinates.lat, coordinates.lon);
  setSelectedCity(localCity);
  setCandidateCities([]);
  await loadWeatherForCity(localCity, currentUnitsRef.current, options);
  return true;
};

export const useGeolocationBootstrap = ({
  currentUnitsRef,
  hasUserInteractionRef,
  setSelectedCity,
  setCandidateCities,
  loadWeatherForCity,
}: GeolocationBootstrapDependencies): void => {
  const hasInitializedRef = useRef(false);
  const hasAttemptedGeolocationRef = useRef(false);

  const loadWeatherForCityRef = useRef(loadWeatherForCity);
  useEffect(() => {
    loadWeatherForCityRef.current = loadWeatherForCity;
  }, [loadWeatherForCity]);

  useEffect(() => {
    let isMounted = true;
    let geolocationTimerId: number | null = null;

    const scheduleGeolocationAttempt = () => {
      if (!isMounted || typeof window === 'undefined') {
        return;
      }

      geolocationTimerId = window.setTimeout(() => {
        if (hasAttemptedGeolocationRef.current || hasUserInteractionRef.current) {
          return;
        }

        hasAttemptedGeolocationRef.current = true;

        void (async () => {
          if (hasUserInteractionRef.current) {
            return;
          }

          const succeeded = await loadLocalWeather(
            loadWeatherForCityRef.current,
            setSelectedCity,
            setCandidateCities,
            currentUnitsRef,
            { preserveWeatherOnError: true },
          );

          if (!succeeded) {
            return;
          }
        })();
      }, LAZY_GEOLOCATION_DELAY_MS);
    };

    const initialize = async () => {
      if (hasInitializedRef.current) {
        return;
      }

      hasInitializedRef.current = true;

      const permissionState = await queryGeolocationPermission();
      const locationAlreadyGranted = permissionState === 'granted';

      if (locationAlreadyGranted) {
        hasAttemptedGeolocationRef.current = true;
        const succeeded = await loadLocalWeather(
          loadWeatherForCityRef.current,
          setSelectedCity,
          setCandidateCities,
          currentUnitsRef,
        );

        if (succeeded) {
          return;
        }
      }

      setSelectedCity(DEFAULT_CITY);
      setCandidateCities([]);
      await loadWeatherForCityRef.current(DEFAULT_CITY, currentUnitsRef.current);

      if (!locationAlreadyGranted) {
        scheduleGeolocationAttempt();
      }
    };

    void initialize();

    return () => {
      isMounted = false;

      if (geolocationTimerId !== null) {
        window.clearTimeout(geolocationTimerId);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
