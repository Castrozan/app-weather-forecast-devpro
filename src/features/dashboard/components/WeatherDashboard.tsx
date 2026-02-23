'use client';

import { useWeatherApp } from '@/features/dashboard/hooks/useWeatherApp';
import type { TemperatureUnit } from '@/features/weather/types';

import { UnitToggle } from '@/features/search/components/UnitToggle';
import { WeatherSidebar } from '@/features/search/components/WeatherSidebar';
import { WeatherMainPanel } from '@/features/weather/components/WeatherMainPanel';
import { buildWeatherDashboardViewModel } from '@/features/dashboard/weatherDashboardViewModel';

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
