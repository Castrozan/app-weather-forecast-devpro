export type OpenWeatherForecastEntry = {
  dt: number;
  main: {
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    icon: string;
    description: string;
  }>;
};

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
  entries: OpenWeatherForecastEntry[];
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
  entries: OpenWeatherForecastEntry[],
  timezoneOffsetSeconds: number,
): OpenWeatherForecastEntry => {
  const midday = entries.find((entry) => {
    const hour = toLocalHour(entry.dt, timezoneOffsetSeconds);
    return hour >= 11 && hour <= 14;
  });

  if (midday) {
    return midday;
  }

  const daytime = entries.find((entry) => entry.weather[0]?.icon.endsWith('d'));

  if (daytime) {
    return daytime;
  }

  return entries[0];
};

export const aggregateForecastByDay = (
  entries: OpenWeatherForecastEntry[],
  timezoneOffsetSeconds: number,
  days = 5,
): AggregatedForecastDay[] => {
  const grouped = new Map<string, GroupedDay>();

  for (const entry of entries) {
    const dateKey = toLocalDateKey(entry.dt, timezoneOffsetSeconds);
    const existing = grouped.get(dateKey);

    if (!existing) {
      grouped.set(dateKey, {
        date: dateKey,
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        entries: [entry],
      });
      continue;
    }

    existing.min = Math.min(existing.min, entry.main.temp_min);
    existing.max = Math.max(existing.max, entry.main.temp_max);
    existing.entries.push(entry);
  }

  return [...grouped.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, days)
    .map((day) => {
      const representative = pickRepresentativeEntry(day.entries, timezoneOffsetSeconds);
      const firstWeather = representative.weather[0] ?? {
        icon: '01d',
        description: 'clear sky',
      };

      return {
        date: day.date,
        min: day.min,
        max: day.max,
        icon: firstWeather.icon,
        description: firstWeather.description,
      };
    });
};
