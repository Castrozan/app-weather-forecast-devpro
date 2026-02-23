import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { weatherContentEnterAnimation } from '@/shared/animation/variants';
import type { WeatherResponse } from '@/types/weather';

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
        <AnimatePresence mode="popLayout">
          {weatherData ? (
            <motion.div
              className="weather-content"
              key={weatherContentKey}
              {...weatherContentEnterAnimation}
            >
              <CurrentWeatherPanel weather={weatherData} />
              <ForecastGrid weather={weatherData} unitToggle={unitToggle} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <PanelDisclaimer />
    </section>
  );
};
