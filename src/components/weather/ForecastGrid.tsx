import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import type { WeatherResponse } from '@/types/weather';

import { ForecastCard } from './ForecastCard';

const forecastGridStaggerVariants = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

const smoothDecelerationEasing = [0.16, 1, 0.3, 1] as const;

const forecastCardEntryVariants = {
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: smoothDecelerationEasing },
  },
};

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
