'use client';

import { ErrorBoundary } from 'react-error-boundary';

import type { TemperatureUnit } from '@/types/weather';

import { WeatherDashboard } from './WeatherDashboard';
import { WeatherDashboardErrorFallback } from './WeatherDashboardErrorFallback';

type WeatherDashboardWithErrorBoundaryProps = {
  defaultUnit: TemperatureUnit;
};

export const WeatherDashboardWithErrorBoundary = ({
  defaultUnit,
}: WeatherDashboardWithErrorBoundaryProps) => {
  return (
    <ErrorBoundary FallbackComponent={WeatherDashboardErrorFallback}>
      <WeatherDashboard defaultUnit={defaultUnit} />
    </ErrorBoundary>
  );
};
