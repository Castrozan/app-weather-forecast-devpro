import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { WeatherDashboard } from '@/components/shared/WeatherDashboard';
import { appConfig } from '@/lib/config';
import { APP_SESSION_COOKIE } from '@/services/server/security/accessToken';

export default async function Home() {
  if (appConfig.appAccessToken) {
    const cookieStore = await cookies();
    const session = cookieStore.get(APP_SESSION_COOKIE)?.value;

    if (!session) {
      redirect('/auth');
    }
  }

  return <WeatherDashboard />;
}
