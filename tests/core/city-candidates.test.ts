import { describe, expect, it } from 'vitest';

import {
  mapCityCandidates,
  shouldAutoSelectCity,
} from '@/services/server/cities/mapCityCandidates';
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

  it('auto-selects only when there is a single option', () => {
    const one = mapCityCandidates([
      {
        name: 'Chicago',
        country: 'US',
        lat: 41.8755616,
        lon: -87.6244212,
      },
    ]);

    const many = mapCityCandidates([
      {
        name: 'London',
        country: 'GB',
        lat: 51.5073219,
        lon: -0.1276474,
      },
      {
        name: 'London',
        country: 'CA',
        lat: 42.9832406,
        lon: -81.243372,
      },
    ]);

    expect(shouldAutoSelectCity(one)?.displayName).toBe('Chicago, US');
    expect(shouldAutoSelectCity(many)).toBeNull();
  });
});
