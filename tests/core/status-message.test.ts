import { describe, expect, it } from 'vitest';

import type { StatusMessage } from '@/lib/statusMessage';
import {
  isErrorStatusMessage,
  isSearchStatusMessage,
  isTransientStatusMessage,
} from '@/lib/statusMessage';

const msg = (kind: StatusMessage['kind']): StatusMessage => ({ kind, text: '' });

describe('status message helpers', () => {
  it('classifies search-loading as transient', () => {
    expect(isTransientStatusMessage(msg('search-loading'))).toBe(true);
  });

  it('does not classify non-loading messages as transient', () => {
    expect(isTransientStatusMessage(msg('search-info'))).toBe(false);
    expect(isTransientStatusMessage(msg('search-error'))).toBe(false);
    expect(isTransientStatusMessage(msg('weather-error'))).toBe(false);
  });

  it('classifies error kinds as error messages', () => {
    expect(isErrorStatusMessage(msg('search-error'))).toBe(true);
    expect(isErrorStatusMessage(msg('weather-error'))).toBe(true);
  });

  it('does not classify non-error kinds as error', () => {
    expect(isErrorStatusMessage(msg('search-info'))).toBe(false);
    expect(isErrorStatusMessage(msg('search-loading'))).toBe(false);
  });

  it('classifies search-scoped kinds as search status', () => {
    expect(isSearchStatusMessage(msg('search-loading'))).toBe(true);
    expect(isSearchStatusMessage(msg('search-info'))).toBe(true);
    expect(isSearchStatusMessage(msg('search-error'))).toBe(true);
  });

  it('does not classify weather-error as search status', () => {
    expect(isSearchStatusMessage(msg('weather-error'))).toBe(false);
  });
});
