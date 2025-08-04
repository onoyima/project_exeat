import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Veritas University Digital Exeat System',
  description: 'Digital platform for managing student exeat applications and approvals at Veritas University',
  keywords: 'Veritas University, Exeat, Digital System, Student Portal',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen bg-university-light">
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}