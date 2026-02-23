export const convertUnixTimestampToLocalDateKey = (
  timestampSeconds: number,
  timezoneOffsetSeconds: number,
): string => {
  return new Date((timestampSeconds + timezoneOffsetSeconds) * 1000).toISOString().slice(0, 10);
};

export const convertUnixTimestampToLocalHour = (
  timestampSeconds: number,
  timezoneOffsetSeconds: number,
): number => {
  return new Date((timestampSeconds + timezoneOffsetSeconds) * 1000).getUTCHours();
};
