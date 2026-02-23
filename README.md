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
npm run verify       # format + lint + typecheck + 86 unit tests
npm run test:e2e     # 8 Playwright browser tests (mocked APIs)
npm run build        # production build
```

## Decisions

**Next.js API routes over a separate server** — the API layer is thin (rate limit, auth, Zod validation, delegate to facade). Hexagonal structure means `services/server/` extracts to standalone Node if needed — swap transport, domain stays untouched.

**Port/adapter weather providers** — `WeatherProviderPort` is a stable interface. OpenWeather and Open-Meteo are swappable adapters. Adding a provider means one file in `adapters/`, nothing else changes. Fallback is automatic and silent.

**In-memory cache and rate limiter** — correct for single-process deploys (Render). Interfaces are injectable — swap to Redis without touching the facade or routes.

**No global store** — three composable hooks feed a pure view model that derives all UI state. Components are presentational. Would only add a store if state needed to cross page boundaries.

**Geolocation with interaction guard** — fires 1.6s after mount, silently cancelled if the user has already typed. Avoids jarring city switches while still providing local weather for passive viewers.

**Post-cache location overlay** — cache key is `lat:lon:units`. Display name (searched city or "Near You") is applied after cache lookup, so identical coordinates from different paths share one upstream hit.
