import type { TemperatureUnit } from '@/types/weather';

export type WeatherProviderCity = {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
};

export type WeatherProviderForecastEntry = {
  timestampSeconds: number;
  minTemperature: number;
  maxTemperature: number;
  description: string;
  icon: string;
  isDaylight: boolean;
};

export type WeatherProviderCurrent = {
  temperature: number;
  min: number;
  max: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

export type WeatherProviderLocation = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export type WeatherLocationHint = {
  name: string;
  country?: string;
};

export type WeatherProviderWeather = {
  location: WeatherProviderLocation;
  timezoneOffsetSeconds: number;
  current: WeatherProviderCurrent;
  forecastEntries: WeatherProviderForecastEntry[];
};

export type FetchWeatherByCoordinatesInput = {
  lat: number;
  lon: number;
  units: TemperatureUnit;
  locationHint?: WeatherLocationHint;
};

export interface WeatherProviderPort {
  readonly name: string;
  searchCities(query: string, limit: number): Promise<WeatherProviderCity[]>;
  fetchWeatherByCoordinates(input: FetchWeatherByCoordinatesInput): Promise<WeatherProviderWeather>;
}
