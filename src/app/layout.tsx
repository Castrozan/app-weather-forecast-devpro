import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppProviders } from '@/components/shared/AppProviders';
import 'weather-icons/css/weather-icons.min.css';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Weather Forecast',
  description: 'Weather forecast application challenge',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
