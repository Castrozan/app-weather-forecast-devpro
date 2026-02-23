import { describe, expect, it } from 'vitest';

import { aggregateForecastByDay } from '@/features/weather/forecast/aggregateForecastByDay';
import type { WeatherProviderForecastEntry } from '@/features/weather/providers/weatherProviderPort';

const toUnix = (iso: string): number => Math.floor(new Date(iso).getTime() / 1000);

describe('aggregateForecastByDay', () => {
  it('groups 3-hour entries by day and returns min/max values', () => {
    const entries: WeatherProviderForecastEntry[] = [
      {
        timestampSeconds: toUnix('2026-02-20T00:00:00Z'),
        minTemperature: 7,
        maxTemperature: 11,
        icon: '10d',
        description: 'light rain',
        isDaylight: false,
      },
      {
        timestampSeconds: toUnix('2026-02-20T12:00:00Z'),
        minTemperature: 9,
        maxTemperature: 18,
        icon: '01d',
        description: 'clear sky',
        isDaylight: true,
      },
      {
        timestampSeconds: toUnix('2026-02-21T03:00:00Z'),
        minTemperature: 6,
        maxTemperature: 10,
        icon: '04n',
        description: 'broken clouds',
        isDaylight: false,
      },
      {
        timestampSeconds: toUnix('2026-02-21T15:00:00Z'),
        minTemperature: 11,
        maxTemperature: 19,
        icon: '03d',
        description: 'scattered clouds',
        isDaylight: true,
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
    const entries: WeatherProviderForecastEntry[] = [
      {
        timestampSeconds: toUnix('2026-02-25T12:00:00Z'),
        minTemperature: 10,
        maxTemperature: 15,
        icon: '01d',
        description: 'clear sky',
        isDaylight: true,
      },
      {
        timestampSeconds: toUnix('2026-02-23T12:00:00Z'),
        minTemperature: 8,
        maxTemperature: 14,
        icon: '01d',
        description: 'clear sky',
        isDaylight: true,
      },
      {
        timestampSeconds: toUnix('2026-02-24T12:00:00Z'),
        minTemperature: 9,
        maxTemperature: 13,
        icon: '01d',
        description: 'clear sky',
        isDaylight: true,
      },
    ];

    const result = aggregateForecastByDay(entries, 0, 2);

    expect(result).toHaveLength(2);
    expect(result[0]?.date).toBe('2026-02-23');
    expect(result[1]?.date).toBe('2026-02-24');
  });

  it('applies timezone offset when grouping by date', () => {
    const entries: WeatherProviderForecastEntry[] = [
      {
        timestampSeconds: toUnix('2026-02-20T23:00:00Z'),
        minTemperature: 5,
        maxTemperature: 9,
        icon: '10n',
        description: 'rain',
        isDaylight: false,
      },
    ];

    const plusTwoHours = 2 * 60 * 60;
    const result = aggregateForecastByDay(entries, plusTwoHours, 5);

    expect(result[0]?.date).toBe('2026-02-21');
  });
});
