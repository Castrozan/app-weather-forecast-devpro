import { describe, expect, it } from 'vitest';

import { isErrorStatusMessage, isTransientStatusMessage } from '@/lib/statusMessage';

describe('status message helpers', () => {
  it('classifies loading and instructional messages as transient', () => {
    expect(isTransientStatusMessage('Loading weather...')).toBe(true);
    expect(isTransientStatusMessage('Loading local weather...')).toBe(true);
    expect(isTransientStatusMessage('Enter a city name to search.')).toBe(true);
    expect(isTransientStatusMessage('Search for a city to see weather details.')).toBe(true);
  });

  it('does not classify actionable status messages as transient', () => {
    expect(isTransientStatusMessage('Multiple matches found. Select the correct city.')).toBe(
      false,
    );
    expect(isTransientStatusMessage('No city found for this query.')).toBe(false);
  });

  it('classifies failures as error messages', () => {
    expect(isErrorStatusMessage('Unable to resolve city search at this time.')).toBe(true);
    expect(isErrorStatusMessage('No city found for this query.')).toBe(true);
  });

  it('does not classify neutral guidance as error', () => {
    expect(isErrorStatusMessage('Multiple matches found. Select the correct city.')).toBe(false);
    expect(isErrorStatusMessage('Loading weather...')).toBe(false);
  });
});
