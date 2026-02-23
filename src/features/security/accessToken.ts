export const APP_SESSION_COOKIE = 'app_session';

export const isValidAccessToken = (candidate: string, expected: string): boolean => {
  if (!candidate || !expected) {
    return false;
  }

  return candidate === expected;
};
