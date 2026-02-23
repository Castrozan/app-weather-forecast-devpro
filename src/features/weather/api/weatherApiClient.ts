import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/features/weather/types';

type CitiesResponse = {
  query: string;
  cities: CityCandidate[];
};

const ensureOk = async (response: Response): Promise<Response> => {
  if (response.ok) {
    return response;
  }

  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(body?.error ?? `Request failed with status ${response.status}`);
};

type WeatherLocationContext = {
  city: string;
  country?: string;
};

export const weatherApiClient = {
  async signIn(token: string): Promise<void> {
    const response = await fetch('/api/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    await ensureOk(response);
  },

  async fetchCities(query: string): Promise<CityCandidate[]> {
    const encoded = encodeURIComponent(query);
    const response = await fetch(`/api/v1/cities?query=${encoded}`);
    const ok = await ensureOk(response);
    const payload = (await ok.json()) as CitiesResponse;
    return payload.cities;
  },

  async fetchWeather(
    lat: number,
    lon: number,
    units: TemperatureUnit,
    location?: WeatherLocationContext,
  ): Promise<WeatherResponse> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      units,
    });

    if (location?.city) {
      params.set('city', location.city);
    }

    if (location?.country) {
      params.set('country', location.country);
    }

    const response = await fetch(`/api/v1/weather?${params.toString()}`);
    const ok = await ensureOk(response);
    return (await ok.json()) as WeatherResponse;
  },
};
