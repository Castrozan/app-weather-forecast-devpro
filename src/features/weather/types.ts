export type TemperatureUnit = 'metric' | 'imperial';

export type CityCandidate = {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
};

export type CurrentWeather = {
  temperature: number;
  min: number;
  max: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

export type ForecastDay = {
  date: string;
  label: string;
  min: number;
  max: number;
  icon: string;
  description: string;
};

export type WeatherResponse = {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  units: TemperatureUnit;
  current: CurrentWeather;
  forecastDaily: ForecastDay[];
};
