type RateLimiterOptions = {
  windowMs: number;
  maxRequests: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export type InMemoryRateLimiter = {
  consume: (key: string, nowMs?: number) => RateLimitDecision;
};

export const createInMemoryRateLimiter = ({
  windowMs,
  maxRequests,
}: RateLimiterOptions): InMemoryRateLimiter => {
  const buckets = new Map<string, Bucket>();

  const consume = (key: string, nowMs = Date.now()): RateLimitDecision => {
    const current = buckets.get(key);

    if (!current || nowMs >= current.resetAt) {
      const next: Bucket = {
        count: 1,
        resetAt: nowMs + windowMs,
      };

      buckets.set(key, next);

      return {
        allowed: true,
        remaining: Math.max(maxRequests - 1, 0),
        resetAt: next.resetAt,
      };
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: current.resetAt,
      };
    }

    current.count += 1;

    return {
      allowed: true,
      remaining: Math.max(maxRequests - current.count, 0),
      resetAt: current.resetAt,
    };
  };

  return { consume };
};
