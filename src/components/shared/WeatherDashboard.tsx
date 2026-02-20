'use client';

import { useWeatherApp } from '@/hooks/useWeatherApp';

import { CityCandidatesList } from '../search/CityCandidatesList';
import { SearchForm } from '../search/SearchForm';
import { UnitToggle } from '../search/UnitToggle';
import { ForecastGrid } from '../weather/ForecastGrid';
import { CurrentWeatherPanel } from '../weather/CurrentWeatherPanel';
import { Disclaimer } from './Disclaimer';
import { StatusState } from './StatusState';

export const WeatherDashboard = () => {
  const app = useWeatherApp();

  return (
    <main className="app-shell">
      <aside className="sidebar">
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
        <CityCandidatesList
          cities={app.candidateCities}
          onSelect={(city) => {
            void app.selectCity(city);
          }}
        />
      </aside>

      <section className="weather-panel">
        <h1 className="panel-title">Weather</h1>
        <StatusState message={app.statusMessage} />
        {app.weather ? (
          <>
            <CurrentWeatherPanel weather={app.weather} />
            <ForecastGrid weather={app.weather} />
          </>
        ) : null}
        <Disclaimer />
      </section>
    </main>
  );
};
