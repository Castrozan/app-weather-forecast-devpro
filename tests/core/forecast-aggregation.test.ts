import { describe, expect, it } from 'vitest';

import {
  aggregateForecastByDay,
  type OpenWeatherForecastEntry,
} from '@/services/server/forecast/aggregateForecastByDay';

const toUnix = (iso: string): number => Math.floor(new Date(iso).getTime() / 1000);

describe('aggregateForecastByDay', () => {
  it('groups 3-hour entries by day and returns min/max values', () => {
    const entries: OpenWeatherForecastEntry[] = [
      {
        dt: toUnix('2026-02-20T00:00:00Z'),
        main: { temp_min: 7, temp_max: 11 },
        weather: [{ icon: '10d', description: 'light rain' }],
      },
      {
        dt: toUnix('2026-02-20T12:00:00Z'),
        main: { temp_min: 9, temp_max: 18 },
        weather: [{ icon: '01d', description: 'clear sky' }],
      },
      {
        dt: toUnix('2026-02-21T03:00:00Z'),
        main: { temp_min: 6, temp_max: 10 },
        weather: [{ icon: '04n', description: 'broken clouds' }],
      },
      {
        dt: toUnix('2026-02-21T15:00:00Z'),
        main: { temp_min: 11, temp_max: 19 },
        weather: [{ icon: '03d', description: 'scattered clouds' }],
      },
    ];

    const result = aggregateForecastByDay(entries, 0, 5);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      date: '2026-02-20',
      min: 7,
      max: 18,
      icon: '01d',
      description: 'clear sky',
    });
    expect(result[1]).toMatchObject({
      date: '2026-02-21',
      min: 6,
      max: 19,
      icon: '03d',
      description: 'scattered clouds',
    });
  });

  it('respects the days limit and sorts ascending by date', () => {
    const entries: OpenWeatherForecastEntry[] = [
      {
        dt: toUnix('2026-02-25T12:00:00Z'),
        main: { temp_min: 10, temp_max: 15 },
        weather: [{ icon: '01d', description: 'clear sky' }],
      },
      {
        dt: toUnix('2026-02-23T12:00:00Z'),
        main: { temp_min: 8, temp_max: 14 },
        weather: [{ icon: '01d', description: 'clear sky' }],
      },
      {
        dt: toUnix('2026-02-24T12:00:00Z'),
        main: { temp_min: 9, temp_max: 13 },
        weather: [{ icon: '01d', description: 'clear sky' }],
      },
    ];

    const result = aggregateForecastByDay(entries, 0, 2);

    expect(result).toHaveLength(2);
    expect(result[0]?.date).toBe('2026-02-23');
    expect(result[1]?.date).toBe('2026-02-24');
  });

  it('applies timezone offset when grouping by date', () => {
    const entries: OpenWeatherForecastEntry[] = [
      {
        dt: toUnix('2026-02-20T23:00:00Z'),
        main: { temp_min: 5, temp_max: 9 },
        weather: [{ icon: '10n', description: 'rain' }],
      },
    ];

    const plusTwoHours = 2 * 60 * 60;
    const result = aggregateForecastByDay(entries, plusTwoHours, 5);

    expect(result[0]?.date).toBe('2026-02-21');
  });
});
