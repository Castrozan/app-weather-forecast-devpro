import type { CityCandidate, TemperatureUnit, WeatherResponse } from '@/types/weather';

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

  async fetchWeather(lat: number, lon: number, units: TemperatureUnit): Promise<WeatherResponse> {
    const response = await fetch(`/api/v1/weather?lat=${lat}&lon=${lon}&units=${units}`);
    const ok = await ensureOk(response);
    return (await ok.json()) as WeatherResponse;
  },
};
