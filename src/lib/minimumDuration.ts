const wait = async (durationMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

export const withMinimumDuration = async <T>(
  task: () => Promise<T>,
  minimumDurationMs: number,
): Promise<T> => {
  const startedAt = Date.now();

  try {
    return await task();
  } finally {
    const elapsedMs = Date.now() - startedAt;
    const remainingMs = minimumDurationMs - elapsedMs;

    if (remainingMs > 0) {
      await wait(remainingMs);
    }
  }
};
