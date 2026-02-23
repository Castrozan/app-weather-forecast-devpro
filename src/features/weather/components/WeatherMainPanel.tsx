import type { ReactNode } from 'react';

import type { WeatherResponse } from '@/features/weather/types';

import { PanelDisclaimer } from './PanelDisclaimer';
import { CurrentWeatherPanel } from './CurrentWeatherPanel';
import { ForecastGrid } from './ForecastGrid';

type WeatherMainPanelProps = {
  weatherData: WeatherResponse | null;
  weatherContentKey: string;
  unitToggle: ReactNode;
};

export const WeatherMainPanel = ({
  weatherData,
  weatherContentKey,
  unitToggle,
}: WeatherMainPanelProps) => {
  return (
    <section className="weather-panel">
      <header className="panel-header">
        <h2 className="panel-title">Weather</h2>
        <p className="panel-subtitle">Current conditions and daily outlook</p>
      </header>
      <div className="weather-stage">
        {weatherData ? (
          <div className="weather-content" key={weatherContentKey}>
            <CurrentWeatherPanel weather={weatherData} />
            <ForecastGrid weather={weatherData} unitToggle={unitToggle} />
          </div>
        ) : null}
      </div>
      <PanelDisclaimer />
    </section>
  );
};
