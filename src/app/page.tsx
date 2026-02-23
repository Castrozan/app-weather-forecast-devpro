import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { WeatherDashboard } from '@/features/dashboard/components/WeatherDashboard';
import { appConfig, clientConfig } from '@/config/appConfig';
import { APP_SESSION_COOKIE, isValidAccessToken } from '@/features/security/accessToken';

export default async function Home() {
  if (appConfig.appAccessToken) {
    const cookieStore = await cookies();
    const session = cookieStore.get(APP_SESSION_COOKIE)?.value ?? '';

    if (!isValidAccessToken(session, appConfig.appAccessToken)) {
      redirect('/auth');
    }
  }

  return <WeatherDashboard defaultUnit={clientConfig.defaultTemperatureUnit} />;
}
