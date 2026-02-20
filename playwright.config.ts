import { defineConfig, devices } from '@playwright/test';

const APP_PORT = 3001;
const APP_URL = `http://127.0.0.1:${APP_PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 45_000,
  expect: {
    timeout: 6_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${APP_PORT}`,
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      APP_ACCESS_TOKEN: '',
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX_REQUESTS: '500',
      CACHE_TTL_SECONDS: '300',
      NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT: 'metric',
    },
  },
});
