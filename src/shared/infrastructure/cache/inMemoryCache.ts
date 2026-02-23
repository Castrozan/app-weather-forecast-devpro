type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type InMemoryTtlCache<T> = {
  get: (key: string, nowMs?: number) => T | null;
  set: (key: string, value: T, ttlSeconds: number, nowMs?: number) => void;
  clear: () => void;
};

export const createInMemoryTtlCache = <T>(): InMemoryTtlCache<T> => {
  const store = new Map<string, CacheEntry<T>>();

  const get = (key: string, nowMs = Date.now()): T | null => {
    const entry = store.get(key);

    if (!entry) {
      return null;
    }

    if (nowMs >= entry.expiresAt) {
      store.delete(key);
      return null;
    }

    return entry.value;
  };

  const set = (key: string, value: T, ttlSeconds: number, nowMs = Date.now()): void => {
    const expiresAt = nowMs + ttlSeconds * 1000;
    store.set(key, { value, expiresAt });
  };

  const clear = (): void => {
    store.clear();
  };

  return { get, set, clear };
};
