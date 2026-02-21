import type { ReactNode } from 'react';

import type { WeatherResponse } from '@/types/weather';

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
      <div className="forecast-grid">
        {weather.forecastDaily.map((forecast) => (
          <ForecastCard key={forecast.date} forecast={forecast} units={weather.units} />
        ))}
      </div>
    </section>
  );
};
