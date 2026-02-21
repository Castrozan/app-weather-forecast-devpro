'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { createAppQueryClient } from '@/lib/queryClient';

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(createAppQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
