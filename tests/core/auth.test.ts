import { describe, expect, it } from 'vitest';

import { isValidAccessToken } from '@/features/security/accessToken';

describe('isValidAccessToken', () => {
  it('returns true only for exact token match', () => {
    expect(isValidAccessToken('secret', 'secret')).toBe(true);
    expect(isValidAccessToken('secret', 'SECRET')).toBe(false);
    expect(isValidAccessToken('', 'secret')).toBe(false);
    expect(isValidAccessToken('secret', '')).toBe(false);
  });
});
