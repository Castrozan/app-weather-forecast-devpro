'use client';

import { useWeatherApp } from '@/hooks/useWeatherApp';
import type { TemperatureUnit } from '@/types/weather';

import { UnitToggle } from '../search/UnitToggle';
import { WeatherSidebar } from '../search/WeatherSidebar';
import { WeatherMainPanel } from '../weather/WeatherMainPanel';
import { buildWeatherDashboardViewModel } from './weatherDashboardViewModel';

type WeatherDashboardProps = {
  defaultUnit: TemperatureUnit;
};

export const WeatherDashboard = ({ defaultUnit }: WeatherDashboardProps) => {
  const app = useWeatherApp(defaultUnit);
  const vm = buildWeatherDashboardViewModel(app);

  return (
    <main className="app-shell">
      <WeatherSidebar
        cityQuery={app.cityQuery}
        onCityQueryChange={app.setCityQuery}
        onSearch={() => {
          void app.search();
        }}
        candidateCities={app.candidateCities}
        onCitySelect={(city) => {
          void app.selectCity(city);
        }}
        controlsDisabled={vm.controlsDisabled}
      />
      <WeatherMainPanel
        weatherData={vm.weatherData}
        weatherContentKey={vm.weatherContentKey}
        isLoadingWeather={app.isLoadingWeather}
        shouldShowSkeleton={vm.shouldShowSkeleton}
        shouldShowSkeletonAsOverlay={vm.shouldShowSkeletonAsOverlay}
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
    </main>
  );
};
