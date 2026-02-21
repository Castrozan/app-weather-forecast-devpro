import { describe, expect, it } from 'vitest';

import { mapCityCandidates } from '@/services/server/cities/mapCityCandidates';
import type { WeatherProviderCity } from '@/services/server/weather/ports/weatherProvider';

describe('mapCityCandidates', () => {
  it('normalizes geocode candidates into deterministic city options', () => {
    const input: WeatherProviderCity[] = [
      {
        name: 'Springfield',
        state: 'Illinois',
        country: 'US',
        lat: 39.7989763,
        lon: -89.6443688,
      },
      {
        name: 'Springfield',
        country: 'US',
        lat: 42.1014831,
        lon: -72.589811,
      },
    ];

    const result = mapCityCandidates(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: '39.7989763,-89.6443688',
      displayName: 'Springfield, Illinois, US',
    });
    expect(result[1]).toMatchObject({
      id: '42.1014831,-72.589811',
      displayName: 'Springfield, US',
    });
  });

  it('returns a single candidate when only one result matches', () => {
    const result = mapCityCandidates([
      {
        name: 'Chicago',
        country: 'US',
        lat: 41.8755616,
        lon: -87.6244212,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ displayName: 'Chicago, US' });
  });

  it('deduplicates entries with identical lat/lon coordinates', () => {
    const input: WeatherProviderCity[] = [
      { name: 'London', country: 'GB', lat: 51.5073219, lon: -0.1276474 },
      { name: 'London', country: 'CA', lat: 42.9832406, lon: -81.243372 },
    ];

    const result = mapCityCandidates(input);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.country)).toEqual(['GB', 'CA']);
  });
});
