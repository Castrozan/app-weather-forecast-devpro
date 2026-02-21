import { describe, expect, it } from 'vitest';

import { createAppQueryClient } from '@/lib/queryClient';

describe('createAppQueryClient', () => {
  it('creates a QueryClient with retry set to 1', () => {
    const queryClient = createAppQueryClient();
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.retry).toBe(1);
  });

  it('creates a QueryClient with refetchOnWindowFocus disabled', () => {
    const queryClient = createAppQueryClient();
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('returns a new QueryClient instance on each call', () => {
    const firstClient = createAppQueryClient();
    const secondClient = createAppQueryClient();

    expect(firstClient).not.toBe(secondClient);
  });
});
