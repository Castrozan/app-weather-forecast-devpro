'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

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

const smoothDecelerationEasing = [0.16, 1, 0.3, 1] as const;

const weatherContentEnterAnimation = {
  initial: { opacity: 0, y: 10, scale: 0.994, filter: 'blur(2px) saturate(0.92)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px) saturate(1)' },
  exit: { opacity: 0, y: -6, filter: 'blur(1px)' },
  transition: { duration: 0.52, ease: smoothDecelerationEasing },
};

const skeletonLayerEnterAnimation = {
  initial: { opacity: 0, y: 8, filter: 'saturate(0.92)' },
  animate: { opacity: 1, y: 0, filter: 'saturate(1)' },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.52, ease: smoothDecelerationEasing },
};

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
        <CityCandidatesList
          cities={app.candidateCities}
          onSelect={(city) => {
            void app.selectCity(city);
          }}
        />
        <SidebarDisclaimer />
      </aside>

      <section className="weather-panel">
        <header className="panel-header">
          <h2 className="panel-title">Weather</h2>
          <p className="panel-subtitle">Current conditions and daily outlook</p>
        </header>
        <div className="weather-stage">
          <AnimatePresence mode="popLayout">
            {vm.weatherData ? (
              <motion.div
                className={clsx(
                  'weather-content',
                  app.isLoadingWeather && 'weather-content-loading',
                )}
                key={vm.weatherContentKey}
                {...weatherContentEnterAnimation}
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
              </motion.div>
            ) : null}
            {vm.shouldShowSkeleton ? (
              <motion.div
                className={clsx(
                  'weather-skeleton-layer',
                  vm.shouldShowSkeletonAsOverlay && 'weather-skeleton-overlay',
                )}
                key="skeleton"
                {...skeletonLayerEnterAnimation}
              >
                <WeatherPanelSkeleton />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <PanelDisclaimer />
      </section>
    </main>
  );
};
