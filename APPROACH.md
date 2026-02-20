# Weather App Implementation Approach

## 1. Goal

Build a frontend-first weather app with a minimal Next.js API layer, but with strict boundaries so API logic can be extracted to a standalone service later.

## 2. Confirmed Decisions

1. Keep Next API routes now, with clean separations for extraction.
2. Use Open-Meteo as the weather/geocoding upstream.
3. Keep units toggle (`metric` and `imperial`) configurable by user.
4. Handle city duplication by returning candidates and forcing explicit selection when needed.
5. Forecast cards must show daily `min`/`max`.
6. UI must be responsive across desktop/tablet/mobile.
7. Keep cache and rate limit in-memory for now.
8. Enforce token-gated app access + per-IP rate limit.
9. Deploy target is Render with CI pipeline.
10. Prioritize strict single responsibility per file/component.

## 3. Architecture (Hexagonal)

### 3.1 API boundary

- `src/app/api/v1/*` is the transport layer only.
- Routes validate inputs, enforce security/rate limits, and delegate to server services.
- Domain and provider logic stays outside route handlers.

### 3.2 Weather provider ports and adapters

```txt
src/services/server/weather/
  ports/
    weatherProvider.ts
  adapters/
    openMeteo/
      openMeteoWeatherProvider.ts
      weatherCodeMapper.ts
  errors.ts
  resolveWeatherProvider.ts
```

- `WeatherProviderPort` is the stable contract (`searchCities`, `fetchWeatherByCoordinates`).
- `openMeteoWeatherProvider` is an adapter implementation.
- `resolveWeatherProvider` is the composition point so we can swap adapters without touching routes/facade.

### 3.3 Domain services

- `src/services/server/weatherFacade.ts`
  - orchestrates provider calls
  - aggregates hourly forecast into daily cards
  - applies cache with TTL
- `src/services/server/cities/*`
  - normalizes/deduplicates geocoding candidates
- `src/services/server/security/*`
  - access token validation
  - per-IP in-memory rate limiting

## 4. Minimal API Contract

### `POST /api/v1/auth`

- Validates app token and sets HTTP-only session cookie.
- Returns `401` for invalid token.
- If token mode disabled (`APP_ACCESS_TOKEN` empty), returns success.

### `GET /api/v1/cities?query=...`

- Auth-gated when token mode is on.
- Per-IP rate-limited.
- Returns normalized city candidates with `lat/lon`.

### `GET /api/v1/weather?lat=...&lon=...&units=...`

- Auth-gated when token mode is on.
- Per-IP rate-limited.
- Query validated with Zod.
- Returns normalized current weather + aggregated 5-day forecast.

## 5. Frontend Flow

1. User types city and submits search.
2. UI calls `GET /api/v1/cities`.
3. If one result, weather loads directly.
4. If multiple, user picks exact city.
5. UI calls `GET /api/v1/weather` using selected `lat/lon` + units.
6. Unit toggle re-fetches weather for selected city.

## 6. Testing Strategy (TDD + Integration + E2E)

### 6.1 Unit/core tests (Vitest)

- Forecast aggregation by timezone + min/max.
- City candidate normalization and deduplication.
- Rate limit/auth behavior.
- Weather facade caching behavior.
- API weather query parsing/validation.

### 6.2 Browser integration/e2e tests (Playwright)

- Search flow with multiple city matches.
- City selection and weather rendering.
- Unit toggle causing weather re-fetch and updated values.
- Empty search result state.

## 7. Dev Environment

- `devenv` + `direnv` for reproducible local setup.
- Node 24 enforced by:
  - `package.json` engines
  - `devenv.nix`
  - `NPM_CONFIG_ENGINE_STRICT=true` in shell.

Run:

1. `direnv allow`
2. `npm ci`
3. `npm run dev`

## 8. Quality Gates and CI

Local quality gates:

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

CI workflow (`.github/workflows/ci.yml`):

1. Setup Node 24
2. Install dependencies
3. Run `npm run verify`
4. Install Playwright Chromium
5. Run `npm run test:e2e`
6. Run `npm run build`

## 9. Environment Variables

Defined in `.env.example`:

- `APP_ACCESS_TOKEN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `CACHE_TTL_SECONDS`
- `NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT`

Note: Open-Meteo upstream currently does not require an API key for this scope.

## 10. Open Architecture Questions

1. Should we add explicit logout/session revocation endpoints, or keep token sign-in only for this challenge scope?
2. Should we add structured logging with request IDs now, or keep this deferred until post-MVP hardening?
