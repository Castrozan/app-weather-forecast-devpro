'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';

import { createAppQueryClient } from '@/lib/queryClient';

import { WeatherDashboardErrorFallback } from './WeatherDashboardErrorFallback';

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={WeatherDashboardErrorFallback}>{children}</ErrorBoundary>
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
    </QueryClientProvider>
  );
};
