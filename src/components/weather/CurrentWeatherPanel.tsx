import { temperatureUnitSymbol, windSpeedUnitLabel } from '@/lib/weatherUnits';
import type { WeatherResponse } from '@/types/weather';

import { resolveWeatherIconClass } from './weatherIconClass';

type CurrentWeatherPanelProps = {
  weather: WeatherResponse;
};

export const CurrentWeatherPanel = ({ weather }: CurrentWeatherPanelProps) => {
  return (
    <section className="current-weather" aria-label="Current weather">
      <div className="current-main">
        <div>
          <p className="current-kicker">
            {weather.location.country} · {weather.location.lat.toFixed(2)} /{' '}
            {weather.location.lon.toFixed(2)}
          </p>
          <h2 className="current-city">{weather.location.name}</h2>
          <p className="current-description">{weather.current.description}</p>
        </div>
        <div className="current-temperature">
          <span className="current-icon">
            <i
              className={`wi ${resolveWeatherIconClass(weather.current.icon)}`}
              aria-hidden="true"
            />
          </span>
          <p className="current-temp">
            {weather.current.temperature}°{temperatureUnitSymbol(weather.units)}
          </p>
        </div>
      </div>
      <dl className="current-stats">
        <div className="current-stat">
          <dt>Min</dt>
          <dd>
            {weather.current.min}°{temperatureUnitSymbol(weather.units)}
          </dd>
        </div>
        <div className="current-stat">
          <dt>Max</dt>
          <dd>
            {weather.current.max}°{temperatureUnitSymbol(weather.units)}
          </dd>
        </div>
        <div className="current-stat">
          <dt>Humidity</dt>
          <dd>{weather.current.humidity}%</dd>
        </div>
        <div className="current-stat">
          <dt>Wind</dt>
          <dd>
            {weather.current.windSpeed} {windSpeedUnitLabel(weather.units)}
          </dd>
        </div>
      </dl>
    </section>
  );
};
