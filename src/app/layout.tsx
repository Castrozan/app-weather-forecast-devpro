import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';

import { AppProviders } from '@/components/shared/AppProviders';
import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
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
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
