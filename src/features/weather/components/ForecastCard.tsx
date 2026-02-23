import clsx from 'clsx';

import { temperatureUnitSymbol } from '@/features/weather/units';
import type { ForecastDay, TemperatureUnit } from '@/features/weather/types';
import { resolveWeatherIconClass } from '@/features/weather/icons/weatherIconClass';

type ForecastCardProps = {
  forecast: ForecastDay;
  units: TemperatureUnit;
};

export const ForecastCard = ({ forecast, units }: ForecastCardProps) => {
  const unitSymbol = temperatureUnitSymbol(units);

  return (
    <article className="forecast-card">
      <h4 className="forecast-label">{forecast.label}</h4>
      <span className="forecast-icon">
        <i className={clsx('wi', resolveWeatherIconClass(forecast.icon))} aria-hidden="true" />
      </span>
      <p className="forecast-description">{forecast.description}</p>
      <div className="forecast-minmax-grid">
        <p className="forecast-minmax">
          Min {forecast.min}°{unitSymbol}
        </p>
        <p className="forecast-minmax">
          Max {forecast.max}°{unitSymbol}
        </p>
      </div>
    </article>
  );
};
