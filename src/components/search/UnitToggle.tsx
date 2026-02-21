'use client';

import type { TemperatureUnit } from '@/types/weather';

type UnitToggleProps = {
  value: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
  disabled?: boolean;
};

export const UnitToggle = ({ value, onChange, disabled }: UnitToggleProps) => {
  const nextUnit: TemperatureUnit = value === 'metric' ? 'imperial' : 'metric';
  const currentLabel = value === 'metric' ? '°C' : '°F';
  const nextLabel = value === 'metric' ? '°F' : '°C';

  return (
    <button
      className="unit-toggle-button"
      onClick={() => onChange(nextUnit)}
      disabled={disabled}
      aria-label={`Switch to ${nextLabel}`}
      title={`Switch to ${nextLabel}`}
    >
      {currentLabel}
    </button>
  );
};
