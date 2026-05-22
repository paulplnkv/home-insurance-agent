import type { Metadata } from 'next';
import { Commissioner, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const commissioner = Commissioner({
  variable: '--font-commissioner',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Claims Workbench',
  description: 'AI-assisted adjuster workbench for homeowners claims.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${commissioner.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-muted/40 font-sans">{children}</body>
    </html>
  );
}
