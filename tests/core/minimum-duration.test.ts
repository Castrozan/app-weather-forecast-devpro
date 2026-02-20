import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withMinimumDuration } from '@/lib/minimumDuration';

describe('withMinimumDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits until the minimum duration when the task resolves early', async () => {
    let settled = false;
    const promise = withMinimumDuration(async () => 'ok', 500).then((value) => {
      settled = true;
      return value;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe('ok');
  });

  it('does not add extra delay when the task is already slower than the minimum duration', async () => {
    let settled = false;
    const promise = withMinimumDuration(
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('slow'), 700);
        }),
      500,
    ).then((value) => {
      settled = true;
      return value;
    });

    await vi.advanceTimersByTimeAsync(699);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe('slow');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('enforces the minimum duration even when the task rejects', async () => {
    let rejection: unknown = null;
    const promise = withMinimumDuration(async () => {
      throw new Error('boom');
    }, 500).then(
      () => 'resolved',
      (error: unknown) => {
        rejection = error;
        return 'rejected';
      },
    );

    await vi.advanceTimersByTimeAsync(499);
    expect(rejection).toBeNull();

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe('rejected');
    expect(rejection).toBeInstanceOf(Error);
    expect((rejection as Error).message).toBe('boom');
  });
});
