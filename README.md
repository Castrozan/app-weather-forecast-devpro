# App Weather Forecast

Frontend-first weather app built with Next.js, with clean hexagonal service boundaries so the API layer can be extracted to a standalone service without touching domain logic.

The upstream provider is Open-Meteo (no API key required).

## Quick Start

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If `APP_ACCESS_TOKEN` is set, visit `/auth` first.

## Prerequisites

- Node 24
- npm 10+
- Optional: `devenv` + `direnv` for reproducible shell

## devenv workflow

```bash
direnv allow
# shell loads Node 24 from devenv.nix automatically
npm ci
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable                               | Default   | Description                                                                     |
| -------------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `OPENWEATHER_API_KEY`                  | _(empty)_ | OpenWeather API key. When set, OpenWeather is primary with Open-Meteo fallback. |
| `APP_ACCESS_TOKEN`                     | _(empty)_ | When set, gates the app behind a token. Leave empty for open access.            |
| `RATE_LIMIT_WINDOW_MS`                 | `60000`   | Rate limit window in milliseconds per IP                                        |
| `RATE_LIMIT_MAX_REQUESTS`              | `60`      | Max requests per IP per window                                                  |
| `CACHE_TTL_SECONDS`                    | `300`     | Weather response cache TTL (0 = disabled)                                       |
| `NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT` | `metric`  | Default unit: `metric` or `imperial`                                            |

## Quality Checks

```bash
npm run verify        # format + lint + typecheck + unit tests
npm run test:e2e      # Playwright integration tests (starts its own dev server)
```

Full pipeline:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

## Test Coverage

**Unit tests (Vitest):**

- Forecast aggregation — timezone grouping, min/max derivation, representative entry selection
- City candidate normalization and deduplication
- Rate limiting — window reset, per-key isolation
- Auth token validation — empty token, disabled mode
- Weather response caching — TTL expiry, cache hits
- API query validation — Zod parsing for lat/lon/units
- Dashboard view model — skeleton visibility, content keys, controls disabled state
- Weather icon class resolution
- Geolocation coordinate request

**Component tests (React Testing Library):**

- `SearchForm` — renders, calls onChange/onSubmit, disables correctly
- `CurrentWeatherPanel` — temperature units, wind speed unit labels, humidity

**E2E tests (Playwright):**

- Full search flow: type city → select from candidates → view weather
- Unit toggle: switch metric ↔ imperial → weather refetches with new units
- Auto-select: single search result skips candidate list
- Empty search result: keeps current weather visible
- Geolocation: loads local weather when permission already granted
- Geolocation denied: stays on default city without error
- Error handling: server errors surface as toast notifications

## Architecture

### Hexagonal (Ports and Adapters)

```
src/
  app/                            Next.js routing (thin pages + API handlers)
    api/v1/                       Transport: validates inputs, enforces auth/rate limits
    page.tsx                      SSR auth gate → renders WeatherDashboard
    auth/                         Token login page
  components/                     UI components by feature domain
    dashboard/                    App shell orchestrator + view model
    providers/                    App-level wiring (QueryClient, ErrorBoundary, Toaster)
    search/                       Sidebar: search form, city candidates, unit toggle
    weather/                      Main panel: current weather, forecast grid, skeleton
  hooks/                          Client-side state (composable, assembled by useWeatherApp)
  lib/                            Configuration + client utilities
  services/
    client/                       Browser-side API calls + geolocation
    server/
      weather/
        ports/                    Stable interface: WeatherProviderPort
        adapters/                 OpenWeather + Open-Meteo implementations (swappable)
        handleWeatherProviderError.ts  Shared error → HTTP status mapping
      cities/                     Geocoding normalization + deduplication
      forecast/                   Hourly → daily aggregation + timezone conversion
      cache/                      In-memory TTL cache
      security/                   Rate limiter + access token validation
      validation/                 Query parsing (Zod schemas)
      weatherFacade.ts            Orchestrates: cache → provider → aggregation → hint overlay
  shared/                         Cross-cutting utilities
    animation/                    Framer Motion easing + variant configs
    icons/                        Weather icon class mapping
  styles/                         CSS feature files + design tokens
  types/                          Shared TypeScript types
tests/
  core/                           Pure logic unit tests
  components/                     React component rendering tests
  api/                            API layer query parsing tests
  e2e/                            Playwright browser tests
```

### Key Decisions and Tradeoffs

**1. Next.js API routes instead of a separate Express server**

The API layer is thin and stateless (cache and rate limiter are in-memory per process). Keeping everything in one Next.js app removes operational overhead for a take-home scope. The hexagonal structure means `src/services/server/` can be extracted to a standalone Node service by swapping out the transport layer — routes become Express handlers, no domain logic changes.

**2. OpenWeather as primary provider, Open-Meteo as keyless fallback**

OpenWeather is the primary provider when `OPENWEATHER_API_KEY` is set, with Open-Meteo as automatic fallback. Without a key, Open-Meteo runs standalone — no configuration required for local development. The `WeatherProviderPort` interface makes providers swappable: adding a new one means writing an adapter in `src/services/server/weather/adapters/` and updating `resolveWeatherProvider.ts`.

**3. In-memory cache and rate limiter**

Production would use Redis or a distributed store. In-memory is correct for a single-process deployment (Render, single dyno) and keeps the infrastructure surface minimal. The interfaces are already injectable — `createInMemoryTtlCache` and `createInMemoryRateLimiter` can be replaced with Redis-backed implementations without touching the facade or routes.

**4. `useMutation` for all fetches, no `useQuery`**

All data fetches are imperative (triggered by user action or geolocation — never by component mount alone). `useMutation` gives `isPending`, `isError`, and `mutateAsync` without automatic background refetching, which would be incorrect here. Using `useQuery` with `enabled: false` would work but is semantically misleading.

**5. Location hint as a post-cache overlay**

The weather cache is keyed by `lat:lon:units`. The display name (city name the user searched, or "Near You" for geolocation) is applied as an overlay after cache lookup. This means the same coordinates from two different search paths share one upstream API hit, while each caller still receives their contextual display name.

**6. Lazy geolocation with user-interaction guard**

Geolocation runs 1.6 seconds after initial load and is silently cancelled if the user has typed or interacted. This avoids jarring city switches after the user has started a search, while still providing the convenience of local weather for passive viewers.

### What I Would Improve With More Time

1. **Replace in-memory cache/rate limiter with Redis** — required for multi-instance deployments
2. **Add structured request logging** — request ID, provider latency, cache hit/miss per request, for observability
3. **Add session revocation** — currently, a session token is valid until the server restarts or the env var changes
4. **Add request ID propagation** — correlate frontend errors to API logs
5. **Switch to a proper session signing mechanism** — store an HMAC-signed nonce instead of the raw token in the cookie
6. **Add Stale-While-Revalidate headers** — serve cached weather while refreshing in the background, improving perceived performance
7. **Add a service worker** — offline support for previously loaded cities
8. **Expand component test coverage** — `ForecastGrid`, `CityCandidatesList`, `UnitToggle` rendering states

## Deployment

- **Target:** Render (Node.js environment)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — lint, typecheck, unit tests, E2E, build
