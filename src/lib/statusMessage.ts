const TRANSIENT_STATUS_PATTERN =
  /loading weather|loading local weather|searching cities|enter a city name to search|search for a city/i;

const SEARCH_STATUS_PATTERN =
  /searching cities|enter a city name to search|multiple matches found|no city found|city search/i;

const ERROR_STATUS_PATTERN =
  /unable|failed|unauthorized|not configured|temporarily unavailable|too many|invalid|required|no city/i;

export const isTransientStatusMessage = (message: string): boolean => {
  return TRANSIENT_STATUS_PATTERN.test(message);
};

export const isErrorStatusMessage = (message: string): boolean => {
  return ERROR_STATUS_PATTERN.test(message);
};

export const isSearchStatusMessage = (message: string): boolean => {
  return SEARCH_STATUS_PATTERN.test(message);
};
