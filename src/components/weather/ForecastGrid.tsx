import type { WeatherResponse } from '@/types/weather';

import { ForecastCard } from './ForecastCard';

type ForecastGridProps = {
  weather: WeatherResponse;
};

export const ForecastGrid = ({ weather }: ForecastGridProps) => {
  if (weather.forecastDaily.length === 0) {
    return null;
  }

  return (
    <section aria-label="5-day forecast">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-grid">
        {weather.forecastDaily.map((forecast) => (
          <ForecastCard key={forecast.date} forecast={forecast} units={weather.units} />
        ))}
      </div>
    </section>
  );
};
