import { describe, expect, it } from 'vitest';

import { toValidatedTemperatureUnit } from '@/config/appConfig';

describe('toValidatedTemperatureUnit', () => {
  it('returns metric for the string "metric"', () => {
    expect(toValidatedTemperatureUnit('metric')).toBe('metric');
  });

  it('returns imperial for the string "imperial"', () => {
    expect(toValidatedTemperatureUnit('imperial')).toBe('imperial');
  });

  it('returns metric for an unrecognized string', () => {
    expect(toValidatedTemperatureUnit('celsius')).toBe('metric');
    expect(toValidatedTemperatureUnit('fahrenheit')).toBe('metric');
    expect(toValidatedTemperatureUnit('METRIC')).toBe('metric');
  });

  it('returns metric for undefined', () => {
    expect(toValidatedTemperatureUnit(undefined)).toBe('metric');
  });
});
