import { describe, expect, it } from 'vitest';

import { createInMemoryRateLimiter } from '@/services/server/security/rateLimiter';
import { isValidAccessToken } from '@/services/server/security/accessToken';

describe('createInMemoryRateLimiter', () => {
  it('blocks requests after maxRequests inside the same window', () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 1_000, maxRequests: 2 });

    const first = limiter.consume('127.0.0.1', 0);
    const second = limiter.consume('127.0.0.1', 100);
    const third = limiter.consume('127.0.0.1', 200);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it('resets counters when time window expires', () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 1_000, maxRequests: 1 });

    const first = limiter.consume('127.0.0.1', 0);
    const second = limiter.consume('127.0.0.1', 100);
    const third = limiter.consume('127.0.0.1', 1_100);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(third.allowed).toBe(true);
  });
});

describe('isValidAccessToken', () => {
  it('returns true only for exact token match', () => {
    expect(isValidAccessToken('secret', 'secret')).toBe(true);
    expect(isValidAccessToken('secret', 'SECRET')).toBe(false);
    expect(isValidAccessToken('', 'secret')).toBe(false);
    expect(isValidAccessToken('secret', '')).toBe(false);
  });
});
