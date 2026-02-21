import type { TemperatureUnit } from '@/types/weather';

export const temperatureUnitSymbol = (units: TemperatureUnit): string => {
  return units === 'metric' ? 'C' : 'F';
};

export const windSpeedUnitLabel = (units: TemperatureUnit): string => {
  return units === 'metric' ? 'km/h' : 'mph';
};
