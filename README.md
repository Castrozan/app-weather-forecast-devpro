# Weather Forecast

Search any city, see current conditions and a 5-day outlook.

## Setup

```bash
cp .env.example .env.local
npm install && npm run dev       # http://localhost:3000
```

Works immediately with no API key (Open-Meteo). Set `OPENWEATHER_API_KEY` for OpenWeather as primary with automatic fallback. `APP_ACCESS_TOKEN` optionally gates the app behind a login to protect provider APIs on public deploys.

## Verify

```bash
npm run verify       # format + lint + typecheck + unit tests
npm run test:e2e     # Playwright browser tests (mocked APIs)
npm run build        # production build
```

## Decisions

**Next.js API routes over a separate server** — the API layer is thin (auth, Zod validation, delegate to facade). Hexagonal structure means the service layer extracts to standalone Node if needed — swap transport, domain stays untouched.

**Port/adapter weather providers** — `WeatherProviderPort` is a stable interface. OpenWeather and Open-Meteo are swappable adapters. Adding a provider means one file in `adapters/`, nothing else changes. Fallback is automatic and silent.

**In-memory cache** — correct for single-process deploys. Interface is injectable — swap to Redis without touching the facade or routes.

**No global store** — two composable hooks feed a pure view model that derives all UI state. Components are presentational. Would only add a store if state needed to cross page boundaries.

**Post-cache location overlay** — cache key is `lat:lon:units`. Display name (searched city) is applied after cache lookup, so identical coordinates from different search paths share one upstream hit.
