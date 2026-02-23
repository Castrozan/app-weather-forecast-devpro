import { expect, test, type Page } from '@playwright/test';

import type {
  CityCandidate,
  TemperatureUnit,
  WeatherResponse,
} from '../../src/features/weather/types';

const cityCandidates: CityCandidate[] = [
  {
    id: '40.71427,-74.00597',
    name: 'New York',
    state: 'New York',
    country: 'United States',
    lat: 40.71427,
    lon: -74.00597,
    displayName: 'New York, New York, United States',
  },
  {
    id: '53.07897,-0.14008',
    name: 'New York',
    state: 'England',
    country: 'United Kingdom',
    lat: 53.07897,
    lon: -0.14008,
    displayName: 'New York, England, United Kingdom',
  },
];

const wait = async (durationMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

const denyGeolocationPermission = async (page: Page) => {
  await page.addInitScript(() => {
    if (!navigator.permissions) {
      return;
    }

    Object.defineProperty(navigator.permissions, 'query', {
      configurable: true,
      value: async () => ({ state: 'denied' as const }),
    });
  });
};

const grantGeolocationPermission = async (page: Page, lat: number, lon: number) => {
  await page.addInitScript(
    (position: { lat: number; lon: number }) => {
      if (navigator.permissions) {
        Object.defineProperty(navigator.permissions, 'query', {
          configurable: true,
          value: async () => ({ state: 'granted' as const }),
        });
      }

      if (!navigator.geolocation) {
        return;
      }

      Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
        configurable: true,
        value: (onSuccess: (position: GeolocationPosition) => void) => {
          onSuccess({
            coords: {
              latitude: position.lat,
              longitude: position.lon,
            } as GeolocationCoordinates,
          } as GeolocationPosition);
        },
      });
    },
    { lat, lon },
  );
};

const buildWeatherPayload = (
  city: string,
  country: string,
  lat: number,
  lon: number,
  units: TemperatureUnit,
): WeatherResponse => {
  if (units === 'imperial') {
    return {
      location: {
        name: city,
        country,
        lat,
        lon,
      },
      units: 'imperial',
      current: {
        temperature: 72,
        min: 67,
        max: 75,
        description: 'partly cloudy',
        icon: '02d',
        humidity: 55,
        windSpeed: 8,
      },
      forecastDaily: [
        {
          date: '2026-02-20',
          label: 'Friday',
          min: 66,
          max: 74,
          icon: '02d',
          description: 'mainly clear',
        },
        {
          date: '2026-02-21',
          label: 'Saturday',
          min: 64,
          max: 71,
          icon: '03d',
          description: 'overcast',
        },
        { date: '2026-02-22', label: 'Sunday', min: 60, max: 68, icon: '10d', description: 'rain' },
        {
          date: '2026-02-23',
          label: 'Monday',
          min: 58,
          max: 67,
          icon: '09d',
          description: 'light rain showers',
        },
        {
          date: '2026-02-24',
          label: 'Tuesday',
          min: 57,
          max: 65,
          icon: '04d',
          description: 'overcast',
        },
      ],
    };
  }

  return {
    location: {
      name: city,
      country,
      lat,
      lon,
    },
    units: 'metric',
    current: {
      temperature: 22,
      min: 19,
      max: 24,
      description: 'partly cloudy',
      icon: '02d',
      humidity: 55,
      windSpeed: 13,
    },
    forecastDaily: [
      {
        date: '2026-02-20',
        label: 'Friday',
        min: 19,
        max: 23,
        icon: '02d',
        description: 'mainly clear',
      },
      {
        date: '2026-02-21',
        label: 'Saturday',
        min: 18,
        max: 22,
        icon: '03d',
        description: 'overcast',
      },
      { date: '2026-02-22', label: 'Sunday', min: 16, max: 20, icon: '10d', description: 'rain' },
      {
        date: '2026-02-23',
        label: 'Monday',
        min: 14,
        max: 19,
        icon: '09d',
        description: 'light rain showers',
      },
      {
        date: '2026-02-24',
        label: 'Tuesday',
        min: 13,
        max: 18,
        icon: '04d',
        description: 'overcast',
      },
    ],
  };
};

test.describe('Weather dashboard', () => {
  test('loads default city weather and animates content into view', async ({ page }) => {
    await denyGeolocationPermission(page);

    await page.route('**/api/v1/weather?**', async (route) => {
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Las Vegas';
      const country = url.searchParams.get('country') ?? 'United States';
      const lat = Number(url.searchParams.get('lat') ?? '36.1699');
      const lon = Number(url.searchParams.get('lon') ?? '-115.1398');

      await wait(500);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');
    await expect(page.locator('.weather-content')).toBeVisible();
  });

  test('searches, selects a city, and toggles units', async ({ page }) => {
    let weatherRequests = 0;
    await denyGeolocationPermission(page);

    await page.route('**/api/v1/cities?**', async (route) => {
      const url = new URL(route.request().url());
      const query = (url.searchParams.get('query') ?? '').toLowerCase();

      if (query.includes('new york')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            query: 'New York',
            cities: cityCandidates,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: url.searchParams.get('query') ?? '',
          cities: [],
        }),
      });
    });

    await page.route('**/api/v1/weather?**', async (route) => {
      weatherRequests += 1;
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Las Vegas';
      const country = url.searchParams.get('country') ?? 'United States';
      const lat = Number(url.searchParams.get('lat') ?? '36.1699');
      const lon = Number(url.searchParams.get('lon') ?? '-115.1398');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Weather' })).toBeVisible();
    await expect(page.locator('.current-city')).toHaveText('Las Vegas');

    await page.getByLabel('Search').fill('New York');
    await page.getByRole('button', { name: 'Find' }).click();

    await expect(page.locator('.candidate-button').first()).toBeVisible();

    await page.locator('.candidate-button').first().click();

    await expect(page.getByRole('heading', { name: 'New York' })).toBeVisible();
    await expect(page.locator('.current-city')).toHaveCount(1);
    await expect(page.locator('.current-city')).toHaveText('New York');
    await expect(page.locator('.current-temp')).toContainText('22°C');
    await expect(page.locator('.forecast-card')).toHaveCount(5);

    await page.getByRole('button', { name: 'Switch to °F' }).click();

    await expect(page.getByText('72°F')).toBeVisible();
    await expect(page.locator('.current-temp')).toHaveCount(1);
    await expect(page.locator('.current-temp')).toContainText('72°F');
    await expect.poll(() => weatherRequests).toBe(3);
  });

  test('keeps current weather visible when no city matches query', async ({ page }) => {
    await denyGeolocationPermission(page);

    await page.route('**/api/v1/cities?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'Atlantis',
          cities: [],
        }),
      });
    });

    await page.route('**/api/v1/weather?**', async (route) => {
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Las Vegas';
      const country = url.searchParams.get('country') ?? 'United States';
      const lat = Number(url.searchParams.get('lat') ?? '36.1699');
      const lon = Number(url.searchParams.get('lon') ?? '-115.1398');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');

    await page.getByLabel('Search').fill('Atlantis');
    await page.getByRole('button', { name: 'Find' }).click();

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');
    await expect(page.locator('.forecast-card')).toHaveCount(5);
  });

  test('loads user location directly when geolocation is already granted', async ({ page }) => {
    await grantGeolocationPermission(page, 34.0522, -118.2437);

    await page.route('**/api/v1/cities?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: '',
          cities: [],
        }),
      });
    });

    await page.route('**/api/v1/weather?**', async (route) => {
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Near You';
      const country = url.searchParams.get('country') ?? 'Local';
      const lat = Number(url.searchParams.get('lat') ?? '34.0522');
      const lon = Number(url.searchParams.get('lon') ?? '-118.2437');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Near You');
    await expect(page.getByLabel('Search')).toHaveValue('');
  });

  test('stays on default city without error when geolocation is denied', async ({ page }) => {
    await denyGeolocationPermission(page);

    await page.route('**/api/v1/weather?**', async (route) => {
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Las Vegas';
      const country = url.searchParams.get('country') ?? 'United States';
      const lat = Number(url.searchParams.get('lat') ?? '36.1699');
      const lon = Number(url.searchParams.get('lon') ?? '-115.1398');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');
    await expect(page.locator('.weather-content')).toBeVisible();
  });

  test('auto-selects city and loads weather when search returns exactly one result', async ({
    page,
  }) => {
    await denyGeolocationPermission(page);

    const singleCityCandidate = cityCandidates[0];

    await page.route('**/api/v1/cities?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'New York',
          cities: [singleCityCandidate],
        }),
      });
    });

    await page.route('**/api/v1/weather?**', async (route) => {
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Las Vegas';
      const country = url.searchParams.get('country') ?? 'United States';
      const lat = Number(url.searchParams.get('lat') ?? '36.1699');
      const lon = Number(url.searchParams.get('lon') ?? '-115.1398');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');

    await page.getByLabel('Search').fill('New York');
    await page.getByRole('button', { name: 'Find' }).click();

    await expect(page.getByRole('heading', { name: 'New York' })).toBeVisible();
    await expect(page.locator('.current-city')).toHaveCount(1);
    await expect(page.locator('.current-city')).toHaveText('New York');
    await expect(page.locator('.candidate-button')).toHaveCount(0);
    await expect(page.locator('.forecast-card')).toHaveCount(5);
  });

  test('shows error toast when weather API returns a server error', async ({ page }) => {
    await denyGeolocationPermission(page);

    let weatherCallCount = 0;

    await page.route('**/api/v1/weather?**', async (route) => {
      weatherCallCount += 1;

      if (weatherCallCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            buildWeatherPayload('Las Vegas', 'United States', 36.1699, -115.1398, 'metric'),
          ),
        });
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Weather service unavailable.' }),
      });
    });

    await page.route('**/api/v1/cities?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ query: 'New York', cities: [cityCandidates[0]] }),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');
    await expect(page.locator('.weather-content')).toBeVisible();

    await page.getByLabel('Search').fill('New York');
    await page.getByRole('button', { name: 'Find' }).click();

    await expect(page.locator('[data-sonner-toast][data-type="error"]')).toContainText(
      'Weather service unavailable.',
    );
  });

  test('shows error toast when city search API returns a server error', async ({ page }) => {
    await denyGeolocationPermission(page);

    await page.route('**/api/v1/weather?**', async (route) => {
      const url = new URL(route.request().url());
      const units = (url.searchParams.get('units') ?? 'metric') as TemperatureUnit;
      const city = url.searchParams.get('city') ?? 'Las Vegas';
      const country = url.searchParams.get('country') ?? 'United States';
      const lat = Number(url.searchParams.get('lat') ?? '36.1699');
      const lon = Number(url.searchParams.get('lon') ?? '-115.1398');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherPayload(city, country, lat, lon, units)),
      });
    });

    await page.route('**/api/v1/cities?**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'City search service unavailable.' }),
      });
    });

    await page.goto('/');

    await expect(page.locator('.current-city')).toHaveText('Las Vegas');
    await expect(page.locator('.weather-content')).toBeVisible();

    await page.getByLabel('Search').fill('New York');
    await page.getByRole('button', { name: 'Find' }).click();

    await expect(page.locator('[data-sonner-toast][data-type="error"]')).toContainText(
      'City search service unavailable.',
    );
    await expect(page.locator('.current-city')).toHaveText('Las Vegas');
    await expect(page.locator('.forecast-card')).toHaveCount(5);
  });
});
