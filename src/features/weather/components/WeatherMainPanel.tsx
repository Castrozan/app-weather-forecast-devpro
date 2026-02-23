import { Loader2 } from 'lucide-react';

import type { TemperatureUnit, WeatherResponse } from '@/features/weather/types';

import { PanelDisclaimer } from './PanelDisclaimer';
import { CurrentWeatherPanel } from './CurrentWeatherPanel';
import { ForecastGrid } from './ForecastGrid';

type WeatherMainPanelProps = {
  weatherData: WeatherResponse | null;
  weatherContentKey: string;
  onToggleUnits: (unit: TemperatureUnit) => void;
  controlsDisabled: boolean;
  showLoadingSpinner: boolean;
};

export const WeatherMainPanel = ({
  weatherData,
  weatherContentKey,
  onToggleUnits,
  controlsDisabled,
  showLoadingSpinner,
}: WeatherMainPanelProps) => {
  return (
    <section className="weather-panel">
      <header className="panel-header">
        <h2 className="panel-title">Weather</h2>
        <p className="panel-subtitle">Current conditions and daily outlook</p>
      </header>
      <div className="weather-stage">
        {showLoadingSpinner ? (
          <div className="weather-loading-spinner" aria-label="Loading weather data">
            <Loader2 className="weather-loading-spinner-icon" size={48} />
          </div>
        ) : weatherData ? (
          <div className="weather-content" key={weatherContentKey}>
            <CurrentWeatherPanel
              weather={weatherData}
              onToggleUnits={onToggleUnits}
              controlsDisabled={controlsDisabled}
            />
            <ForecastGrid weather={weatherData} />
          </div>
        ) : null}
      </div>
      <PanelDisclaimer />
    </section>
  );
};
