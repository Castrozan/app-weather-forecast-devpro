import { FORECAST_DAYS } from '@/config/appConfig';
import type { WeatherProviderForecastEntry } from '@/features/weather/providers/weatherProviderPort';

import {
  convertUnixTimestampToLocalDateKey,
  convertUnixTimestampToLocalHour,
} from './timezoneConversion';

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

const pickRepresentativeEntry = (
  entries: WeatherProviderForecastEntry[],
  timezoneOffsetSeconds: number,
): WeatherProviderForecastEntry => {
  const midday = entries.find((entry) => {
    const hour = convertUnixTimestampToLocalHour(entry.timestampSeconds, timezoneOffsetSeconds);
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
  days = FORECAST_DAYS,
): AggregatedForecastDay[] => {
  const grouped = new Map<string, GroupedDay>();

  for (const entry of entries) {
    const dateKey = convertUnixTimestampToLocalDateKey(
      entry.timestampSeconds,
      timezoneOffsetSeconds,
    );
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
