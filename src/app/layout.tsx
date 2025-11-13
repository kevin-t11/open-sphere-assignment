import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Open Sphere | Visa Evaluation Intelligence',
  description:
    'Modern visa-readiness scoring that blends pragmatic immigration criteria with document intelligence.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} bg-background text-foreground min-h-screen font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
