import { describe, expect, it } from 'vitest';

import { resolveWeatherIconClass } from '@/shared/icons/weatherIconClass';

describe('resolveWeatherIconClass', () => {
  it('maps day and night icon codes to weather-icons classes', () => {
    expect(resolveWeatherIconClass('01d')).toBe('wi-day-sunny');
    expect(resolveWeatherIconClass('01n')).toBe('wi-night-clear');
    expect(resolveWeatherIconClass('10d')).toBe('wi-day-rain');
    expect(resolveWeatherIconClass('10n')).toBe('wi-night-alt-rain');
    expect(resolveWeatherIconClass('50n')).toBe('wi-fog');
  });

  it('falls back to clear day class for unknown icon codes', () => {
    expect(resolveWeatherIconClass('unknown')).toBe('wi-day-sunny');
  });
});
