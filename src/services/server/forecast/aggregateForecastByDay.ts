import type { WeatherProviderForecastEntry } from '@/services/server/weather/ports/weatherProvider';

export type AggregatedForecastDay = {
  date: string;
  min: number;
  max: number;
  icon: string;
  description: string;
};

type GroupedDay = {
  date: string;
  min: number;
  max: number;
  entries: WeatherProviderForecastEntry[];
};

const toLocalDateKey = (timestampSeconds: number, timezoneOffsetSeconds: number): string => {
  const localDate = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);
  return localDate.toISOString().slice(0, 10);
};

const toLocalHour = (timestampSeconds: number, timezoneOffsetSeconds: number): number => {
  const localDate = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);
  return localDate.getUTCHours();
};

const pickRepresentativeEntry = (
  entries: WeatherProviderForecastEntry[],
  timezoneOffsetSeconds: number,
): WeatherProviderForecastEntry => {
  const midday = entries.find((entry) => {
    const hour = toLocalHour(entry.timestampSeconds, timezoneOffsetSeconds);
    return hour >= 11 && hour <= 14;
  });

  if (midday) {
    return midday;
  }

  const daytime = entries.find((entry) => entry.isDaylight);

  if (daytime) {
    return daytime;
  }

  return entries[0];
};

export const aggregateForecastByDay = (
  entries: WeatherProviderForecastEntry[],
  timezoneOffsetSeconds: number,
  days = 5,
): AggregatedForecastDay[] => {
  const grouped = new Map<string, GroupedDay>();

  for (const entry of entries) {
    const dateKey = toLocalDateKey(entry.timestampSeconds, timezoneOffsetSeconds);
    const existing = grouped.get(dateKey);

    if (!existing) {
      grouped.set(dateKey, {
        date: dateKey,
        min: entry.minTemperature,
        max: entry.maxTemperature,
        entries: [entry],
      });
      continue;
    }

    existing.min = Math.min(existing.min, entry.minTemperature);
    existing.max = Math.max(existing.max, entry.maxTemperature);
    existing.entries.push(entry);
  }

  return [...grouped.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, days)
    .map((day) => {
      const representative = pickRepresentativeEntry(day.entries, timezoneOffsetSeconds);

      return {
        date: day.date,
        min: day.min,
        max: day.max,
        icon: representative.icon,
        description: representative.description,
      };
    });
};
