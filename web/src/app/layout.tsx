import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Inter, JetBrains_Mono } from 'next/font/google';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/content/site';
import './globals.css';

// Fonts are downloaded at build time and served from our own domain, so there is no extra request to Google.
const display = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono', display: 'swap' });

const TITLE = `${SITE.name} | Architectural Design, Structural & MEP | Wylie, Texas`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: TITLE,
    description: SITE.description,
    url: '/',
    locale: 'en_US',
    images: [{ url: '/logo.jpg', width: 400, height: 400, alt: `${SITE.name} logo` }],
  },
  twitter: { card: 'summary', title: TITLE, description: SITE.description, images: ['/logo.jpg'] },
  robots: { index: true, follow: true },
  icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
};

export const viewport: Viewport = { themeColor: '#1b6b25', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS fade sections in only when scripts run; with no JavaScript everything stays visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <JsonLd />
      </head>
      <body data-theme="light">{children}</body>
    </html>
  );
}
