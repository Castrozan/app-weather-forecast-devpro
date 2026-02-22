'use client';

import type { FallbackProps } from 'react-error-boundary';

export const WeatherDashboardErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <main className="app-shell">
      <div className="error-fallback">
        <h1 className="error-fallback-title">Something went wrong</h1>
        <p className="error-fallback-message">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <button type="button" className="button" onClick={resetErrorBoundary}>
          Try again
        </button>
      </div>
    </main>
  );
};
