import { describe, expect, it, vi } from 'vitest';

import { requestUserCoordinates } from '@/features/geolocation/requestUserCoordinates';

describe('requestUserCoordinates', () => {
  it('returns null when browser geolocation is unavailable', async () => {
    const result = await requestUserCoordinates({});
    expect(result).toBeNull();
  });

  it('returns null when geolocation permission is denied', async () => {
    const getCurrentPosition = vi.fn();

    const result = await requestUserCoordinates({
      permissions: {
        query: vi.fn(async () => ({ state: 'denied' as const })),
      },
      geolocation: {
        getCurrentPosition,
      },
    });

    expect(result).toBeNull();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('resolves coordinates when browser returns a position', async () => {
    const result = await requestUserCoordinates({
      permissions: {
        query: vi.fn(async () => ({ state: 'granted' as const })),
      },
      geolocation: {
        getCurrentPosition: (onSuccess) => {
          onSuccess({
            coords: {
              latitude: 36.1699,
              longitude: -115.1398,
            } as GeolocationCoordinates,
          } as GeolocationPosition);
        },
      },
    });

    expect(result).toEqual({
      lat: 36.1699,
      lon: -115.1398,
    });
  });
});
