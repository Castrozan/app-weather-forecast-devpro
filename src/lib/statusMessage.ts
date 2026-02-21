export type StatusMessageKind = 'search-loading' | 'search-info' | 'search-error' | 'weather-error';

export type StatusMessage = {
  kind: StatusMessageKind;
  text: string;
};

export const isSearchStatusMessage = (message: StatusMessage): boolean => {
  return (
    message.kind === 'search-loading' ||
    message.kind === 'search-info' ||
    message.kind === 'search-error'
  );
};

export const isTransientStatusMessage = (message: StatusMessage): boolean => {
  return message.kind === 'search-loading';
};

export const isErrorStatusMessage = (message: StatusMessage): boolean => {
  return message.kind === 'search-error' || message.kind === 'weather-error';
};
