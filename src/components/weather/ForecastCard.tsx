import type { ForecastDay, TemperatureUnit } from '@/types/weather';
import { resolveWeatherIconGlyph } from './weatherIconGlyph';

type ForecastCardProps = {
  forecast: ForecastDay;
  units: TemperatureUnit;
};

const unitSymbol = (units: TemperatureUnit): string => {
  return units === 'metric' ? 'C' : 'F';
};

export const ForecastCard = ({ forecast, units }: ForecastCardProps) => {
  return (
    <article className="forecast-card">
      <h4 className="forecast-label">{forecast.label}</h4>
      <span className="forecast-icon" aria-hidden="true">
        {resolveWeatherIconGlyph(forecast.icon)}
      </span>
      <p className="forecast-description">{forecast.description}</p>
      <div className="forecast-minmax-grid">
        <p className="forecast-minmax">
          Min {forecast.min}°{unitSymbol(units)}
        </p>
        <p className="forecast-minmax">
          Max {forecast.max}°{unitSymbol(units)}
        </p>
      </div>
    </article>
  );
};
