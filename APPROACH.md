# Weather App Implementation Approach

## 1. Goal

Build a frontend-first weather app with a minimal Next.js API surface, but with strict boundaries so server logic can be moved to a standalone API later.

## 2. Confirmed Decisions

1. Keep Next API routes for now, with clean separation to extract later.
2. Support both units (`metric` and `imperial`) with a user toggle.
3. Handle city ambiguity with geocoding + user selection.
4. Forecast cards use daily `min`/`max` aggregation.
5. Fully responsive across desktop/tablet/mobile.
6. Use OpenWeather as upstream provider.
7. Use in-memory cache.
8. Add token gate and API rate limit.
9. Target deployment on Render with CI pipeline.
10. Prioritize clean code and strict single responsibility per file/component.

## 3. Technical Baseline

- Framework: Next.js App Router + TypeScript
- Runtime: Node 24
- Validation: Zod
- Client async state: TanStack Query
- Testing: Vitest + Testing Library
- Quality gates: ESLint + Prettier + TypeScript strict mode

## 4. Current Project Structure

```txt
src/
  app/
    api/v1/
      auth/route.ts
      cities/route.ts
      weather/route.ts
      weather/parseWeatherQuery.ts
    auth/page.tsx
    layout.tsx
    page.tsx
  components/
    search/
    shared/
    weather/
  hooks/
    useWeatherApp.ts
  lib/
    config.ts
  services/
    client/
      weatherApiClient.ts
    server/
      cache/
      cities/
      forecast/
      openweather/
      security/
      weatherFacade.ts
  styles/
  types/
tests/
  api/
  core/
```

## 5. API Contract (Minimal)

### `POST /api/v1/auth`

- Validates app token and sets an HTTP-only session cookie.
- Returns `401` for invalid token.
- If token mode is disabled (`APP_ACCESS_TOKEN` empty), returns success.

### `GET /api/v1/cities?query=...`

- Requires valid session when token mode is enabled.
- Applies rate limit.
- Returns normalized city candidates with `lat/lon`.

### `GET /api/v1/weather?lat=...&lon=...&units=...`

- Requires valid session when token mode is enabled.
- Applies rate limit.
- Validates query with Zod.
- Returns normalized current weather + aggregated 5-day forecast.

## 6. Frontend Flow

1. User searches city name.
2. App calls `GET /api/v1/cities`.
3. If one match: fetch weather directly.
4. If many matches: show selection list.
5. App calls `GET /api/v1/weather` with `lat/lon` + selected units.
6. Unit toggle re-fetches weather for selected city.

## 7. TDD Plan and Coverage

We keep a red -> green -> refactor cycle for core domain logic.

Covered tests in `tests/`:

- `tests/core/forecast-aggregation.test.ts`
  - timezone grouping
  - min/max aggregation
  - day limit behavior
- `tests/core/city-candidates.test.ts`
  - candidate normalization
  - duplicate handling
  - auto-select rule
- `tests/core/rate-limit-and-auth.test.ts`
  - rate limiter window semantics
  - token validation behavior
- `tests/core/weather-facade-cache.test.ts`
  - weather cache key behavior by `lat/lon/units`
- `tests/api/weather-query.test.ts`
  - weather query validation and default unit

## 8. Dev Environment (devenv + Node 24)

Files:

- `devenv.nix`
- `.envrc`

Steps:

1. Install `devenv` and `direnv`.
2. Run `direnv allow` in repo root.
3. Enter shell (automatic with direnv) and run:
   - `npm ci`
   - `npm run dev`

Environment contract:

- Node 24 is enforced via `package.json` engines and `devenv.nix`.
- `NPM_CONFIG_ENGINE_STRICT=true` is set in dev shell.

## 9. Quality Gates

Commands:

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run verify` (runs all checks)

## 10. CI Pipeline

File:

- `.github/workflows/ci.yml`

Pipeline stages:

1. Checkout
2. Setup Node 24
3. `npm ci`
4. `npm run verify`
5. `npm run build`

## 11. Environment Variables

Defined in `.env.example`:

- `OPENWEATHER_API_KEY`
- `APP_ACCESS_TOKEN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `CACHE_TTL_SECONDS`
- `NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT`

## 12. Architect Questions To Close

1. Should token auth include an explicit logout endpoint and session revocation?
2. Should rate limit be per-IP only, or per session token + IP?
3. For Render multi-instance scale, do we accept per-instance in-memory limits/cache, or require Redis later?
4. Should we exclude the current day from 5-day cards if only partial data exists?
5. Do weekday labels need localization or fixed English output?
6. What is the expected behavior when geocoding returns >5 candidates: hard cap or paginated search?
7. Should we add visual regression tests (Playwright) for the frontend-focused requirement?
8. Do we need structured logging/trace IDs on API responses for production debugging?
