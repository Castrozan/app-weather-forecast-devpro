'use client';

import { useWeatherApp } from '@/hooks/useWeatherApp';
import {
  isErrorStatusMessage,
  isSearchStatusMessage,
  isTransientStatusMessage,
} from '@/lib/statusMessage';
import type { TemperatureUnit } from '@/types/weather';

import { CityCandidatesList } from '../search/CityCandidatesList';
import { SearchForm } from '../search/SearchForm';
import { UnitToggle } from '../search/UnitToggle';
import { ForecastGrid } from '../weather/ForecastGrid';
import { CurrentWeatherPanel } from '../weather/CurrentWeatherPanel';
import { WeatherPanelSkeleton } from '../weather/WeatherPanelSkeleton';
import { Disclaimer } from './Disclaimer';
import { StatusState } from './StatusState';

type WeatherDashboardProps = {
  defaultUnit: TemperatureUnit;
};

export const WeatherDashboard = ({ defaultUnit }: WeatherDashboardProps) => {
  const app = useWeatherApp(defaultUnit);
  const searchStatusMessage =
    app.statusMessage !== null && isSearchStatusMessage(app.statusMessage)
      ? app.statusMessage
      : null;
  const weatherStatusMessage =
    app.statusMessage !== null && !isSearchStatusMessage(app.statusMessage)
      ? app.statusMessage
      : null;
  const hasTransientStatus =
    app.statusMessage !== null && isTransientStatusMessage(app.statusMessage);
  const shouldShowSkeleton =
    app.isLoadingWeather ||
    (!app.weather && (app.isSearching || hasTransientStatus || !weatherStatusMessage));
  const weatherContentKey = app.weather
    ? `${app.weather.location.lat},${app.weather.location.lon},${app.weather.current.temperature},${app.weather.units}`
    : 'empty-weather-content';
  const weatherData = app.weather;
  const hasWeather = weatherData !== null;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-header">
          <p className="sidebar-kicker">Live Forecast</p>
          <h1 className="sidebar-title">City Search</h1>
        </header>
        <SearchForm
          value={app.cityQuery}
          onChange={app.setCityQuery}
          onSubmit={() => {
            void app.search();
          }}
          disabled={app.isSearching || app.isLoadingWeather}
        />
        <UnitToggle
          value={app.units}
          onChange={(unit) => {
            void app.setUnits(unit);
          }}
          disabled={app.isSearching || app.isLoadingWeather}
        />
        <StatusState
          message={searchStatusMessage?.text ?? null}
          isError={searchStatusMessage ? isErrorStatusMessage(searchStatusMessage) : false}
          className="sidebar-status-message"
        />
        <CityCandidatesList
          cities={app.candidateCities}
          onSelect={(city) => {
            void app.selectCity(city);
          }}
        />
      </aside>

      <section className="weather-panel">
        <header className="panel-header">
          <h2 className="panel-title">Weather</h2>
          <p className="panel-subtitle">Current conditions and daily outlook</p>
        </header>
        <StatusState
          message={weatherStatusMessage?.text ?? null}
          isError={weatherStatusMessage ? isErrorStatusMessage(weatherStatusMessage) : false}
        />
        <div className="weather-stage">
          {weatherData ? (
            <div
              className={`weather-content weather-content-visible ${app.isLoadingWeather ? 'weather-content-loading' : ''}`}
              key={weatherContentKey}
            >
              <CurrentWeatherPanel weather={weatherData} />
              <ForecastGrid weather={weatherData} />
            </div>
          ) : null}
          {shouldShowSkeleton ? (
            <div
              className={`weather-skeleton-layer ${hasWeather ? 'weather-skeleton-overlay' : ''}`}
            >
              <WeatherPanelSkeleton />
            </div>
          ) : null}
        </div>
        <Disclaimer />
      </section>
    </main>
  );
};
