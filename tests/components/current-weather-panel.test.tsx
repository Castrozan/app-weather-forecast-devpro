import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CurrentWeatherPanel } from '@/components/weather/CurrentWeatherPanel';
import type { WeatherResponse } from '@/types/weather';

const buildMetricWeatherResponse = (): WeatherResponse => ({
  location: { name: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.69 },
  units: 'metric',
  current: {
    temperature: 22,
    min: 18,
    max: 27,
    description: 'Partly Cloudy',
    icon: 'partly-cloudy-day',
    humidity: 65,
    windSpeed: 14,
  },
  forecastDaily: [],
});

describe('CurrentWeatherPanel', () => {
  it('renders city name, country, and description', () => {
    render(<CurrentWeatherPanel weather={buildMetricWeatherResponse()} />);

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText(/JP/)).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('renders temperature with metric unit symbol', () => {
    render(<CurrentWeatherPanel weather={buildMetricWeatherResponse()} />);

    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText('18°C')).toBeInTheDocument();
    expect(screen.getByText('27°C')).toBeInTheDocument();
  });

  it('renders humidity percentage', () => {
    render(<CurrentWeatherPanel weather={buildMetricWeatherResponse()} />);

    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders wind speed with km/h unit for metric', () => {
    render(<CurrentWeatherPanel weather={buildMetricWeatherResponse()} />);

    expect(screen.getByText(/14.*km\/h/)).toBeInTheDocument();
  });

  it('renders wind speed with mph unit for imperial', () => {
    const imperialWeather: WeatherResponse = {
      ...buildMetricWeatherResponse(),
      units: 'imperial',
    };
    render(<CurrentWeatherPanel weather={imperialWeather} />);

    expect(screen.getByText(/14.*mph/)).toBeInTheDocument();
    expect(screen.getByText('22°F')).toBeInTheDocument();
  });
});
