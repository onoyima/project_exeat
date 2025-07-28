import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Veritas University - Digital Exeat System',
  description: 'Digital platform for managing student exeat applications and approvals at Veritas University',
  keywords: 'Veritas University, Exeat, Digital System, Student Portal',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#114629',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/veritas-logo.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="//localhost:8000" />
        <link rel="preconnect" href="//localhost:8000" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-university-light">
          {children}
        </div>
      </body>
    </html>
  );
}