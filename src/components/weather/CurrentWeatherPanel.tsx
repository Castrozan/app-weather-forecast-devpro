import type { WeatherResponse } from '@/types/weather';

import { resolveWeatherIconClass } from './weatherIconClass';

type CurrentWeatherPanelProps = {
  weather: WeatherResponse;
};

const unitSymbol = (units: WeatherResponse['units']): string => {
  return units === 'metric' ? 'C' : 'F';
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
            {weather.current.temperature}°{unitSymbol(weather.units)}
          </p>
        </div>
      </div>
      <dl className="current-stats">
        <div className="current-stat">
          <dt>Min</dt>
          <dd>
            {weather.current.min}°{unitSymbol(weather.units)}
          </dd>
        </div>
        <div className="current-stat">
          <dt>Max</dt>
          <dd>
            {weather.current.max}°{unitSymbol(weather.units)}
          </dd>
        </div>
        <div className="current-stat">
          <dt>Humidity</dt>
          <dd>{weather.current.humidity}%</dd>
        </div>
        <div className="current-stat">
          <dt>Wind</dt>
          <dd>{weather.current.windSpeed}</dd>
        </div>
      </dl>
    </section>
  );
};
