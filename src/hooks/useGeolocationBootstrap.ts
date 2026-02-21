'use client';

import { useEffect, useRef } from 'react';

import { DEFAULT_CITY } from '@/lib/defaultCity';
import type { StatusMessage } from '@/lib/statusMessage';
import { requestUserCoordinates } from '@/services/client/location/requestUserCoordinates';
import type { CityCandidate, TemperatureUnit } from '@/types/weather';

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
      loadingMessage?: StatusMessage;
      preserveWeatherOnError?: boolean;
      suppressErrorStatus?: boolean;
    },
  ) => Promise<void>;
};

export const useGeolocationBootstrap = ({
  currentUnitsRef,
  hasUserInteractionRef,
  setSelectedCity,
  setCandidateCities,
  loadWeatherForCity,
}: GeolocationBootstrapDependencies): void => {
  const hasInitializedRef = useRef(false);
  const hasLoadedDefaultWeatherRef = useRef(false);
  const hasAttemptedGeolocationRef = useRef(false);

  const loadWeatherForCityRef = useRef(loadWeatherForCity);
  loadWeatherForCityRef.current = loadWeatherForCity;

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
          const coordinates = await requestUserCoordinates();

          if (!coordinates || hasUserInteractionRef.current) {
            return;
          }

          const localCity = toLocalCityCandidate(coordinates.lat, coordinates.lon);
          setSelectedCity(localCity);
          setCandidateCities([]);
          await loadWeatherForCityRef.current(localCity, currentUnitsRef.current, {
            loadingMessage: { kind: 'weather-loading', text: 'Loading local weather...' },
            preserveWeatherOnError: true,
            suppressErrorStatus: true,
          });
        })();
      }, LAZY_GEOLOCATION_DELAY_MS);
    };

    const initialize = async () => {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        setSelectedCity(DEFAULT_CITY);
        setCandidateCities([]);

        try {
          await loadWeatherForCityRef.current(DEFAULT_CITY, currentUnitsRef.current);
        } finally {
          hasLoadedDefaultWeatherRef.current = true;
        }
      }

      scheduleGeolocationAttempt();
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
