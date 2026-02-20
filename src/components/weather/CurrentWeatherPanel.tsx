import Image from 'next/image';

import type { WeatherResponse } from '@/types/weather';

type CurrentWeatherPanelProps = {
  weather: WeatherResponse;
};

const iconUrl = (icon: string): string => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const unitSymbol = (units: WeatherResponse['units']): string => {
  return units === 'metric' ? 'C' : 'F';
};

export const CurrentWeatherPanel = ({ weather }: CurrentWeatherPanelProps) => {
  return (
    <section className="current-weather" aria-label="Current weather">
      <Image
        src={iconUrl(weather.current.icon)}
        alt={weather.current.description}
        width={120}
        height={120}
        className="current-icon"
      />
      <h2 className="current-city">{weather.location.name}</h2>
      <p className="current-temp">
        {weather.current.temperature}°{unitSymbol(weather.units)}
      </p>
      <p className="current-description">{weather.current.description}</p>
    </section>
  );
};
