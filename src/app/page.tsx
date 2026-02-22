import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { WeatherDashboardWithErrorBoundary } from '@/components/shared/WeatherDashboardWithErrorBoundary';
import { appConfig, clientConfig } from '@/lib/config';
import { APP_SESSION_COOKIE, isValidAccessToken } from '@/services/server/security/accessToken';

export default async function Home() {
  if (appConfig.appAccessToken) {
    const cookieStore = await cookies();
    const session = cookieStore.get(APP_SESSION_COOKIE)?.value ?? '';

    if (!isValidAccessToken(session, appConfig.appAccessToken)) {
      redirect('/auth');
    }
  }

  return <WeatherDashboardWithErrorBoundary defaultUnit={clientConfig.defaultTemperatureUnit} />;
}
