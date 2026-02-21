import { describe, expect, it } from 'vitest';

import { temperatureUnitSymbol, windSpeedUnitLabel } from '@/lib/weatherUnits';

describe('temperatureUnitSymbol', () => {
  it('returns C for metric', () => {
    expect(temperatureUnitSymbol('metric')).toBe('C');
  });

  it('returns F for imperial', () => {
    expect(temperatureUnitSymbol('imperial')).toBe('F');
  });
});

describe('windSpeedUnitLabel', () => {
  it('returns km/h for metric', () => {
    expect(windSpeedUnitLabel('metric')).toBe('km/h');
  });

  it('returns mph for imperial', () => {
    expect(windSpeedUnitLabel('imperial')).toBe('mph');
  });
});
