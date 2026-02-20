'use client';

import type { TemperatureUnit } from '@/types/weather';

type UnitToggleProps = {
  value: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
  disabled?: boolean;
};

export const UnitToggle = ({ value, onChange, disabled }: UnitToggleProps) => {
  return (
    <fieldset className="unit-toggle" aria-label="Temperature unit">
      <legend className="unit-legend">Units</legend>
      <label className={`unit-option ${value === 'metric' ? 'unit-option-active' : ''}`}>
        <input
          type="radio"
          name="units"
          value="metric"
          checked={value === 'metric'}
          onChange={() => onChange('metric')}
          disabled={disabled}
        />
        <span>°C</span>
      </label>
      <label className={`unit-option ${value === 'imperial' ? 'unit-option-active' : ''}`}>
        <input
          type="radio"
          name="units"
          value="imperial"
          checked={value === 'imperial'}
          onChange={() => onChange('imperial')}
          disabled={disabled}
        />
        <span>°F</span>
      </label>
    </fieldset>
  );
};
