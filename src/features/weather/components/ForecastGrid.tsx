import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import {
  forecastCardEntryVariants,
  forecastGridStaggerVariants,
} from '@/shared/animation/variants';
import type { WeatherResponse } from '@/features/weather/types';

import { ForecastCard } from './ForecastCard';

type ForecastGridProps = {
  weather: WeatherResponse;
  unitToggle?: ReactNode;
};

export const ForecastGrid = ({ weather, unitToggle }: ForecastGridProps) => {
  if (weather.forecastDaily.length === 0) {
    return null;
  }

  return (
    <section className="forecast-section" aria-label="5-day forecast">
      <div className="forecast-header">
        <h3 className="forecast-title">5-Day Forecast</h3>
        {unitToggle}
      </div>
      <motion.div
        className="forecast-grid"
        variants={forecastGridStaggerVariants}
        initial="initial"
        animate="animate"
      >
        {weather.forecastDaily.map((forecast) => (
          <motion.div key={forecast.date} variants={forecastCardEntryVariants}>
            <ForecastCard forecast={forecast} units={weather.units} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
