import Image from 'next/image';

import type { ForecastDay, TemperatureUnit } from '@/types/weather';

type ForecastCardProps = {
  forecast: ForecastDay;
  units: TemperatureUnit;
};

const iconUrl = (icon: string): string => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const unitSymbol = (units: TemperatureUnit): string => {
  return units === 'metric' ? 'C' : 'F';
};

export const ForecastCard = ({ forecast, units }: ForecastCardProps) => {
  return (
    <article className="forecast-card">
      <h4 className="forecast-label">{forecast.label}</h4>
      <Image
        src={iconUrl(forecast.icon)}
        alt={forecast.description}
        width={64}
        height={64}
        className="forecast-icon"
      />
      <p className="forecast-minmax">
        L {forecast.min}°{unitSymbol(units)}
      </p>
      <p className="forecast-minmax">
        H {forecast.max}°{unitSymbol(units)}
      </p>
    </article>
  );
};
