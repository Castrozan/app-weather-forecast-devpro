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
      <label>
        <input
          type="radio"
          name="units"
          value="metric"
          checked={value === 'metric'}
          onChange={() => onChange('metric')}
          disabled={disabled}
        />
        C
      </label>
      <label>
        <input
          type="radio"
          name="units"
          value="imperial"
          checked={value === 'imperial'}
          onChange={() => onChange('imperial')}
          disabled={disabled}
        />
        F
      </label>
    </fieldset>
  );
};
