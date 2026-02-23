import { describe, expect, it } from 'vitest';

import { parseWeatherQuery } from '@/services/server/validation/parseWeatherQuery';

describe('parseWeatherQuery', () => {
  it('parses valid query params', () => {
    const result = parseWeatherQuery(
      new URLSearchParams({
        lat: '41.8755616',
        lon: '-87.6244212',
        units: 'metric',
      }),
    );

    expect(result).toEqual({
      lat: 41.8755616,
      lon: -87.6244212,
      units: 'metric',
    });
  });

  it('defaults units to metric when omitted', () => {
    const result = parseWeatherQuery(new URLSearchParams({ lat: '1', lon: '2' }));

    expect(result.units).toBe('metric');
  });

  it('throws for invalid coordinates or units', () => {
    expect(() => parseWeatherQuery(new URLSearchParams({ lat: 'abc', lon: '2' }))).toThrow(
      'Invalid weather query parameters',
    );

    expect(() =>
      parseWeatherQuery(new URLSearchParams({ lat: '1', lon: '2', units: 'kelvin' })),
    ).toThrow('Invalid weather query parameters');
  });
});
