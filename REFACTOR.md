# Refactor Plan — React Weak Points

Each item below is a concrete weakness identified from a senior React engineer code review.
Items are ordered from most impactful to least. Each item must be fixed, tested, and committed
before moving to the next.

---

## 1. `useWeatherApp` violates Single Responsibility Principle

**Problem**: One hook manages six distinct concerns: initialization, lazy geolocation bootstrap,
city search, weather loading, unit switching, and status messages. ~260 lines, a single `useEffect`
doing initialization + geo + cleanup, and a `loadWeatherForCity` callback that lives between them.
Any change to geolocation logic forces you to navigate past search code, and vice versa.

**Fix**: Split into focused hooks composed by `useWeatherApp`:

- `useWeatherLoader` — weather mutation, `loadWeatherForCity`, unit switching
- `useWeatherSearch` — city search mutation, `search()`, `selectCity()`, candidate list
- `useGeolocationBootstrap` — one-time init + lazy geo timer, depends on both of the above
- `useWeatherApp` — composes all three, returns the flat `WeatherAppState` surface

**Files**:

- Create `src/hooks/useWeatherLoader.ts`
- Create `src/hooks/useWeatherSearch.ts`
- Create `src/hooks/useGeolocationBootstrap.ts`
- Rewrite `src/hooks/useWeatherApp.ts` to compose
- Add `tests/hooks/use-weather-loader.test.ts`
- Add `tests/hooks/use-weather-search.test.ts`

---

## 2. `WeatherDashboard` computes derived state that belongs in the hook

**Problem**: Five derived values are computed inline inside the component body:
`searchStatusMessage`, `weatherStatusMessage`, `hasTransientStatus`, `shouldShowSkeleton`,
`weatherContentKey`. These are view-logic decisions, not render decisions. They make the
component harder to test (logic is trapped in JSX context) and they import status predicates
directly into a component that should be purely structural.

**Fix**: Move all five derived values into a selector function `selectWeatherDashboardViewModel`
in `src/hooks/useWeatherApp.ts` (or a dedicated `src/lib/weatherDashboardViewModel.ts`).
The component calls the selector, receives a typed view model, and only renders.
`WeatherDashboard` imports nothing from `statusMessage.ts`.

**Files**:

- Create `src/lib/weatherDashboardViewModel.ts`
- Rewrite `src/components/shared/WeatherDashboard.tsx`
- Add `tests/core/weather-dashboard-view-model.test.ts`

---

## 3. `unitSymbol` duplicated across `CurrentWeatherPanel` and `ForecastCard`

**Problem**: Identical pure function defined twice. Same logic, two locations, two places to
update if the mapping ever changes. Classic DRY violation.

**Fix**: Extract to `src/lib/weatherUnits.ts` with `temperatureUnitSymbol` and `windSpeedUnitLabel`.
Both components import from that module. Remove the local definitions.

**Files**:

- Create `src/lib/weatherUnits.ts`
- Update `src/components/weather/CurrentWeatherPanel.tsx`
- Update `src/components/weather/ForecastCard.tsx`
- Add `tests/core/weather-units.test.ts`

---

## 4. `QueryClient` config hardcoded inside `AppProviders` component

**Problem**: `retry: 1` and `refetchOnWindowFocus: false` are hardcoded inline inside the
component. Config is not testable in isolation and not centrally controlled.
If another part of the app needs to reference query defaults, there is no single source of truth.

**Fix**: Extract `createAppQueryClient()` factory to `src/lib/queryClient.ts`.
`AppProviders` calls the factory. Config is independently importable and testable.

**Files**:

- Create `src/lib/queryClient.ts`
- Update `src/components/shared/AppProviders.tsx`
- Add `tests/core/query-client.test.ts`

---

## 5. `NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT` read with unsafe cast inside component render

**Problem**: `process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE_UNIT as TemperatureUnit | undefined`
is an unsafe cast — any non-`'metric'`/`'imperial'` value silently passes through as an
invalid `TemperatureUnit`. The env variable is also read in component render, not validated
at startup. All other env vars are validated in `src/lib/config.ts`.

**Fix**: Add `defaultTemperatureUnit` to `appConfig` in `src/lib/config.ts` with Zod validation
that coerces unknown values to `'metric'`. Since this is a `NEXT_PUBLIC_` var it must be read
client-side, but the validation logic should be centralized. The server component `page.tsx`
reads the validated value and passes it as a prop to `WeatherDashboard`. Component no longer
reads `process.env` directly.

**Files**:

- Update `src/lib/config.ts` — add `clientConfig` with validated `defaultTemperatureUnit`
- Update `src/app/page.tsx` — pass `defaultUnit` prop to `WeatherDashboard`
- Update `src/components/shared/WeatherDashboard.tsx` — accept and forward `defaultUnit` prop

---

## 6. `StatusState` has no ARIA live region — status changes are invisible to screen readers

**Problem**: `StatusState` renders a `<p>` that appears/disappears dynamically (search results,
errors, loading states). Without `aria-live`, screen reader users have no indication the app
responded to their search. This is a WCAG 2.1 Level AA failure (SC 4.1.3 Status Messages).

**Fix**: Add `aria-live="polite"` to the container. For errors, use `role="alert"` which
implies `aria-live="assertive"`. This ensures the message is announced when it changes
without requiring focus to move.

**Files**:

- Update `src/components/shared/StatusState.tsx`
- Update `tests/components/status-state.test.tsx` (new test file)

---

## 7. `loadWeatherForCity` in `useEffect` dep array causes effect instability

**Problem**: `loadWeatherForCity` is a `useCallback` that depends on `weatherMutation`.
`weatherMutation` is a new object on every render (React Query behavior), so
`loadWeatherForCity` is technically recreated every render, causing the `useEffect` to
re-register on every render. The `hasInitializedRef` guard happens to prevent observable
bugs, but the effect runs and re-runs silently. The guard is load-bearing for correctness —
remove it and the app double-initializes.

**Fix**: This is resolved structurally by item 1 (hook split). `useGeolocationBootstrap`
receives `loadWeatherForCity` as a stable parameter (passed in as an argument with a stable
ref pattern) rather than closing over it. The `useEffect` dep array becomes `[]`.

**Note**: This item is completed as a side effect of item 1. No standalone fix needed.

---

## Execution Order

1. Item 3 — `weatherUnits.ts` (small, isolated, no dependencies)
2. Item 4 — `queryClient.ts` (small, isolated)
3. Item 6 — `StatusState` aria-live (small, isolated)
4. Item 5 — env validation in `config.ts` + prop threading
5. Item 2 — `weatherDashboardViewModel.ts` (depends on items 3, 5, 6 being done)
6. Item 1 — hook split (largest, depends on item 2 being done so dashboard is stable)
   (Item 7 resolved by item 1)
