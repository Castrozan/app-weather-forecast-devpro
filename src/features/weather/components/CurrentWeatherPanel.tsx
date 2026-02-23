'use client';

import clsx from 'clsx';
import { Droplets, Thermometer, ThermometerSnowflake, Wind } from 'lucide-react';

import { temperatureUnitSymbol, windSpeedUnitLabel } from '@/features/weather/units';
import type { TemperatureUnit, WeatherResponse } from '@/features/weather/types';

import { resolveWeatherIconClass } from '@/features/weather/icons/weatherIconClass';

type CurrentWeatherPanelProps = {
  weather: WeatherResponse;
  onToggleUnits: (unit: TemperatureUnit) => void;
  controlsDisabled: boolean;
};

const resolveNextUnit = (current: TemperatureUnit): TemperatureUnit =>
  current === 'metric' ? 'imperial' : 'metric';

export const CurrentWeatherPanel = ({
  weather,
  onToggleUnits,
  controlsDisabled,
}: CurrentWeatherPanelProps) => {
  const unitSymbol = temperatureUnitSymbol(weather.units);
  const nextUnit = resolveNextUnit(weather.units);
  const nextLabel = temperatureUnitSymbol(nextUnit);

  return (
    <section className="current-weather" aria-label="Current weather">
      <div className="current-main">
        <span className="current-icon">
          <i
            className={clsx('wi', resolveWeatherIconClass(weather.current.icon))}
            aria-hidden="true"
          />
        </span>
        <h2 className="current-city">{weather.location.name}</h2>
        <p className="current-temp">
          {weather.current.temperature}°
          <button
            className="current-unit-toggle"
            onClick={() => onToggleUnits(nextUnit)}
            disabled={controlsDisabled}
            aria-label={`Switch to °${nextLabel}`}
            title={`Switch to °${nextLabel}`}
          >
            {unitSymbol}
          </button>
        </p>
        <p className="current-kicker">
          {weather.location.country} · {weather.location.lat.toFixed(2)} /{' '}
          {weather.location.lon.toFixed(2)}
        </p>
        <p className="current-description">{weather.current.description}</p>
      </div>
      <dl className="current-stats">
        <div className="current-stat">
          <dt>
            <ThermometerSnowflake size={14} aria-hidden="true" />
            Min
          </dt>
          <dd>
            {weather.current.min}°{unitSymbol}
          </dd>
        </div>
        <div className="current-stat">
          <dt>
            <Thermometer size={14} aria-hidden="true" />
            Max
          </dt>
          <dd>
            {weather.current.max}°{unitSymbol}
          </dd>
        </div>
        <div className="current-stat">
          <dt>
            <Droplets size={14} aria-hidden="true" />
            Humidity
          </dt>
          <dd>{weather.current.humidity}%</dd>
        </div>
        <div className="current-stat">
          <dt>
            <Wind size={14} aria-hidden="true" />
            Wind
          </dt>
          <dd>
            {weather.current.windSpeed} {windSpeedUnitLabel(weather.units)}
          </dd>
        </div>
      </dl>
    </section>
  );
};
