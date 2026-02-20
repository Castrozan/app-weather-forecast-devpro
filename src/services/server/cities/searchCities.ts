import { getWeatherProvider } from '@/services/server/weather/resolveWeatherProvider';

import { mapCityCandidates } from './mapCityCandidates';

export const searchCities = async (query: string) => {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const rawCities = await getWeatherProvider().searchCities(trimmed, 5);
  return mapCityCandidates(rawCities);
};
