import type { CityCandidate } from '@/types/weather';

export type OpenWeatherGeocodeEntry = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

const buildDisplayName = ({ name, state, country }: OpenWeatherGeocodeEntry): string => {
  return [name, state, country].filter(Boolean).join(', ');
};

export const mapCityCandidates = (entries: OpenWeatherGeocodeEntry[]): CityCandidate[] => {
  const deduplicated = new Map<string, CityCandidate>();

  for (const entry of entries) {
    const id = `${entry.lat},${entry.lon}`;

    if (deduplicated.has(id)) {
      continue;
    }

    deduplicated.set(id, {
      id,
      name: entry.name,
      state: entry.state,
      country: entry.country,
      lat: entry.lat,
      lon: entry.lon,
      displayName: buildDisplayName(entry),
    });
  }

  return [...deduplicated.values()];
};

export const shouldAutoSelectCity = (cities: CityCandidate[]): CityCandidate | null => {
  return cities.length === 1 ? cities[0] : null;
};
