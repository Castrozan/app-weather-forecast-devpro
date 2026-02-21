'use client';

import { useWeatherApp } from '@/hooks/useWeatherApp';
import { buildWeatherDashboardViewModel } from '@/lib/weatherDashboardViewModel';
import type { TemperatureUnit } from '@/types/weather';

import { CityCandidatesList } from '../search/CityCandidatesList';
import { SearchForm } from '../search/SearchForm';
import { UnitToggle } from '../search/UnitToggle';
import { ForecastGrid } from '../weather/ForecastGrid';
import { CurrentWeatherPanel } from '../weather/CurrentWeatherPanel';
import { WeatherPanelSkeleton } from '../weather/WeatherPanelSkeleton';
import { SidebarDisclaimer, PanelDisclaimer } from './Disclaimer';

type WeatherDashboardProps = {
  defaultUnit: TemperatureUnit;
};

export const WeatherDashboard = ({ defaultUnit }: WeatherDashboardProps) => {
  const app = useWeatherApp(defaultUnit);
  const vm = buildWeatherDashboardViewModel(app);

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
          disabled={vm.controlsDisabled}
        />
        {vm.activeErrorMessage ? (
          <p role="alert" className="provider-error">
            {vm.activeErrorMessage}
          </p>
        ) : (
          <CityCandidatesList
            cities={app.candidateCities}
            onSelect={(city) => {
              void app.selectCity(city);
            }}
          />
        )}
        <SidebarDisclaimer />
      </aside>

      <section className="weather-panel">
        <header className="panel-header">
          <h2 className="panel-title">Weather</h2>
          <p className="panel-subtitle">Current conditions and daily outlook</p>
        </header>
        <div className="weather-stage">
          {vm.weatherData ? (
            <div
              className={`weather-content weather-content-visible ${app.isLoadingWeather ? 'weather-content-loading' : ''}`}
              key={vm.weatherContentKey}
            >
              <CurrentWeatherPanel weather={vm.weatherData} />
              <ForecastGrid
                weather={vm.weatherData}
                unitToggle={
                  <UnitToggle
                    value={app.units}
                    onChange={(unit) => {
                      void app.setUnits(unit);
                    }}
                    disabled={vm.controlsDisabled}
                  />
                }
              />
            </div>
          ) : null}
          {vm.shouldShowSkeleton ? (
            <div
              className={`weather-skeleton-layer ${vm.shouldShowSkeletonAsOverlay ? 'weather-skeleton-overlay' : ''}`}
            >
              <WeatherPanelSkeleton />
            </div>
          ) : null}
        </div>
        <PanelDisclaimer />
      </section>
    </main>
  );
};
