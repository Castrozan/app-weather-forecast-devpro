import type { CityCandidate } from '@/features/weather/types';
import type { WeatherProviderCity } from '@/features/weather/providers/weatherProviderPort';

const buildDisplayName = ({ name, state, country }: WeatherProviderCity): string => {
  return [name, state, country].filter(Boolean).join(', ');
};

export const mapCityCandidates = (entries: WeatherProviderCity[]): CityCandidate[] => {
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
