type WeatherVisual = {
  description: string;
  icon: string;
};

const codeDescription: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'rime fog',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'dense drizzle',
  56: 'light freezing drizzle',
  57: 'freezing drizzle',
  61: 'light rain',
  63: 'rain',
  65: 'heavy rain',
  66: 'light freezing rain',
  67: 'freezing rain',
  71: 'light snow',
  73: 'snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'light rain showers',
  81: 'rain showers',
  82: 'heavy rain showers',
  85: 'light snow showers',
  86: 'snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with hail',
  99: 'severe thunderstorm with hail',
};

const resolveIconBase = (weatherCode: number): string => {
  if (weatherCode === 0) {
    return '01';
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return '02';
  }

  if (weatherCode === 3) {
    return '04';
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return '50';
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return '09';
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return '10';
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return '13';
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return '11';
  }

  return '01';
};

export const mapWeatherCodeToVisual = (weatherCode: number, isDaylight: boolean): WeatherVisual => {
  const base = resolveIconBase(weatherCode);

  return {
    description: codeDescription[weatherCode] ?? 'clear sky',
    icon: `${base}${isDaylight ? 'd' : 'n'}`,
  };
};
