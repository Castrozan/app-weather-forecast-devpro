import { fetchGeocodedCities } from '@/services/server/openweather/openWeatherClient';

import { mapCityCandidates } from './mapCityCandidates';

export const searchCities = async (query: string) => {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const rawCities = await fetchGeocodedCities(trimmed, 5);
  return mapCityCandidates(rawCities);
};
