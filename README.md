# App Weather Forecast

Frontend-first weather app built with Next.js, with minimal API routes and clear service boundaries so the backend layer can be extracted later.
The upstream provider is Open-Meteo (no API key required for this challenge).

## Prerequisites

- Node 24
- npm 10+
- Optional: `devenv` + `direnv`

## Setup

```bash
cp .env.example .env.local
npm ci
npm run dev
```

## devenv workflow

```bash
direnv allow
# shell loads Node 24 from devenv.nix
npm ci
npm run dev
```

## Quality checks

```bash
npm run verify
npm run test:e2e
```

## TDD-first core coverage

- forecast aggregation (`min/max`, timezone grouping)
- city deduplication and candidate selection
- auth token validation
- in-memory rate limiting
- weather response caching
- API weather query validation
- Playwright integration/e2e coverage for search flow and unit toggle

## Deployment

- Target: Render
- CI: GitHub Actions workflow in `.github/workflows/ci.yml`

See `APPROACH.md` for full architecture and implementation plan.
