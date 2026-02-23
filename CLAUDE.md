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

**Styling:** Vanilla CSS with BEM-like classes split across `src/styles/` feature files + design tokens in `src/styles/tokens.css`. No Tailwind, no CSS Modules.

**Icons:** `lucide-react` for UI icons, `weather-icons` CSS font for weather conditions (mapped through `shared/icons/weatherIconClass.ts`).

**Animations:** `framer-motion` for enter/exit/stagger transitions. Config centralized in `src/shared/animation/`.

**Error UX:** `sonner` toasts for non-blocking errors. `react-error-boundary` in `AppProviders` for crash recovery.

### Directory Structure

```
src/
  app/                          Next.js routing (thin pages + API handlers)
    api/v1/                     API routes (auth, cities, weather)
  components/                   UI components by feature domain
    dashboard/                  App shell orchestrator + view model
    providers/                  App-level wiring (QueryClient, ErrorBoundary, Toaster)
    search/                     Search sidebar (form, candidates, disclaimer)
    weather/                    Weather display (current, forecast, skeleton, disclaimer)
  hooks/                        Client-side composable hooks
  lib/                          Configuration + client utilities
  services/                     Business logic
    client/                     Browser-side (API client, geolocation)
    server/                     Server-side (cache, cities, forecast, security, validation, weather)
  shared/                       Cross-cutting utilities (animation, icons)
  styles/                       CSS feature files + design tokens
  types/                        TypeScript types
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

- **WeatherProviderPort** (`services/server/weather/ports/`) — stable interface for weather data. Adapters in `adapters/` are swappable. `withFallbackWeatherProvider` composes primary+fallback.
- **Provider resolution** is a lazy singleton in `resolveWeatherProvider.ts` — OpenWeather primary with Open-Meteo fallback when `OPENWEATHER_API_KEY` is set, Open-Meteo alone otherwise.
- **Cache key** is `lat:lon:units`. Display name (city name or "Near You") is overlaid post-cache so identical coordinates share one upstream hit.
- **View model** (`weatherDashboardViewModel.ts`) derives UI state (`shouldShowSkeleton`, `controlsDisabled`, `weatherContentKey`) from hook state — components stay purely presentational.
- **Geolocation bootstrap** runs once on mount with a 1.6s delay, silently cancelled if user has interacted. If permission is already granted, it loads local weather immediately and skips the default city.
- **minimumDuration** wrapper ensures loading skeletons show for at least 500ms.

### State Management

No global store. All state lives in three composable hooks assembled by `useWeatherApp`:

- `useWeatherLoader` — weather data, units, loading state
- `useWeatherSearch` — city search query, candidates, selection
- `useGeolocationBootstrap` — one-time location detection on mount

### Testing Structure

- `tests/core/` — pure logic (forecast aggregation, rate limiting, caching, fallback provider, view model)
- `tests/components/` — React Testing Library renders
- `tests/api/` — API route query parsing
- `tests/e2e/` — Playwright with mocked external APIs via `page.route()`

### Environment

Copy `.env.example` to `.env.local`. All config is centralized in `src/lib/config.ts` — never read `process.env` directly elsewhere. `APP_ACCESS_TOKEN` gates the app behind `/auth` login when set; leave empty for open access.
