# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run verify           # Full gate: format + lint + typecheck + unit tests

npm run lint             # ESLint (flat config)
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier write
npm run format:check     # Prettier check
npm run typecheck        # tsc --noEmit

npm run test             # Vitest unit tests (single run)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Vitest with V8 coverage
npx vitest run tests/core/rate-limit-and-auth.test.ts  # Run a single test file

npm run test:e2e         # Playwright (starts dev server on port 3001)
npm run test:e2e:headed  # Playwright with visible browser
```

## Architecture

Next.js 16 App Router with hexagonal (ports and adapters) service layer. React 19, TypeScript strict, Zod 4 for runtime validation, TanStack Query (`useMutation` only — all fetches are user-triggered, never auto-refetch).

**Styling:** Vanilla CSS with BEM-like classes colocated in feature `styles/` directories + global design tokens in `src/styles/tokens.css`. No Tailwind, no CSS Modules.

**Icons:** `lucide-react` for UI icons, `weather-icons` CSS font for weather conditions (mapped through `features/weather/icons/weatherIconClass.ts`).

**Animations:** `framer-motion` for enter/exit/stagger transitions. Config centralized in `src/shared/animation/`.

**Error UX:** `sonner` toasts for non-blocking errors. `react-error-boundary` in `AppProviders` for crash recovery.

### Directory Structure

Feature-based structure (Bulletproof React convention). Features are isolated domains that don't import from each other at runtime — composition happens in `app/` routes. Unidirectional flow: `shared → features → app`.

```
src/
  app/                            Next.js routing only (thin pages + API handlers)
    api/v1/                       API routes compose features (auth, cities, weather)
    auth/                         Auth page
  config/                         App configuration and defaults
  shared/                         Cross-cutting utilities (no domain logic)
    animation/                    Framer-motion (easings, variants, AnimatedValue)
    infrastructure/               Query client, in-memory cache
  styles/                         Global CSS foundation (tokens, reset, base, layout)
  features/                       Domain feature modules
    weather/                      WEATHER DOMAIN
      types.ts                    Core weather types
      units.ts                    Temperature/wind unit helpers
      weatherFacade.ts            Server-side orchestrator (cache → provider → aggregate)
      providers/                  Hexagonal ports + adapters (OpenWeather, Open-Meteo)
      forecast/                   Forecast aggregation and timezone conversion
      validation/                 Weather query parsing
      api/                        Browser-side fetch client
      hooks/                      useWeatherLoader
      icons/                      Weather icon class mapping
      components/                 Weather display (current, forecast, disclaimer)
      styles/                     Weather-specific CSS
    search/                       SEARCH/CITIES DOMAIN
      cities/                     City candidate mapping (pure mapper)
      hooks/                      useWeatherSearch
      components/                 Sidebar, search form, candidates, unit toggle
      styles/                     Search-specific CSS
    security/                     AUTH/SECURITY DOMAIN
      accessToken.ts              Token validation
      rateLimiter.ts              In-memory rate limiter
      requestSecurity.ts          Request verification middleware
    dashboard/                    APP SHELL ORCHESTRATOR
      weatherDashboardViewModel.ts
      hooks/                      useWeatherApp (composes all feature hooks)
      components/                 WeatherDashboard, error fallback
      providers/                  AppProviders (QueryClient, ErrorBoundary, Toaster)
      styles/                     Dashboard-specific CSS
```

### Data Flow

```
Browser hooks (useWeatherApp)
  → weatherApiClient (fetch /api/v1/*)
    → Next.js API routes (validate + rate limit + auth)
      → weatherFacade (cache → provider → aggregate → hint overlay)
        → WeatherProviderPort adapter (OpenWeather primary, Open-Meteo fallback)
```

### Key Patterns

- **WeatherProviderPort** (`features/weather/providers/`) — stable interface for weather data. Adapters in `openWeather/` and `openMeteo/` are swappable. `withFallbackWeatherProvider` composes primary+fallback.
- **Provider resolution** is a lazy singleton in `resolveWeatherProvider.ts` — OpenWeather primary with Open-Meteo fallback when `OPENWEATHER_API_KEY` is set, Open-Meteo alone otherwise.
- **Cache key** is `lat:lon:units`. Display name (city name) is overlaid post-cache so identical coordinates share one upstream hit.
- **View model** (`weatherDashboardViewModel.ts`) derives UI state (`showLoadingSpinner`, `controlsDisabled`, `weatherContentKey`) from hook state — components stay purely presentational.

### State Management

No global store. All state lives in two composable hooks assembled by `useWeatherApp`:

- `useWeatherLoader` — weather data, units, loading state
- `useWeatherSearch` — city search query, candidates, selection

### Testing Structure

- `tests/core/` — pure logic (forecast aggregation, rate limiting, caching, fallback provider, view model)
- `tests/components/` — React Testing Library renders
- `tests/api/` — API route query parsing
- `tests/e2e/` — Playwright with mocked external APIs via `page.route()`

### Environment

Copy `.env.example` to `.env.local`. All config is centralized in `src/config/appConfig.ts` — never read `process.env` directly elsewhere. `APP_ACCESS_TOKEN` gates the app behind `/auth` login when set; leave empty for open access.
