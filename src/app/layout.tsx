import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

import { AppProviders } from '@/components/shared/AppProviders';
import '@/styles/globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
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
      <body className={spaceGrotesk.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
